import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Backend is Running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const DBURL = process.env.DB_URL;
mongoose.connect(DBURL).then(()=>{
  console.log("Mongodb connected");
})
.catch((error)=>{
  console.log(error);
})