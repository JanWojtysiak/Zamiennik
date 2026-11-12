import type { Request, Response } from "express";
import { getSessionUserId } from "../auth/authService.js";
import * as offersService from "./offersService.js";
import { OfferCategory } from "../../generated/enums.js";

const isOfferCategory = (value: unknown): value is OfferCategory =>
  Object.values(OfferCategory).includes(value as OfferCategory);

// Reads the optional ?category= filter. Returns false when the value is invalid.
function parseCategoryQuery(req: Request): OfferCategory | undefined | false {
  const { category } = req.query;
  if (category === undefined) return undefined;
  return isOfferCategory(category) ? category : false;
}

//GETs

export async function getAllOffersController(req: Request, res: Response) {
  try {
    const userId = await getSessionUserId(req.headers);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const category = parseCategoryQuery(req);
    if (category === false) {
      return res.status(400).json({ error: "Nieprawidłowa kategoria" });
    }

    const offers = await offersService.getAllOffersService(category);
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

    const category = parseCategoryQuery(req);
    if (category === false) {
      return res.status(400).json({ error: "Nieprawidłowa kategoria" });
    }

    const offers = await offersService.getMineOffersService(userId, category);
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
    const {
      offeredCourseId,
      wantedCourseId,
      offeredGroupId,
      wantedGroupId,
      category = "COURSE",
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!offeredCourseId || !wantedCourseId || !offeredGroupId || !wantedGroupId) {
      return res.status(400).json({ error: "Wszystkie pola są wymagane" });
    }

    if (!isOfferCategory(category)) {
      return res.status(400).json({ error: "Nieprawidłowa kategoria" });
    }

    // Regular courses swap groups within one course; sport classes (WF) may
    // swap between disciplines, which USOS keeps as separate courses.
    if (category === "COURSE" && offeredCourseId !== wantedCourseId) {
      return res.status(400).json({
        error: "Można wymienić się tylko na grupę tego samego przedmiotu",
      });
    }

    if (offeredCourseId === wantedCourseId && offeredGroupId === wantedGroupId) {
      return res.status(400).json({ error: "Wybierz inną grupę niż oddawana" });
    }

    const offer = await offersService.postOfferService({
      userId,
      offeredCourseId,
      wantedCourseId,
      offeredGroupId,
      wantedGroupId,
      category,
    });
    return res.status(201).json(offer);
  } catch {
    return res.status(500).json({ error: "Bład serwera bład 500" });
  }
}
