"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

export default function SubscriptionsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
      <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <Bell size={50} className="text-gray-500" />
      </div>

      <h1 className="text-3xl font-bold mb-3">
        No Subscriptions Yet
      </h1>

      <p className="text-gray-500 max-w-md mb-6">
        Subscribe to your favorite channels to see their latest videos here.
      </p>

      <Link
        href="/"
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition"
      >
        Explore Videos
      </Link>
    </div>
  );
}