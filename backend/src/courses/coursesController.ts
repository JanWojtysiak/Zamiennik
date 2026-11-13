import type { Request, Response } from "express";
import { firstIssueMessage } from "../lib/validation.js";
import * as coursesService from "./courseService.js";
import { courseIdParamsSchema, searchCoursesQuerySchema } from "./coursesSchemas.js";

export async function searchCoursesController(req: Request, res: Response) {
  try {
    const query = searchCoursesQuerySchema.safeParse(req.query);

    if (!query.success) {
      return res.status(400).json({ error: firstIssueMessage(query.error) });
    }

    const result = await coursesService.getsearchCoursesService(
      query.data.name,
      query.data.page,
    );
    return res.status(200).json(result);
  } catch {
    return res.status(500).json({ error: "Bład serwera bład 500" });
  }
}

export async function getCourseController(req: Request, res: Response) {
  try {
    const params = courseIdParamsSchema.safeParse(req.params);

    if (!params.success) {
      return res.status(400).json({ error: firstIssueMessage(params.error) });
    }

    const course = await coursesService.getCourseService(params.data.courseId);

    if (!course) {
      return res.status(404).json({ error: "Nie znaleziono przedmiotu" });
    }

    return res.status(200).json(course);
  } catch {
    return res.status(500).json({ error: "Bład serwera bład 500" });
  }
}

export async function getCourseGroupsController(req: Request, res: Response) {
  try {
    const params = courseIdParamsSchema.safeParse(req.params);

    if (!params.success) {
      return res.status(400).json({ error: firstIssueMessage(params.error) });
    }

    const groups = await coursesService.getCourseGroupsService(params.data.courseId);
    return res.status(200).json(groups);
  } catch {
    return res.status(500).json({ error: "Bład serwera bład 500" });
  }
}
