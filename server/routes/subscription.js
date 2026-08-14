import express from "express";
import {
  createSubscription,
  createOrder,
  verifyPayment,
  getMySubscription,
} from "../controllers/subscription.js";

const router = express.Router();

router.post("/", createSubscription);
router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/status/:userId", getMySubscription);

export default router;