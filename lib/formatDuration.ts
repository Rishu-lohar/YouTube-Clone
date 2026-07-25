export const formatDuration = (durationInSeconds: number) => {
  if (!durationInSeconds || Number.isNaN(durationInSeconds)) {
    return "0:00";
  }

  const seconds = Math.round(durationInSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const paddedSeconds = String(remainingSeconds).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${paddedSeconds}`;
  }

  return `${minutes}:${paddedSeconds}`;
};