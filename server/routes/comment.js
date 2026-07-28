import express from "express";
import {
  postcomment,
  getallcomment,
  deletecomment,
  editcomment,
  likeComment,
  dislikeComment,
} from "../controllers/comment.js";

const router = express.Router();

router.get("/:videoid", getallcomment);

router.post("/postcomment", postcomment);

router.delete("/deletecomment/:id", deletecomment);

router.post("/editcomment/:id", editcomment);

router.put("/like/:id", likeComment);

router.put("/dislike/:id", dislikeComment);

export default router;