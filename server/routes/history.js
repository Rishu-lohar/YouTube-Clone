import express from "express";
import {
  getallhistoryVideo,
  handlehistory,
  handleview,
  deletehistory,
} from "../controllers/history.js";

const router = express.Router();

router.get("/:userId", getallhistoryVideo);

router.delete("/:id", deletehistory);

router.post("/views/:videoId", handleview);

router.post("/:videoId", handlehistory);

export default router;