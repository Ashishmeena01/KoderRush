import { Router } from "express";
import {
  getPendingOwners,
  reviewOwner,
  getAllUsers,
  getPlatformMetrics,
} from "../controllers/adminController";
import { authenticateUser } from "../middleware/authenticateUser";
import { requireRole } from "../middleware/requireRole";

const router = Router();

router.use(authenticateUser, requireRole("admin"));

router.get("/pending-owners", getPendingOwners);
router.patch("/owners/:id/review", reviewOwner);
router.get("/users", getAllUsers);
router.get("/metrics", getPlatformMetrics);

export default router;

