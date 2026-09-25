import express from "express";
import mongoose from "mongoose";
import {
  login,
  updateProfile,
  updateProfileImage,
  updateTheme,
  verifyOTP,
} from "../controllers/auth.js";
import profileImageUpload from "../filehelper/profileImageUpload.js";

const routes = express.Router();

const validateProfileImageUserId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  return next();
};

routes.post("/login", login);
routes.post("/verify-otp", verifyOTP);
routes.patch("/update/:id", updateProfile);
routes.post(
  "/profile-image/:id",
  validateProfileImageUserId,
  profileImageUpload.single("image"),
  updateProfileImage
);
routes.patch("/theme/:id", updateTheme);

export default routes;