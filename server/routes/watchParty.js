import express from "express";

import{
    createParty,
    joinParty,
    getParty,
    leaveParty,
} from "../controllers/watchParty.js";

const router = express.Router();

router.post("/create", createParty);
router.post("/join", joinParty)
router.get("/:roomCode", getParty);
router.post("/leave", leaveParty);

export default router;