type VideoPlayerProps = {
  videoPath: string;
};

export default function VideoPlayer({ videoPath }: VideoPlayerProps) {
  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <video
        src={videoPath}
        className="w-full h-full"
        controls
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}