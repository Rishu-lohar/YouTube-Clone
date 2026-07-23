"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SearchResult from "@/components/SearchResult";

const SearchContent = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <div className="flex-1 p-4">
      <div className="max-w-6xl mx-auto">
        {query && (
          <div className="mb-6">
            <h1 className="text-xl font-medium">
              Search results for{" "}
              <span className="text-red-600">"{query}"</span>
            </h1>
          </div>
        )}

        <SearchResult query={query} />
      </div>
    </div>
  );
};

const SearchPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
};

export default SearchPage;