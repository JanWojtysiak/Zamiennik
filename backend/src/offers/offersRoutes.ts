import { Router } from "express";
import { requireAuth } from "../auth/authController.js";
import { getMineOffersController, postOfferController } from "./offersController.js";

const router = Router();

router.post("/", requireAuth, postOfferController);
router.get("/mine", requireAuth, getMineOffersController);
export default router;
