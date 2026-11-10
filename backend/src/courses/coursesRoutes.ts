import { Router } from "express";
import { requireAuth } from "../auth/authController.js";
import {
  getCourseGroupsController,
  searchCoursesController,
} from "./coursesController.js";

const router = Router();

router.get("/search", requireAuth, searchCoursesController);
router.get("/:courseId/groups", requireAuth, getCourseGroupsController);
export default router;
