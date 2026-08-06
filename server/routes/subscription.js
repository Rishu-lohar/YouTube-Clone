import express from "express";
import { createSubscription } from "../controllers/subscription";

const router = express.router();

// create Subscription 
router.post("/", createSubscription);

export default router;