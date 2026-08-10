import express from "express";
import { createSubscription, createOrder, verifyPayemnt  } from "../controllers/subscription.js";
  

const router = express.Router();

// create Subscription 
router.post("/", createSubscription);
router.post("/create-order", createOrder);
router.post("/verify-payment", verifyPayemnt);

export default router;