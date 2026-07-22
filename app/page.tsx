import VideoPlayer from "@/components/VideoPlayer";
import VideoInfo from "@/components/VideoInfo";
import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideo";

export default function WatchPage() {

  // Current Video Data
  const video = {
    id: "1",
    title: "My First YouTube Clone Video",
    channel: "Rishu Channel",
    views: 45000,
    likes: 1250,
    dislikes: 20,
    videoPath: "/videos/demo.mp4",
  };

  // Related Videos Data
  const relatedVideos = [
    {
      id: "2",
      title: "Amazing Nature Documentary",
      channel: "Nature Channel",
      views: 45000,
      videoPath: "/videos/demo.mp4",
    },
    {
      id: "3",
      title: "Learn Next.js By Building Projects",
      channel: "Coding Channel",
      views: 23000,
      videoPath: "/videos/demo.mp4",
    },
    {
      id: "4",
      title: "Full Stack Development Tutorial",
      channel: "Developer Hub",
      views: 12000,
      videoPath: "/videos/demo.mp4",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4">

        {/* Watch Page Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Side - Main Video Section */}
          <div className="lg:col-span-2 space-y-6">

            {/* Video Player */}
            <VideoPlayer videoPath={video.videoPath} />

            {/* Video Information */}
            <VideoInfo video={video} />

            {/* Comments Section */}
            <Comments videoId={video.id} />

          </div>

          {/* Right Side - Related Videos */}
          <div className="space-y-4">
            <RelatedVideos videos={relatedVideos} />
          </div>

        </div>

      </div>
    </div>
  );
}