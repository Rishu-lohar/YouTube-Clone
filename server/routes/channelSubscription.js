import express from "express";

import {
  subscribe,
  unsubscribe,
  getSubscriptionStatus,
  getSubscriberCount,
  getMySubscriptions,
} from "../controllers/channelSubscription.js";

const router = express.Router();

router.post("/subscribe", subscribe);
router.post("/unsubscribe", unsubscribe);
router.get("/status", getSubscriptionStatus);
router.get("/count/:channelId", getSubscriberCount);
router.get("/my-subscriptions/:userId", getMySubscriptions);
export default router;