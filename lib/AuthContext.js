import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth, provider } from "./firebase";
import axiosInstance from "./axiosinstance";

// Create Context
const UserContext = createContext();

// Provider Component
export const UserProvider = ({ children }) => {
  // Store Logged-in User
  const [user, setUser] = useState(null);

  // Google Login
  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      const response = await axiosInstance.post("/user/login", {
        email: result.user.email,
        name: result.user.displayName,
        image: result.user.photoURL,
      });

      setUser(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Check Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (currentUser) {
          try {
            const response = await axiosInstance.post("/user/login", {
              email: currentUser.email,
              name: currentUser.displayName,
              image: currentUser.photoURL,
            });

            setUser(response.data);
          } catch (error) {
            console.log(error);
          }
        } else {
          setUser(null);
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook
export const useUser = () => useContext(UserContext);