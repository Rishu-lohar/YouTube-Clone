"use client";

import { useState } from "react";
import { useUser } from "@/lib/AuthContext";

export default function OTPDialog() {
  const {
    showOtpDialog,
    cancelOTP,
    verifyOTP,
    otpEmail,
  } = useUser();

  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState(false);

  if (!showOtpDialog) return null;

  const handleVerify = async () => {
    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      await verifyOTP(otp);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-100 rounded-2xl bg-background p-6 shadow-2xl border">

        <h2 className="text-2xl font-bold mb-2">
          OTP Verification
        </h2>

        <p className="text-muted-foreground mb-2">
          We&apos;ve sent a verification code to
        </p>

        <p className="font-semibold mb-6 break-all">
          {otpEmail}
        </p>

        <input
          autoFocus
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, ""))
          }
          placeholder="Enter 6-digit OTP"
          className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-red-500 mb-4"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full rounded-lg bg-red-600 p-3 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          onClick={cancelOTP}
          className="mt-3 w-full rounded-lg border p-3 hover:bg-accent"
        >
          Cancel
        </button>

      </div>
    </div>
  );
}