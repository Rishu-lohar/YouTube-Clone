import express from "express";
import { login, updateProfile, updateTheme } from "../controllers/auth.js";

const routes = express.Router();

routes.post("/login", login);
routes.patch("/update/:id", updateProfile);
routes.patch("/theme/:id", updateTheme);

export default routes;