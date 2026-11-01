import { Router } from "express";
import {
  getHostels,
  getHostelById,
  getOwnerHostels,
  createHostel,
  updateHostel,
} from "../controllers/hostelController";
import { authenticateUser } from "../middleware/authenticateUser";
import { requireRole, requireActiveAccount } from "../middleware/requireRole";

const router = Router();

// Public routes
router.get("/", getHostels);
router.get("/:id", getHostelById);

// Owner protected routes
router.get(
  "/owner/my-properties",
  authenticateUser,
  requireRole("owner", "admin"),
  requireActiveAccount,
  getOwnerHostels
);
router.post(
  "/",
  authenticateUser,
  requireRole("owner", "admin"),
  requireActiveAccount,
  createHostel
);
router.put(
  "/:id",
  authenticateUser,
  requireRole("owner", "admin"),
  requireActiveAccount,
  updateHostel
);

export default router;

