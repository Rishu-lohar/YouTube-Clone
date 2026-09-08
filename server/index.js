import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import path from "path";
import http from "http";
import { Server } from "socket.io";

import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import subscriptionrouters from "./routes/subscription.js";
import downloadRoutes from "./routes/download.js";
import watchPartyRoutes from "./routes/watchParty.js";

import "./cron/subscriptionCron.js";

dotenv.config();

console.log("INDEX EMAIL:", process.env.EMAIL_USER);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001", // frontend port
    methods: ["GET", "POST"],
  },
});

app.use(cors());

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));
app.use(bodyParser.json());

// Static folders
app.use("/uploads", express.static(path.join("uploads")));
app.use("/videos", express.static(path.join("public/videos")));

app.get("/", (req, res) => {
  res.send("YouTube backend is working");
});

// Routes
app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyroutes);
app.use("/comment", commentroutes);
app.use("/download", downloadRoutes);
app.use("/subscription", subscriptionrouters);
app.use("/watchparty", watchPartyRoutes);

// SOCKET.IO 

io.on("connection", (socket) => {
  console.log("✅ User Connected:", socket.id);

  // Join Room
  socket.on("join-room", ({ roomCode, userId }) => {
    socket.join(roomCode);

    console.log(`${userId} joined ${roomCode}`);

    io.to(roomCode).emit("participant-joined", {
      userId,
    });
  });

  // Leave Room
  socket.on("leave-room", ({ roomCode, userId }) => {
    socket.leave(roomCode);

    console.log(`${userId} left ${roomCode}`);

    io.to(roomCode).emit("participant-left", {
      userId,
    });
  });

  // Live Chat
  socket.on("send-message", (data) => {
    io.to(data.roomCode).emit("receive-message", data);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("❌ User Disconnected:", socket.id);
  });
});


const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("✅ MongoDB Connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });