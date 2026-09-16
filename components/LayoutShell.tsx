"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const LayoutShell = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <>
      <Header
        onMenuClick={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar isOpen={isSidebarOpen} />

        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </>
  );
};

export default LayoutShell;