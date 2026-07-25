"use client";

import { useState } from "react";
import { formatDuration } from "@/lib/formatDuration";

type VideoThumbnailProps = {
  src: string;
  className?: string;
};

export default function VideoThumbnail({
  src,
  className = "",
}: VideoThumbnailProps) {
  const [duration, setDuration] = useState<number | null>(null);

  return (
    <div className="relative overflow-hidden rounded-lg bg-gray-100">
      <video
        src={src}
        className={className}
        preload="metadata"
        muted
        playsInline
        autoPlay
        loop
        onLoadedMetadata={(event) => {
          setDuration(event.currentTarget.duration);
        }}
      />

      {duration !== null && (
        <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-0.5 text-xs text-white">
          {formatDuration(duration)}
        </div>
      )}
    </div>
  );
}
