"use client";

import React, { ChangeEvent, useRef, useState } from "react";
import { Check, FileVideo, Upload, X } from "lucide-react";
import { toast } from "sonner";

import axiosInstance from "@/lib/axiosinstance";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";

interface VideoUploaderProps {
  channelId: string;
  channelName: string;
}

const VideoUploader = ({
  channelId,
  channelName,
}: VideoUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [uploadComplete, setUploadComplete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    const file = files[0];

    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a valid video file.");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size exceeds 100MB.");
      return;
    }

    setVideoFile(file);

    if (!videoTitle.trim()) {
      setVideoTitle(file.name);
    }
  };

  const resetForm = () => {
    setVideoFile(null);
    setVideoTitle("");
    setUploadProgress(0);
    setUploadComplete(false);
    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const cancelUpload = () => {
    resetForm();
  };

  const handleUpload = async () => {
    if (!videoFile || !videoTitle.trim()) {
      toast.error("Please provide a video and title.");
      return;
    }

    const formData = new FormData();

    formData.append("file", videoFile);
    formData.append("videotitle", videoTitle);
    formData.append("videochanel", channelName);
    formData.append("uploader", channelId);

    try {
      setIsUploading(true);
      setUploadProgress(0);

      await axiosInstance.post("/video/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },

        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;

          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );

          setUploadProgress(progress);
        },
      });

      setUploadComplete(true);

      toast.success("Video uploaded successfully!");

      setTimeout(() => {
        resetForm();
      }, 1200);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload video.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-lg bg-gray-50 p-6">
      <h2 className="mb-4 text-xl font-semibold">
        Upload a Video
      </h2>

      <div className="space-y-4">
        {!videoFile ? (
          <div
            className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:bg-gray-100"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto mb-2 h-12 w-12 text-gray-400" />

            <p className="text-lg font-medium">
              Drag & Drop your video
            </p>

            <p className="mt-1 text-sm text-gray-500">
              or click to browse
            </p>

            <p className="mt-4 text-xs text-gray-400">
              MP4, MOV, AVI, WEBM • Max 100MB
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border bg-white p-3">
              <div className="rounded-md bg-blue-100 p-2">
                <FileVideo className="h-6 w-6 text-blue-600" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {videoFile.name}
                </p>

                <p className="text-sm text-gray-500">
                  {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              {!isUploading && !uploadComplete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={cancelUpload}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}

              {uploadComplete && (
                <div className="rounded-full bg-green-100 p-1">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="title">
                Title (Required)
              </Label>

              <Input
                id="title"
                className="mt-1"
                value={videoTitle}
                placeholder="Enter video title..."
                disabled={isUploading || uploadComplete}
                onChange={(e) =>
                  setVideoTitle(e.target.value)
                }
              />
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>

                <Progress
                  value={uploadProgress}
                  className="h-2"
                />
              </div>
            )}

            {!uploadComplete && (
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={cancelUpload}
                  disabled={isUploading}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleUpload}
                  disabled={
                    isUploading || !videoTitle.trim()
                  }
                >
                  {isUploading
                    ? "Uploading..."
                    : "Upload"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUploader;