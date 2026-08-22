import express from "express";
import { login, updateProfile, updateTheme, verifyOTP } from "../controllers/auth.js";

const routes = express.Router();

routes.post("/login", login);
routes.post("/verify-otp", verifyOTP);
routes.patch("/update/:id", updateProfile);
routes.patch("/theme/:id", updateTheme);

export default routes;