import { Router } from "express";
import { handleAuth } from "./authController.js";

export const authRouter: Router = Router();
authRouter.all("/*splat", handleAuth);
