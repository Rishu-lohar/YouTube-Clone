"use client";

import { useEffect } from "react";
import {
  ThemeProvider as NextThemeProvider,
  useTheme,
} from "next-themes";
import { useUser } from "@/lib/AuthContext";

type Props = {
  children: React.ReactNode;
};

function ThemeHandler() {
  const { user } = useUser();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (user?.theme) {
      setTheme(user.theme);
    }
  }, [user]);

  return null;
}

export default function ThemeProvider({ children }: Props) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <ThemeHandler />
      {children}
    </NextThemeProvider>
  );
}