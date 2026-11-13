import { Router } from "express";
import { requireAuth } from "../auth/authController.js";
import {
  deleteOfferController,
  getAllOffersController,
  getMineOffersController,
  postOfferController,
} from "./offersController.js";

const router = Router();

router.post("/", requireAuth, postOfferController);
router.get("/", requireAuth, getAllOffersController);
router.get("/mine", requireAuth, getMineOffersController);
router.delete("/:id", requireAuth, deleteOfferController);
export default router;
