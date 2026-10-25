import type { Request, Response } from "express";
import { getSessionUserId } from "../auth/authService.js";
import * as offersService from "./offersService.js";

//GETs

export async function getAllOffersController(req: Request, res: Response) {
  try {
    const userId = await getSessionUserId(req.headers);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const offers = await offersService.getAllOffersService();
    return res.status(200).json(offers);
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

export async function getOfferByIdController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "Nieprawidłowe id" });
    }

    const offer = await offersService.getOfferByIdService(id);
    return res.status(200).json(offer);
  } catch {
    return res.status(500).json({ error: "Bład serwera bład 500" });
  }
}

//POSTs

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

    if (offeredCourseId !== wantedCourseId) {
      return res.status(400).json({
        error: "Można wymienić się tylko na grupę tego samego przedmiotu",
      });
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
