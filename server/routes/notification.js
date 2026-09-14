import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
} from "../controllers/Notification.js";

const router = express.Router();

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.post("/read", markAsRead);

export default router;