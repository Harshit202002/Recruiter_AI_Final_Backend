import express from "express";
import { protect } from "../middlewares/auth.js";
import { authorize } from '../middlewares/roles.js';
import { checkSubscription } from '../middlewares/subscription.js';
import { createJD, createJDWithAI, getAllJds, getAllCandidates, addresumeToJD, getAllCandidatesAppliedToJD, getAssignedJDsByRMG, getAssignedOffersByRMG, getFilteredCandidatesForJD, getJdCreatedByHR, editJD, getAllJDs } from "../controllers/jdController.js";
import { filterResumes } from "../controllers/aiResumeFilterController.js";
import { protectCandidate } from "../middlewares/authCandidate.js";

const router = express.Router();

// Manual JD creation
router.post("/:offerId", protect, authorize("HR"), checkSubscription, createJD);

// AI-powered JD creation
router.post("/:offerId/ai", protect, authorize("HR"), checkSubscription, createJDWithAI);
router.post("/:jdId/filter-resumes", protect, authorize("HR"), filterResumes);
router.get("/all-jd", protectCandidate, getAllJds);
router.get("/allJds", getAllJDs);
router.get("/all-jd-admin", protect, authorize("Admin"), checkSubscription, getAllJds);
router.get("/all-jd-hr", protect, authorize("HR"), checkSubscription, getAllJds);
router.get("/all-candidates", protect, authorize("HR", "Admin", "RMG"), checkSubscription, getAllCandidates);
router.post("/:jdId/add-resume", protect, authorize("HR"), checkSubscription, addresumeToJD);
// router.get("/:jdId/candidates", protect, authorize("HR"), getAllCandidatesAppliedToJD); // Disabled HR-only route for candidates
router.get("/:jdId/candidates", protectCandidate, getAllCandidatesAppliedToJD); // Enable for candidate JWT
router.get("/:jdId/candidatess", protect, authorize("HR"), getAllCandidatesAppliedToJD); // Enable for candidate JWT
// Route for filtered candidates only
router.get("/:jdId/filtered-candidates", protect, authorize("HR"), checkSubscription, getFilteredCandidatesForJD);
router.get("/assigned-jds/hr", protect, authorize("HR"), checkSubscription, getAssignedJDsByRMG);
router.get("/assigned-offers/hr", protect, authorize("HR"), checkSubscription, getAssignedOffersByRMG);
router.get("/created-by/hr", protect, authorize("HR"), checkSubscription, getJdCreatedByHR);
router.put("/editjd/:jdId", protect, authorize("HR"), checkSubscription, editJD);

export default router;