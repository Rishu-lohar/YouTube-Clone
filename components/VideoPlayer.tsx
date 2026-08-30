"use client";


import { useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
} from "lucide-react";
import { getVideoSrc } from "@/lib/videoSrc";

type VideoPlayerProps = {
  videoPath: string;
};

export default function VideoPlayer({
  videoPath,
}: VideoPlayerProps) {
  const src = getVideoSrc(videoPath);

  const videoRef = useRef<HTMLVideoElement>(null);

  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);


  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }

    setIsPlaying(!isPlaying);
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

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">

      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
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

      </div>

    </div>
  );
}