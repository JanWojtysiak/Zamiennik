import type { Request, Response } from "express";
import { getSessionUserId } from "../auth/authService.js";
import { firstIssueMessage } from "../lib/validation.js";
import * as offersService from "./offersService.js";
import {
  offerCategoryQuerySchema,
  offerIdParamsSchema,
  postOfferBodySchema,
} from "./offersSchemas.js";

//GETs

export async function getAllOffersController(req: Request, res: Response) {
  try {
    const userId = await getSessionUserId(req.headers);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query = offerCategoryQuerySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ error: firstIssueMessage(query.error) });
    }

    const offers = await offersService.getAllOffersService(query.data.category);
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

    const query = offerCategoryQuerySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ error: firstIssueMessage(query.error) });
    }

    const offers = await offersService.getMineOffersService(userId, query.data.category);
    return res.status(200).json(offers);
  } catch {
    return res.status(500).json({ error: "Bład serwera bład 500" });
  }
}

export async function getOfferByIdController(req: Request, res: Response) {
  try {
    const params = offerIdParamsSchema.safeParse(req.params);

    if (!params.success) {
      return res.status(400).json({ error: firstIssueMessage(params.error) });
    }

    const offer = await offersService.getOfferByIdService(params.data.id);
    return res.status(200).json(offer);
  } catch {
    return res.status(500).json({ error: "Bład serwera bład 500" });
  }
}

//POSTs

export async function postOfferController(req: Request, res: Response) {
  try {
    const userId = await getSessionUserId(req.headers);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const body = postOfferBodySchema.safeParse(req.body);

    if (!body.success) {
      return res.status(400).json({ error: firstIssueMessage(body.error) });
    }

    const offer = await offersService.postOfferService({ userId, ...body.data });
    return res.status(201).json(offer);
  } catch {
    return res.status(500).json({ error: "Bład serwera bład 500" });
  }
}

//DELETEs

export async function deleteOfferController(req: Request, res: Response) {
  try {
    const userId = await getSessionUserId(req.headers);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const params = offerIdParamsSchema.safeParse(req.params);

    if (!params.success) {
      return res.status(400).json({ error: firstIssueMessage(params.error) });
    }

    const deleted = await offersService.deleteOfferService(params.data.id, userId);

    if (!deleted) {
      return res.status(404).json({ error: "Nie znaleziono ogłoszenia" });
    }

    return res.status(204).end();
  } catch {
    return res.status(500).json({ error: "Bład serwera bład 500" });
  }
}
