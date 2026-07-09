"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import BottomNavigation from "./BottomNavigation";

interface Props {
  children: React.ReactNode;
}

export default function MainLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-64 z-40">
        <Sidebar />
      </div>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />

          {/* Drawer */}
          <div className="fixed left-0 top-0 h-screen w-72 z-50 lg:hidden animate-in slide-in-from-left duration-300">
            <Sidebar mobile closeSidebar={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        <Navbar openSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 xl:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Bottom Navigation hanya di Mobile */}
      <div className="lg:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}
