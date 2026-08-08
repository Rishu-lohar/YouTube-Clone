import express from "express";
import { createSubscription, createOrder  } from "../controllers/subscription.js";
  

const router = express.Router();

// create Subscription 
router.post("/", createSubscription);
router.post("/create-order", createOrder);

export default router;