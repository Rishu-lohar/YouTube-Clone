import mongoose from "mongoose";
import crypto from "crypto";

import User from "../Models/Auth.js";
import OTPVerification from "../Models/OTPVerification.js";
import sendEmail from "../utils/sendEmail.js";
import axios from "axios";

const getClientIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0] || req.socket.remoteAddress || "";

  return ip.replace(/^::ffff:/, "").trim();
};

const getLocation = async (ip) => {
  if (!ip || ["127.0.0.1", "::1"].includes(ip)) {
    return { city: "", state: "" };
  }

  try {
    const response = await axios.get(`http://ip-api.com/json/${encodeURIComponent(ip)}`, {
      params: { fields: "status,city,regionName" },
      timeout: 3000,
    });

    if (response.data.status !== "success") {
      return { city: "", state: "" };
    }

    return {
      city: response.data.city || "",
      state: response.data.regionName || "",
    };
  } catch (error) {
    console.error("Location lookup failed:", error.message);
    return { city: "", state: "" };
  }
};

// Login/Register User
export const login = async (req, res) => {
  const { email, name, image, device } = req.body;

  if (!email || !device) {
    return res.status(400).json({
      message: "Email and device information are required",
    });
  }

  try {
    // IST Time
    const hour = Number(
      new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        hour12: false,
      })
    );

    const autoTheme =
      hour >= 10 && hour < 12 ? "light" : "dark";

    // Find User
    let user = await User.findOne({ email });

    // Create New User
    if (!user) {
      user = await User.create({
        email,
        name,
        image,
        theme: autoTheme,
      });
    }

    // Set theme if missing
    if (!user.theme) {
      user.theme = autoTheme;
      await user.save();
    }

    const ip = getClientIp(req);
    const { city, state } = await getLocation(ip);

    // IP can change on the same device, so the login challenge is based on
    // the device and geographic location fingerprint.
    const newDevice =
      user.lastLoginDevice !== device ||
      user.lastLoginCity !== city ||
      user.lastLoginState !== state;

    // New Device -> Send OTP
    if (newDevice) {
      const otp = crypto
        .randomInt(100000, 999999)
        .toString();

      const expiresAt = new Date(
        Date.now() + 5 * 60 * 1000
      );

      await OTPVerification.deleteMany({
        email,
      });

      await OTPVerification.create({
        email,
        otp,
        expiresAt,
      });

      try {
        await sendEmail({
          to: email,
          subject: "YourTube Login Verification OTP",
          html: `
            <h2>YourTube Login Verification</h2>
            <p>Your OTP is:</p>
            <h1>${otp}</h1>
            <p>This OTP is valid for 5 minutes.</p>
            <p>If you didn't request this login, ignore this email.</p>
          `,
        });
      } catch {
        await OTPVerification.deleteMany({ email });
        return res.status(502).json({
          message: "Unable to send OTP email",
        });
      }

      return res.status(200).json({
        otpRequired: true,
        email,
        message: "OTP sent successfully",
      });
    }

    // Old Device -> Direct Login
    return res.status(200).json({
      result: user,
      message: "Login Successful",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  const { id } = req.params;
  const { channelname, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid User ID",
    });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          channelname,
          description,
        },
      },
      {
        new: true,
      }
    );

    return res.status(200).json(updatedUser);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Update Theme
export const updateTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const { theme } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid User ID",
      });
    }

    if (!["light", "dark"].includes(theme)) {
      return res.status(400).json({
        message: "Invalid Theme",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          theme,
        },
      },
      {
        new: true,
      }
    );

    return res.status(200).json(updatedUser);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTPVerification.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP not found",
      });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTPVerification.deleteMany({ email });

      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // OTP verified
    await OTPVerification.deleteMany({ email });

    const user = await User.findOne({ email });

    // Current IP
    const ip = getClientIp(req);
    const { city, state } = await getLocation(ip);
    const device = req.body.device;

    if (!user || !device) {
      return res.status(400).json({
        message: "User and device information are required",
      });
    }

    // Save verified device/location
    user.lastLoginIP = ip;
    user.lastLoginCity = city;
    user.lastLoginState = state;
    user.lastLoginDevice = device;
    user.isVerifiedDevice = true;

    await user.save();

    return res.status(200).json({
      message: "Login Successful",
      result: user,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};