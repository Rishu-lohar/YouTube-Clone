import express from "express";
import {
  uploadvideo,
  getallvideo,
} from "../controllers/video.js";

import upload from "../filehelper/filehelper.js";

const router = express.Router();

router.post(
  "/upload",
  upload.single("file"),
  uploadvideo
);

router.get("/getall", getallvideo);

export default router;