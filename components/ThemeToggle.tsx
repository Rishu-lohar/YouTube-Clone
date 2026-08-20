"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { user, login } = useUser();

  const handleThemeChange = async () => {
    if (!user) return;

    const currentTheme = theme;
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    // Instant UI update
    setTheme(newTheme);

    try {
      const res = await axiosInstance.patch(
        `/user/theme/${user._id}`,
        {
          theme: newTheme,
        }
      );

      login(res.data);
    } catch (error) {
      console.error(error);

      // Backend fail hua to old theme restore
      setTheme(currentTheme);
    }
  };

  return (
    <button
      onClick={handleThemeChange}
      className="rounded-full p-2 hover:bg-accent transition-colors"
    >
      {theme === "dark" ? (
        <Sun size={22} />
      ) : (
        <Moon size={22} />
      )}
    </button>
  );
}