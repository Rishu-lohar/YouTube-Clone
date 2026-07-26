import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import video from "../Models/video.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicVideosDirectory = path.join(__dirname, "../../public/videos");

const channelSeeds = [
  "CinePulse",
  "PixelScope",
  "UrbanMotion",
  "TechBinge",
  "Global Horizons",
  "Creative Lens",
  "ByteCraft",
  "TravelFlux",
  "SoundWave",
  "FilmForge",
];

const slugify = (value) =>
  value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeTitle = (filename) => {
  let title = path.basename(filename, path.extname(filename));
  title = title.replace(/[-_]+/g, " ");
  title = title.replace(/\b(uhd|fhd|hd|4k)\b/gi, (match) => match.toUpperCase());
  title = title.replace(/(\d{3,4})[_xX](\d{3,4})/g, "$1×$2");
  title = title.replace(/(\d{2,3})fps\b/gi, (_, fps) => `${fps} FPS`);
  return title.replace(/\s+/g, " ").trim();
};

const titlePools = {
  CinePulse: [
    "Cinematic B-Roll Collection",
    "Behind the Lens: Raw Footage",
    "Golden Hour Moments",
    "Short Film Visuals",
    "Story in Motion",
  ],
  PixelScope: [
    "Pixel Perfect Visuals",
    "Digital Art in Motion",
    "Screen Capture Highlights",
    "Design Process Walkthrough",
    "Creative Coding Session",
  ],
  UrbanMotion: [
    "City Life Timelapse",
    "Streets After Dark",
    "Urban Exploration Vlog",
    "Downtown Drone Shots",
    "City Skyline Views",
  ],
  TechBinge: [
    "Coding Late Night Session",
    "Tech Setup Tour",
    "Developer Life Vlog",
    "Behind the Code",
    "Workstation Aesthetic",
  ],
  "Global Horizons": [
    "Mountain Escape Vlog",
    "Travel Diaries: Hidden Gems",
    "Exploring New Horizons",
    "Wanderlust Chronicles",
    "Scenic Views Around the World",
  ],
  "Creative Lens": [
    "Nature in Frame",
    "Macro World Close-Up",
    "Everyday Aesthetic Shots",
    "Slow Living Moments",
    "Simple Things, Beautifully Shot",
  ],
  ByteCraft: [
    "Gadget Unboxing Vlog",
    "Tech Review Session",
    "Gaming Setup Tour",
    "Hands-On First Look",
    "Weekend Tech Diaries",
  ],
  TravelFlux: [
    "Postcard Perfect Places",
    "Old Town Wanderings",
    "Travel Vlog: On the Road",
    "Hidden Villages Diaries",
    "Sunset Chasing Around Europe",
  ],
  SoundWave: [
    "Chill Study Session Vibes",
    "Acoustic Moments",
    "Music & Mood Vlog",
    "Sound of Everyday Life",
    "Ambient Sessions",
  ],
  FilmForge: [
    "Short Film Behind the Scenes",
    "Raw Cinematic Cuts",
    "Director's Cut Preview",
    "Visual Storytelling Reel",
    "Film Set Diaries",
  ],
};

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const generatePrettyTitle = (channelName, filename) => {
  const pool = titlePools[channelName] || [normalizeTitle(filename)];
  const index = hashString(filename) % pool.length;
  return pool[index];
};

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomDateInPastDays = (days) => {
  const ms = Date.now() - Math.floor(Math.random() * days * 24 * 60 * 60 * 1000);
  return new Date(ms);
};

const generatePublicVideoMetadata = async (filename, index) => {
  const filePathOnDisk = path.join(publicVideosDirectory, filename);
  const fileStat = await fs.stat(filePathOnDisk);
  const channelName = channelSeeds[index % channelSeeds.length];
  const views = randomInt(2_500, 1_200_000);
  const likeCount = Math.max(1, Math.round(views * (Math.random() * 0.08 + 0.02)));

  return {
    videotitle: generatePrettyTitle(channelName, filename),
    filename,
    filepath: `/videos/${filename}`,
    filetype: "video/mp4",
    filesize: String(fileStat.size),
    videochanel: channelName,
    uploader: slugify(channelName),
    views,
    Like: likeCount,
    createdAt: randomDateInPastDays(900),
  };
};

const syncPublicVideos = async () => {
  try {
    const entries = await fs.readdir(publicVideosDirectory);
    const videoFiles = entries.filter(
      (file) => path.extname(file).toLowerCase() === ".mp4"
    );

    const existingRecords = await video.find({ filepath: { $regex: "^/videos/" } });
    const currentPaths = videoFiles.map((file) => `/videos/${file}`);

    const obsoleteRecords = existingRecords.filter(
      (record) => !currentPaths.includes(record.filepath)
    );

    for (const stale of obsoleteRecords) {
      await video.findByIdAndDelete(stale._id);
    }

    for (const [index, filename] of videoFiles.entries()) {
      const filepath = `/videos/${filename}`;
      const filePathOnDisk = path.join(publicVideosDirectory, filename);
      const fileStat = await fs.stat(filePathOnDisk);
      const existing = await video.findOne({ filepath });

      if (!existing) {
        const metadata = await generatePublicVideoMetadata(filename, index);
        await video.create(metadata);
      } else {
        await video.findByIdAndUpdate(
          existing._id,
          {
            filename,
            filepath,
            filetype: "video/mp4",
            filesize: String(fileStat.size),
            videotitle: generatePrettyTitle(existing.videochanel, filename),
          },
          {
            returnDocument: "after",
          }
        );
      }
    }
  } catch (error) {
    console.error("Failed to sync public videos:", error);
  }
};

export const uploadvideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(404).json({
        message: "Please upload only MP4 video file",
      });
    }

    const newVideo = new video({
      videotitle: req.body.videotitle,
      filename: req.file.originalname,
      filepath: req.file.path,
      filetype: req.file.mimetype,
      filesize: req.file.size,
      videochanel: req.body.videochanel,
      uploader: req.body.uploader,
    });

    await newVideo.save();

    return res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      data: newVideo,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getallvideo = async (req, res) => {
  try {
    await syncPublicVideos();
    const videos = await video
      .find({
        filepath: { $regex: "^/videos/" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json(videos);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
