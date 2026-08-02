import mongoose from "mongoose";
const userschema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  channelname: { type: String },
  description: { type: String },
  image: { type: String },
  joinedon: { type: Date, default: Date.now },
});

const User = mongoose.models.user || mongoose.model("user", userschema);

export default User;