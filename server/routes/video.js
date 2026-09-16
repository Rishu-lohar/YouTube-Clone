import express from "express";
import {
  uploadvideo,
  getallvideo,
  reportVideo,
} from "../controllers/video.js";

import upload from "../filehelper/filehelper.js";

const router = express.Router();

router.post(
  "/upload",
  upload.single("file"),
  uploadvideo
);

router.get("/getall", getallvideo);
router.put("/report/:id", reportVideo);

export default router;