import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import path from "path";

import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from "./routes/watchlater.js";
import historyroutes from "./routes/history.js";
import commentroutes from "./routes/comment.js";
import subscriptionrouter from "./models/subscription.js";

import downloadRoutes from "./routes/download.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

// Static folders
app.use("/uploads", express.static(path.join("uploads")));
app.use("/videos", express.static(path.join("public/videos")));

app.get("/", (req, res) => {
  res.send("You tube backend is working");
});

app.use(bodyParser.json());

// Routes
app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyrroutes);
app.use("/comment", commentroutes);
app.use("/download", downloadRoutes);
app.use("/subscription", subscriptionroutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });