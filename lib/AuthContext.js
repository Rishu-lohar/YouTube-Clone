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
      const result = await signInWithPopup(
        auth,
        provider
      );

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

      login(response.data.result);
    } catch (error) {
      console.error(error);
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
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseuser) => {
        if (!firebaseuser) return;

        try {
          const payload = {
            email: firebaseuser.email,
            name: firebaseuser.displayName,
            image:
              firebaseuser.photoURL ||
              "https://github.com/shadcn.png",
          };

          const response =
            await axiosInstance.post(
              "/user/login",
              payload
            );

          login(response.data.result);
        } catch (error) {
          console.error(error);
          logout();
        }
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        handlegooglesignin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () =>
  useContext(UserContext);           