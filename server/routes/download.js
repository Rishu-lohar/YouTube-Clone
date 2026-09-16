import express from "express";

import {
    downloadVideo,
    getAllDownloads,
    removeDownload,
} from "../controllers/download.js";

const router = express.Router();

// Download Video
router.post("/:videoId", downloadVideo);

// Get All Downloads
router.get("/:userId", getAllDownloads);

// Remove Download
router.delete("/:videoId", removeDownload);

export default router;