import { Router } from "express";
import { requireAuth } from "../auth/authController.js";
import { searchCoursesController } from "./coursesController.js";

const router = Router();

router.get("/search", requireAuth, searchCoursesController);
export default router;
