"use client";

import Link from "next/link";
import { Compass } from "lucide-react";

export default function ExplorePage() {
  return (
    <div className="flex items-center justify-center h-[80vh] px-6">
      <div className="text-center max-w-lg">

        <div className="w-28 h-28 mx-auto rounded-full bg-red-100 flex items-center justify-center shadow-md mb-6">
          <Compass size={55} className="text-red-600" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Explore is Coming Soon 🚀
        </h1>

        <p className="text-gray-500 text-lg mb-8">
          Discover trending videos, gaming, music, news and much more.
          We&apos;re working hard to bring you an amazing Explore experience.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-medium transition-all duration-300"
          >
            🏠 Back to Home
          </Link>

          
        </div>

      </div>
    </div>
  );
}