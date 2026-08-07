import express from "express";
import { createSubscription, createOrder  } from "../controllers/subscription";
  

const router = express.router();

// create Subscription 
router.post("/", createSubscription);
router.post("/create-order, createOrder");

export default router;