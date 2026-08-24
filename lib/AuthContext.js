"use client";

import {
  onAuthStateChanged,
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
  const [pendingUser, setPendingUser] = useState(null);

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
      };

      const response = await axiosInstance.post(
        "/user/login",
        payload
      );

      if (response.data.otpRequired) {
        setOtpEmail(response.data.email);
        setPendingUser(firebaseuser);
        setShowOtpDialog(true);
      }

    } catch (error) {
      console.error(error);
    }
  };

  const verifyOTP = async (otp) => {
    try {

      const res = await axiosInstance.post(
        "/user/verify-otp",
        {
          email: otpEmail,
          otp,
        }
      );

      login(res.data.result);

      setShowOtpDialog(false);

      setOtpEmail("");

      setPendingUser(null);

    } catch (error) {
      console.error(error);
      alert("Invalid OTP");
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

  // Auto Login
  useEffect(() => {
  const savedUser = localStorage.getItem("user");

  if (savedUser) {
    setUser(JSON.parse(savedUser));
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
      }}
      
    >
  { children }
    </UserContext.Provider >
  );
};

export const useUser = () =>
  useContext(UserContext);           