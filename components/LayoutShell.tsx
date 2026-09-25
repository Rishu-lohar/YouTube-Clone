"use client";

import { useState, useSyncExternalStore } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

const subscribeToDesktopMedia = (callback: () => void) => {
  const media = window.matchMedia(DESKTOP_MEDIA_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};

const getDesktopSnapshot = () =>
  window.matchMedia(DESKTOP_MEDIA_QUERY).matches;

const getDesktopServerSnapshot = () => false;

const LayoutShell = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isDesktop = useSyncExternalStore(
    subscribeToDesktopMedia,
    getDesktopSnapshot,
    getDesktopServerSnapshot
  );
  const [sidebarOverride, setSidebarOverride] = useState<boolean | null>(null);
  const isSidebarOpen = sidebarOverride ?? isDesktop;

  return (
    <>
      <Header
        onMenuClick={() =>
          setSidebarOverride((prev) => !(prev ?? isDesktop))
        }
      />

      <div className="relative flex min-h-[calc(100vh-64px)]">
        <Sidebar isOpen={isSidebarOpen} />

        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </>
  );
};

export default LayoutShell;