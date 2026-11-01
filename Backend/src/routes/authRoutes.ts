import { Router } from "express";
import {
  syncSession,
  getMe,
  updateProfile,
  submitOnboarding,
  getStatus,
  logout,
} from "../controllers/authController";
import { authenticateUser } from "../middleware/authenticateUser";

const router = Router();

// Public / Token-authenticated routes
router.post("/session", authenticateUser, syncSession);
router.get("/me", authenticateUser, getMe);
router.patch("/profile", authenticateUser, updateProfile);
router.post("/onboarding", authenticateUser, submitOnboarding);
router.get("/status", authenticateUser, getStatus);
router.post("/logout", logout);

export default router;

