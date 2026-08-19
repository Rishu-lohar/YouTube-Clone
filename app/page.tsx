import VideoGrid from "@/components/VideoGrid";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="mb-6 text-3xl font-semibold text-foreground">
          Home
        </h1>
        <VideoGrid />
      </div>
    </div>
  );
}