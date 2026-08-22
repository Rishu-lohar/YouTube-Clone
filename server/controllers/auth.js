import mongoose from "mongoose";
import crypto from "crypto";

import User from "../Models/Auth.js";
import OTPVerification from "../Models/OTPVerification.js";
import sendEmail from "../utils/sendEmail.js";

// Login/Register User
export const login = async (req, res) => {
  const { email, name, image } = req.body;

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

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Expiry 5 Minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Delete old OTP
    await OTPVerification.deleteMany({ email });

    // Save new OTP
    await OTPVerification.create({
      email,
      otp,
      expiresAt,
    });

    // Send Email
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

    // Don't login yet
    return res.status(200).json({
      otpRequired: true,
      email,
      message: "OTP sent successfully",
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