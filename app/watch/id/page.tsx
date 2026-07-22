import VideoInfo from "@/components/VideoInfo";
import VideoPlayer from "@/components/VideoPlayer";
import Comments from "@/components/Comments";

export default function WatchPage() {

  // Temporary video data
  // Backend aane ke baad ye API se aayega
  const video = {
    id: "1",
    title: "My First YouTube Clone Video",
    channel: "Rishu Channel",
    views: 45000,
    likes: 1250,
    dislikes: 20,
    videoPath: "/videos/demo.mp4",
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4">

        {/* Watch Page Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left/Main Section */}
          <div className="lg:col-span-2 space-y-4">

            {/* Video Player */}
            <VideoPlayer videoPath={video.videoPath} />

            {/* Video Information */}
            <VideoInfo video={video} />

            <VideoInfo video={video} />

            <Comments videoId={video.id} />

          </div>

          {/* Right Section */}
          <div className="space-y-4">
            Related Videos
          </div>

        </div>
      </div>
    </div>
  );
}