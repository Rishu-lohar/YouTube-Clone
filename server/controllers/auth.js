import mongoose from "mongoose";
import User from "../Models/Auth.js";

// Login/Register User
export const login = async (req, res) => {
  const { email, name, image } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      const newUser = await User.create({
        email,
        name,
        image,
      });

      return res.status(201).json({
        result: newUser,
      });
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
  // Get user ID from URL
  const { id } = req.params;

  // Get updated data from frontend
  const { channelname, description } = req.body;

  // Check if ID is valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      message: "Invalid User ID",
    });
  }

  try {
    // Update user profile
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