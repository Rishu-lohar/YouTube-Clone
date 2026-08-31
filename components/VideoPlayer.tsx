"use client";


import { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  SkipForward
} from "lucide-react";
import { getVideoSrc } from "@/lib/videoSrc";

type VideoPlayerProps = {
  videoPath: string;
  onNext?: () => void;
};

export default function VideoPlayer({
  videoPath,
  onNext,
}: VideoPlayerProps) {
  const src = getVideoSrc(videoPath);

  const videoRef = useRef<HTMLVideoElement>(null);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastTap = useRef(0);

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);



  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      try {
        await videoRef.current.play();
      }
      catch (err) {
        console.log(err);
      }
    }
    else {
      videoRef.current.pause();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!videoRef.current) return;

    const value = Number(e.target.value);

    videoRef.current.currentTime =
      (value / 100) * duration;

    setProgress(value);
  };

  const handleBackward = () => {
    if (!videoRef.current) return;

    videoRef.current.currentTime = Math.max(
      videoRef.current.currentTime - 10,
      0
    );
  };

  const handleForward = () => {
    if (!videoRef.current) return;

    videoRef.current.currentTime = Math.min(
      videoRef.current.currentTime + 10,
      duration
    );
  };

  const handleVolume = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!videoRef.current) return;

    const value = Number(e.target.value);

    videoRef.current.volume = value;
    setVolume(value);

    if (value === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const handleMute = () => {
    if (!videoRef.current) return;

    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  const handleDoubleTap = (
    e: React.TouchEvent<HTMLDivElement>
  ) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      if (!videoRef.current) return;

      const width = e.currentTarget.clientWidth;
      const touchX = e.changedTouches[0].clientX;

      if (touchX < width / 2) {
        handleBackward();
      } else {
        handleForward();
      }
    }

    lastTap.current = now;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          handlePlayPause();
          break;

        case "ArrowLeft":
          handleBackward();
          break;

        case "ArrowRight":
          handleForward();
          break;

        case "m":
        case "M":
          handleMute();
          break;

        case "f":
        case "F":
          handleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    isPlaying,
    isMuted,
    duration,
  ]);

  const handleVideoClick = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;

      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;

      if (clickX < rect.width / 2) {
        handleBackward();
      } else {
        handleForward();
      }

      return;
    }

    clickTimeout.current = setTimeout(() => {
      handlePlayPause();
      clickTimeout.current = null;
    }, 250);
  };
  return (
    <div
      className="relative aspect-video bg-black rounded-lg overflow-hidden"
      onClick={handleVideoClick}
      onTouchEnd={handleDoubleTap}
    >

      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"

        onEnded={() => {
          if (onNext) {
            onNext();
          }
        }}

        onLoadStart={() => setIsLoading(true)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onCanPlay={() => setIsLoading(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}

        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
          }
          setIsLoading(false);
        }}
        onTimeUpdate={() => {
          if (!videoRef.current) return;

          setCurrentTime(videoRef.current.currentTime);

          setProgress(
            (videoRef.current.currentTime /
              videoRef.current.duration) *
            100
          );
        }}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-16 left-4 right-4">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="w-full cursor-pointer"
        />
      </div>

      {onNext && (
        <button
          onClick={onNext}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          Next Video ▶
        </button>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">

        {/* Backward */}
        <button
          onClick={handleBackward}
          className="bg-black/70 hover:bg-black/90 transition text-white p-3 rounded-full"
        >
          <RotateCcw size={20} />
        </button>

        {/* Play */}
        <button
          onClick={handlePlayPause}
          className="bg-black/70 hover:bg-black/90 transition text-white p-3 rounded-full"
        >
          {isPlaying ? (
            <Pause size={22} />
          ) : (
            <Play size={22} />
          )}
        </button>

        {/* Forward */}
        <button
          onClick={handleForward}
          className="bg-black/70 hover:bg-black/90 transition text-white p-3 rounded-full"
        >
          <RotateCw size={20} />
        </button>

        {/* Time */}
        <p className="text-white text-sm font-medium">
          {formatTime(currentTime)} / {formatTime(duration)}
        </p>

        {/* Push remaining controls to right */}
        <div className="flex-1" />

        {/* Mute */}
        <button
          onClick={handleMute}
          className="bg-black/70 hover:bg-black/90 transition text-white p-3 rounded-full"
        >
          {isMuted ? (
            <VolumeX size={20} />
          ) : (
            <Volume2 size={20} />
          )}
        </button>

        {/* Volume Slider */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolume}
          className="w-24 cursor-pointer"
        />

        {/* Fullscreen */}
        <button
          onClick={handleFullscreen}
          className="bg-black/70 hover:bg-black/90 transition text-white p-3 rounded-full"
        >
          <Maximize size={20} />
        </button>

        {/* SkipForward */}
        <button
          onClick={onNext}
          className="bg-black/70 hover:bg-black/90 transition text-white p-3 rounded-full"
        >
          <SkipForward size={20} />
        </button>

      </div>

    </div>
  );
}