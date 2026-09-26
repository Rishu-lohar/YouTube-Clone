import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import User from "../models/Auth.js";

export const createActivityNotification = async ({
  recipientId,
  actorId,
  type,
  subject,
}) => {
  if (
    !mongoose.Types.ObjectId.isValid(recipientId) ||
    !mongoose.Types.ObjectId.isValid(actorId) ||
    String(recipientId) === String(actorId)
  ) {
    return null;
  }

  const [recipient, actor] = await Promise.all([
    User.findById(recipientId).select("_id"),
    User.findById(actorId).select("name channelname"),
  ]);
  if (!recipient || !actor) return null;

  const actorName = actor.name || actor.channelname || "Someone";
  const messages = {
    subscription: `${actorName} subscribed to your channel`,
    like: `${actorName} liked your video: ${subject}`,
    comment: `${actorName} commented on your video: ${subject}`,
  };

  return Notification.create({
    user: recipient._id,
    type,
    message: messages[type] || `${actorName} interacted with your content`,
  });
};

// Get user's notifications
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const notifications = await Notification.find({
      user: userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const count = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Unread Count Error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      return res.status(400).json({
        message: "Notification ID is required",
      });
    }

    await Notification.findByIdAndUpdate(notificationId, {
      isRead: true,
    });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark Notification Error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};