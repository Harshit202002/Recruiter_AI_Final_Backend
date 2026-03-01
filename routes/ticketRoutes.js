import express from "express";
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roles.js';
import { checkSubscription } from '../middlewares/subscription.js';
import { createTicket, getAllTickets, updateTicketStatus, raiseTicket, receiveSuperAdminReply, replyToTicket} from "../controllers/ticketController.js";

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("RMG","HR"),
    checkSubscription,
    createTicket
);

router.get(
    "/",
    protect,
    authorize("Admin", "RMG"),
    checkSubscription,
    getAllTickets
);

router.put(
    "/:id",
    protect,
    authorize("Admin"),
    checkSubscription,
    updateTicketStatus
);
router.post("/raise-ticket-admin", protect, authorize("Admin"), checkSubscription, raiseTicket);
router.post("/reply-to-ticket/:ticketId", protect, authorize("Admin"), checkSubscription, replyToTicket);
router.post("/receive-superadmin-reply",  receiveSuperAdminReply);

export default router;