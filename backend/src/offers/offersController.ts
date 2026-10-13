import type { Request, Response } from "express";
import { getSessionUserId } from "../auth/authService.js";
import * as offersService from "./offersService.js";

export async function postOfferController(req: Request, res: Response) {
  try {
    const userId = await getSessionUserId(req.headers);
    const { offeredCourseId, wantedCourseId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!offeredCourseId || !wantedCourseId) {
      return res.status(400).json({ error: "Wszystkie pola są wymagane" });
    }

    const offer = await offersService.postOfferService({
      userId,
      offeredCourseId,
      wantedCourseId,
    });
    return res.status(201).json(offer);
  } catch {
    return res.status(500).json({ error: "Bład serwera bład 500" });
  }
}

export async function getMineOffersController(req: Request, res: Response) {
  try {
    const userId = await getSessionUserId(req.headers);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const offers = await offersService.getMineOffersService(userId);
    return res.status(200).json(offers);
  } catch {
    return res.status(500).json({ error: "Bład serwera bład 500" });
  }
}
