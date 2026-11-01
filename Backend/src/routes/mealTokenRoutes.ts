import { Router } from "express";
import {
  generateMealToken,
  getMyTokens,
  getTokenById,
  verifyMealToken,
  redeemMealToken,
  getRedemptionHistory,
  getResidentMealBilling,
  payResidentMealBilling,
} from "../controllers/mealTokenController";
import { authenticateUser } from "../middleware/authenticateUser";
import { requireRole } from "../middleware/requireRole";

const router = Router();

// Resident Routes
router.post("/generate", authenticateUser, generateMealToken);
router.get("/my-tokens", authenticateUser, getMyTokens);
router.get("/billing/my-transactions", authenticateUser, getResidentMealBilling);
router.post("/billing/pay", authenticateUser, payResidentMealBilling);

// Staff / Owner Routes
router.post("/verify", authenticateUser, requireRole("owner", "admin"), verifyMealToken);
router.post("/redeem", authenticateUser, requireRole("owner", "admin"), redeemMealToken);
router.get("/history", authenticateUser, getRedemptionHistory);

// Retrieve individual token details
router.get("/:id", authenticateUser, getTokenById);

export default router;

