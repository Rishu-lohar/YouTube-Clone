import express from "express";
import { downloadVideo, getAllDownloads } from "../controllers/download.js";

const router = express.Router();

// Download Video
router.post("/:videoId", downloadVideo);
router.get("/:userId", getAllDownloads);

export default router;