import express from "express";
import {
  handlewatchlater,
  getallwatchlater,
} from "../controllers/watchlater.js";

const router = express.Router();

router.get("/:userId", getallwatchlater);

router.post("/:videoId", handlewatchlater);

export default router;