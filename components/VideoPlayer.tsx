import { getVideoSrc } from "@/lib/videoSrc";

type VideoPlayerProps = {
  videoPath: string;
};

export default function VideoPlayer({ videoPath }: VideoPlayerProps) {
  const src = getVideoSrc(videoPath);

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <video
        src={src}
        className="w-full h-full"
        controls
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}