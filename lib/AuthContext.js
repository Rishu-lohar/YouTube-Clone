"use client";

import {
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  useState,
  useEffect,
  useContext,
  createContext,
} from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [otpEmail, setOtpEmail] = useState("");
  const [showOtpDialog, setShowOtpDialog] = useState(false);

  // Save User
  const login = (userdata) => {
    setUser(userdata);

    localStorage.setItem(
      "user",
      JSON.stringify(userdata)
    );

    if (userdata?.theme) {
      localStorage.setItem(
        "theme",
        userdata.theme
      );
    }
  };

  // Logout
  const logout = async () => {
    setUser(null);

    localStorage.removeItem("user");
    localStorage.removeItem("theme");

    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  // Google Login
  const handlegooglesignin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      const firebaseuser = result.user;

      const payload = {
        email: firebaseuser.email,
        name: firebaseuser.displayName,
        image:
          firebaseuser.photoURL ||
          "https://github.com/shadcn.png",

        device: navigator.userAgent,
      };

      const response = await axiosInstance.post(
        "/user/login",
        payload
      );

      if (response.data.otpRequired) {
        setOtpEmail(response.data.email);
        setShowOtpDialog(true);
      } else {
        login(response.data.result);
      }

    } catch (error) {
      console.error("Google sign-in failed:", error);
      await signOut(auth);
      alert(error.response?.data?.message || "Unable to sign in");
    }
  };

  const verifyOTP = async (otp) => {
    try {

      const res = await axiosInstance.post(
        "/user/verify-otp",
        {
          email: otpEmail,
          otp,
          device: navigator.userAgent,
        }
      );

      login(res.data.result);

      setShowOtpDialog(false);

      setOtpEmail("");

    } catch (error) {
      console.error("OTP verification failed:", error);
      alert(error.response?.data?.message || "Invalid OTP");
    }
  };

  const cancelOTP = async () => {
    setShowOtpDialog(false);
    setOtpEmail("");

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Unable to cancel sign-in:", error);
    }
  };

  // Restore saved theme instantly
  useEffect(() => {
    const savedTheme =
      localStorage.getItem("theme");

    if (savedTheme) {
      document.documentElement.classList.remove(
        "light",
        "dark"
      );

      document.documentElement.classList.add(
        savedTheme
      );
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        handlegooglesignin,
        verifyOTP,
        otpEmail,
        showOtpDialog,
        setShowOtpDialog,
        cancelOTP,
      }}

    >
      {children}
    </UserContext.Provider >
  );
};

export const useUser = () =>
  useContext(UserContext);           