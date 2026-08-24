import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0,
  },
});

export default mongoose.models.OTPVerification ||
  mongoose.model("OTPVerification", otpVerificationSchema);