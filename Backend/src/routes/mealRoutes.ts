import { Router } from "express";
import { getMealSchedule, updateMealSchedule } from "../controllers/mealController";
import {
  getTodayMeals,
  getAllMealsForHostel,
  createMealConfig,
  updateMealConfig,
} from "../controllers/mealConfigController";
import { authenticateUser } from "../middleware/authenticateUser";
import { requireRole } from "../middleware/requireRole";

const router = Router();

// Retrieve today's configured meals with pricing & deadlines
router.get("/today", getTodayMeals);

// Legacy weekly schedule
router.get("/hostel/:hostelId", getMealSchedule);

// Configured meal list for owner pricing view
router.get("/hostel/:hostelId/configured", getAllMealsForHostel);

// Owner / Admin Meal Management endpoints
router.post(
  "/",
  authenticateUser,
  requireRole("owner", "admin"),
  createMealConfig
);

router.patch(
  "/:id",
  authenticateUser,
  requireRole("owner", "admin"),
  updateMealConfig
);

// Update legacy schedule
router.put(
  "/:id",
  authenticateUser,
  requireRole("owner", "admin"),
  updateMealSchedule
);

export default router;
