import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  updateBookingStatus,
  payInvoice,
} from "../controllers/bookingController";
import { authenticateUser } from "../middleware/authenticateUser";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.use(authenticateUser);

router.post("/", requireRole("resident"), createBooking);
router.get("/my", requireRole("resident"), getMyBookings);
router.patch("/:id/pay", requireRole("resident"), payInvoice);

router.get("/owner", requireRole("owner", "admin"), getOwnerBookings);
router.patch("/:id/status", requireRole("owner", "admin"), updateBookingStatus);

export default router;

