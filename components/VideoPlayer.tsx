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
  onPlay?: () => void;
  onPause?: () => void;
  onSeek?: (time: number) => void;
  isRemoteUpdate?: boolean;
};

export default function VideoPlayer({
  videoPath,
  onNext,
  onPlay,
  onPause,
  onSeek,
  isRemoteUpdate = false,
}: VideoPlayerProps) {
  const src = getVideoSrc(videoPath);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastTap = useRef(0);

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      try {
        await videoRef.current.play();

        if (!isRemoteUpdate && onPlay) {
          onPlay();
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      videoRef.current.pause();

      if (!isRemoteUpdate && onPause) {
        onPause();
      }
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

    const newTime = (value / 100) * duration;

    videoRef.current.currentTime = newTime;

    setProgress(value);

    if (!isRemoteUpdate && onSeek) {
      onSeek(newTime);
    }
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
      if (!playerRef.current?.contains(document.activeElement)) {
        return;
      }

      const target = e.target;
      if (
        target instanceof HTMLElement &&
        target.closest(
          'button, a, input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]'
        )
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

        case "ArrowUp":
        case "ArrowDown": {
          const player = videoRef.current;
          if (!player) return;

          e.preventDefault();
          const delta = e.key === "ArrowUp" ? 0.1 : -0.1;
          const nextVolume = Math.min(
            1,
            Math.max(0, Math.round((player.volume + delta) * 10) / 10)
          );
          player.volume = nextVolume;
          player.muted = nextVolume === 0;
          setVolume(nextVolume);
          setIsMuted(player.muted);
          break;
        }

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
    e.currentTarget.focus();

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

  const stopPropagation = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };
  return (
    <div
      ref={playerRef}
      tabIndex={0}
      aria-label="Video player. Use Space to play or pause, arrow keys to seek and adjust volume."
      className="relative aspect-video bg-black rounded-lg overflow-hidden"
      onClick={handleVideoClick}
      onTouchEnd={handleDoubleTap}
    >

      <video
        ref={videoRef}
        data-watch-party-video
        src={src}
        className="w-full h-full"

        onEnded={() => {
          if (onNext) {
            onNext();
          }
        }}

        onLoadStart={() => {
          setIsLoading(true);
          setVideoError(false);
        }}
        onWaiting={() => setIsLoading(true)}
        onError={() => {
          setIsLoading(false);
          setVideoError(true);
        }}
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

      {videoError && (
        <div
          role="alert"
          className="absolute inset-0 flex items-center justify-center bg-black/70 p-4 text-center text-white"
        >
          Video unavailable. Please try again later.
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-16 left-4 right-4">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onMouseDown={stopPropagation}
          onClick={stopPropagation}
          onChange={handleSeek}
          className="w-full cursor-pointer"
        />
      </div>

      {onNext && (
        <button
          onClick={(event) => {
            stopPropagation(event);
            onNext();
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          Next Video ▶
        </button>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-1 sm:gap-2 lg:gap-3">

        {/* Backward */}
        <button
          onClick={(event) => {
            stopPropagation(event);
            handleBackward();
          }}
          className="rounded-full bg-black/70 p-2 text-white transition hover:bg-black/90 lg:p-3"
        >
          <RotateCcw size={20} />
        </button>

        {/* Play */}
        <button
          onClick={(event) => {
            stopPropagation(event);
            handlePlayPause();
          }}
          className="rounded-full bg-black/70 p-2 text-white transition hover:bg-black/90 lg:p-3"
        >
          {isPlaying ? (
            <Pause size={22} />
          ) : (
            <Play size={22} />
          )}
        </button>

        {/* Forward */}
        <button
          onClick={(event) => {
            stopPropagation(event);
            handleForward();
          }}
          className="rounded-full bg-black/70 p-2 text-white transition hover:bg-black/90 lg:p-3"
        >
          <RotateCw size={20} />
        </button>

        {/* Time */}
        <p className="whitespace-nowrap text-xs font-medium text-white lg:text-sm">
          {formatTime(currentTime)} / {formatTime(duration)}
        </p>

        {/* Push remaining controls to right */}
        <div className="flex-1" />

        {/* Mute */}
        <button
          onClick={(event) => {
            stopPropagation(event);
            handleMute();
          }}
          className="rounded-full bg-black/70 p-2 text-white transition hover:bg-black/90 lg:p-3"
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
          onMouseDown={stopPropagation}
          onClick={stopPropagation}
          onChange={(event) => {
            stopPropagation(event);
            handleVolume(event);
          }}
          className="hidden w-16 cursor-pointer sm:block lg:w-24"
        />

        {/* Fullscreen */}
        <button
          onClick={(event) => {
            stopPropagation(event);
            handleFullscreen();
          }}
          className="rounded-full bg-black/70 p-2 text-white transition hover:bg-black/90 lg:p-3"
        >
          <Maximize size={20} />
        </button>

        {/* SkipForward */}
        <button
          onClick={(event) => {
            stopPropagation(event);
            if (onNext) {
              onNext();
            }
          }}
          className="rounded-full bg-black/70 p-2 text-white transition hover:bg-black/90 lg:p-3"
        >
          <SkipForward size={20} />
        </button>

      </div>

    </div>
  );
}