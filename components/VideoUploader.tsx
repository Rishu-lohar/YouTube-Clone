"use client";

import { ChangeEvent, useRef, useState } from "react";
import { FileVideo, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

type VideoUploaderProps = {
  channelId: string;
  channelName: string;
};

export default function VideoUploader({
  channelId,
  channelName,
}: VideoUploaderProps) {

  // Selected video file
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Video ka title
  const [videoTitle, setVideoTitle] = useState("");

  // Upload chal raha hai ya nahi
  const [isUploading, setIsUploading] = useState(false);

  // Upload percentage
  const [uploadProgress, setUploadProgress] = useState(0);

  // Hidden file input ko access karne ke liye
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User jab file select karega
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    // Sirf video file allow
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file.");
      return;
    }

    // Maximum 100MB
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video must be smaller than 100MB.");
      return;
    }

    setVideoFile(file);

    // File ka naam automatically title me
    if (!videoTitle) {
      setVideoTitle(file.name);
    }
  };

  // Form reset
  const resetForm = () => {
    setVideoFile(null);
    setVideoTitle("");
    setIsUploading(false);
    setUploadProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload button
  const handleUpload = () => {
    if (!videoFile || !videoTitle.trim()) {
      toast.error("Please select a video and enter a title.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Abhi backend nahi hai, isliye fake progress
    const interval = setInterval(() => {
      setUploadProgress((previousProgress) => {
        if (previousProgress >= 100) {
          clearInterval(interval);

          setIsUploading(false);

          toast.success(
            `${videoTitle} uploaded to ${channelName}`
          );

          return 100;
        }

        return previousProgress + 10;
      });
    }, 300);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">

      <h2 className="text-xl font-semibold mb-4">
        Upload a video
      </h2>

      {!videoFile ? (

        // File Selection Area
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-100"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />

          <p className="text-lg font-medium">
            Select a video to upload
          </p>

          <p className="text-sm text-gray-500 mt-1">
            Click here to select a video
          </p>

          <p className="text-xs text-gray-400 mt-4">
            Video files • Maximum 100MB
          </p>

          <input
            type="file"
            ref={fileInputRef}
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

      ) : (

        // File Selected
        <div className="space-y-4">

          {/* Selected File Information */}
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">

            <FileVideo className="w-6 h-6" />

            <div className="flex-1 min-w-0">

              <p className="font-medium truncate">
                {videoFile.name}
              </p>

              <p className="text-sm text-gray-500">
                {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>

            </div>

            {!isUploading && (
              <Button
                variant="ghost"
                size="icon"
                onClick={resetForm}
              >
                <X className="w-5 h-5" />
              </Button>
            )}

          </div>

          {/* Video Title */}
          <div>

            <Label htmlFor="title">
              Title
            </Label>

            <Input
              id="title"
              value={videoTitle}
              onChange={(e) =>
                setVideoTitle(e.target.value)
              }
              disabled={isUploading}
              className="mt-1"
            />

          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">

              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>

              <Progress value={uploadProgress} />

            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-end">

            <Button
              onClick={handleUpload}
              disabled={
                isUploading ||
                !videoTitle.trim()
              }
            >
              {isUploading
                ? "Uploading..."
                : "Upload"}
            </Button>

          </div>

        </div>

      )}

    </div>
  );
}