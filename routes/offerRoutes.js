import express from "express";
import {protect} from "../middlewares/auth.js";
import { authorize } from '../middlewares/roles.js';
import { checkSubscription } from '../middlewares/subscription.js';
import {createOffer, getAllHr, getRmgOffersWithJDs, getAllOffers, assignOfferToHr, updateOffer, deleteOffer, getLatestFilteredUnfilteredCandidates } from "../controllers/offerController.js";

const router = express.Router();

router.post("/", protect, authorize("RMG"), checkSubscription, createOffer);
router.get("/hr", protect, authorize("RMG"), checkSubscription, getAllHr);
router.get("/overview", protect, authorize("RMG"), checkSubscription, getRmgOffersWithJDs);
router.get("/all-offers", protect, authorize("RMG", "Admin"), checkSubscription, getAllOffers);
router.post("/assign", protect, authorize("RMG"), checkSubscription, assignOfferToHr);
router.put("/:id/offer-update", protect, authorize("RMG"), checkSubscription, updateOffer);
router.delete("/:id", protect, authorize("RMG"), checkSubscription, deleteOffer);
router.get('/latest-candidates', protect, authorize('RMG','HR'), checkSubscription, getLatestFilteredUnfilteredCandidates);

export default router;