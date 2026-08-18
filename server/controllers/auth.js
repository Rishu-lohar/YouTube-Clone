import mongoose from "mongoose";
import User from "../Models/Auth.js";

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

    // Auto Theme
    const autoTheme =
      hour >= 10 && hour < 12 ? "light" : "dark";

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    // New User
    if (!existingUser) {
      const newUser = await User.create({
        email,
        name,
        image,
        theme: autoTheme,
      });

      return res.status(201).json({
        result: newUser,
      });
    }

    // Existing User
    
    if (!existingUser.theme) {
      existingUser.theme = autoTheme;
      await existingUser.save();
    }

    return res.status(200).json({
      result: existingUser,
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