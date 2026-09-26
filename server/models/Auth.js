import mongoose from "mongoose";
const userschema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  channelname: { type: String },
  description: { type: String },
  image: { type: String },
  plan: {
    type: String,
    enum: ["Free", "Bronze", "Silver", "Gold"],
    default: "Free",
  },

  theme:{
    type: String,
    enum: ["light", "dark"],
    default: "dark",
  },

  otp:{
    type: String,
    default: null,
  },

  otpExpiry:{
    type: Date,
    default: null,
  },

  isVerifiedDevice:{
    type: Boolean,
    default: false,
  },  

  lastLoginDevice:{
    type: String,
    default: "",
  },

  lastLoginIP:{
    type: String,
    default: "",
  },

  lastLoginCity:{
    type: String,
    default: "",
  },

  lastLoginState:{
    type: String,
    default: "",
  },
  lastLoginLatitude: {
    type: Number,
    default: null,
    min: -90,
    max: 90,
    select: false,
  },
  lastLoginLongitude: {
    type: Number,
    default: null,
    min: -180,
    max: 180,
    select: false,
  },

  
  joinedon: { type: Date, default: Date.now },
});

const User = mongoose.models.user || mongoose.model("user", userschema);

export default User;