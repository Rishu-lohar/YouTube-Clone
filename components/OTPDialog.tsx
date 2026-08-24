"use client";

import { useState } from "react";
import { useUser } from "@/lib/AuthContext";

export default function OTPDialog() {
  const {
    showOtpDialog,
    setShowOtpDialog,
    verifyOTP,
    otpEmail,
  } = useUser();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  if (!showOtpDialog) return null;

  const handleVerify = async () => {
    if (otp.length !== 6) {
      alert("Enter valid OTP");
      return;
    }

    setLoading(true);

    await verifyOTP(otp);

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">

      <div className="bg-background rounded-xl p-6 w-[400px] shadow-xl">

        <h2 className="text-2xl font-bold mb-2">
          OTP Verification
        </h2>

        <p className="text-muted-foreground mb-4">
          OTP sent to
        </p>

        <p className="font-medium mb-6">
          {otpEmail}
        </p>

        <input
          type="text"
          value={otp}
          maxLength={6}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full border rounded-lg p-3 mb-4"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full bg-red-600 text-white rounded-lg p-3"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          onClick={() => setShowOtpDialog(false)}
          className="w-full mt-3"
        >
          Cancel
        </button>

      </div>

    </div>
  );
}