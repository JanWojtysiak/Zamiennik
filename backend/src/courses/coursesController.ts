import type { Request, Response } from "express";
import * as coursesService from "./courseService.js";



export async function searchCoursesController(req: Request, res: Response) {
  try {
    const { name, page } = req.query;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Parametr name jest wymagany" });
    }

    const pageNumber = page === undefined ? 0 : Number(page);

    if (!Number.isInteger(pageNumber) || pageNumber < 0) {
      return res.status(400).json({ error: "Nieprawidłowy numer strony" });
    }

    const result = await coursesService.getsearchCoursesService(
      name.trim(),
      pageNumber,
    );
    return res.status(200).json(result);
  } catch {
    return res.status(500).json({ error: "Bład serwera bład 500" });
  }
}
