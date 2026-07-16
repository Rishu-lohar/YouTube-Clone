import VideoCard from "./VideoCard";

const videos = [
  {
    id: "1",
    title: "Amazing Nature Documentary",
    channel: "Nature Channel",
    views: 45000,
    videoPath: "/videos/demo.mp4",
  },
  {
    id: "2",
    title: "My First YouTube Clone Video",
    channel: "Rishu Channel",
    views: 1200,
    videoPath: "/videos/demo.mp4",
  },
];

export default function VideoGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}