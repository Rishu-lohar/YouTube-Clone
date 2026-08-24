import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/lib/AuthContext";
import ThemeProvider from "@/providers/ThemeProvider";
import OTPDialog from "@/components/OTPDialog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YouTube Clone",
  description: "YouTube Clone built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >


        {/* User Context */}
        <UserProvider>

          {/* Theme Provider */}
          <ThemeProvider>

            {/* Header */}
            <Header />

            {/* OTP Dialog */}
            <OTPDialog /> 

            {/* Sidebar + Current Page */}
            <div className="flex min-h-[calc(100vh-64px)]">
              <Sidebar />

              {/* Current Page */}
              <main className="flex-1 min-w-0">
                {children}
              </main>
            </div>

            {/* Toast */}
            <Toaster />
            
          </ThemeProvider>
        </UserProvider>

      </body>
    </html>
  );
}