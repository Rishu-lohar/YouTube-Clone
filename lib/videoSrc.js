export const getVideoSrc = (filepath) => {
  if (!filepath) return "";

  const normalized = String(filepath).trim();
  const isHttp = normalized.startsWith("http://") || normalized.startsWith("https://");
  if (isHttp) return normalized;

  const isPublicVideo = normalized.startsWith("/videos/");
  if (isPublicVideo) return normalized;

  const needsBackendPrefix =
    normalized.startsWith("uploads/") || normalized.startsWith("/uploads/") || !normalized.startsWith("/");

  if (needsBackendPrefix) {
    const suffix = normalized.startsWith("/") ? normalized : `/${normalized}`;
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}${suffix}`;
  }

  return normalized;
};