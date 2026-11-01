import { Request, Response } from "express";
import { Types } from "mongoose";
import { MealSchedule } from "../models/MealSchedule";
import { Hostel } from "../models/Hostel";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const getMealSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hostelId } = req.params;

    let schedules: any[] = await MealSchedule.find({ hostelId });

    // If no schedule exists, auto-seed a weekly menu for convenience
    if (!schedules.length) {
      const defaultSchedules: any[] = DAYS.map((day) => ({
        hostelId: new Types.ObjectId(hostelId as string),
        dayOfWeek: day,
        breakfast: {
          menu: day === "Sunday" ? "Stuffed Parathas & Fresh Curd" : "Poha, Boiled Eggs & Masala Tea",
          timings: "07:30 AM - 09:30 AM",
          isAvailable: true,
        },
        lunch: {
          menu: "Steamed Rice, Dal Tadka, Seasonal Mix Veg, Chapati & Salad",
          timings: "12:30 PM - 02:30 PM",
          isAvailable: true,
        },
        dinner: {
          menu: day === "Friday" ? "Paneer Butter Masala / Chicken Curry with Jeera Rice" : "Dal Makhani, Seasonal Sabzi & Fresh Rotis",
          timings: "07:30 PM - 09:30 PM",
          isAvailable: true,
        },
        specialDietOptions: ["Vegetarian", "High Protein", "Jain"],
      }));

      schedules = await MealSchedule.insertMany(defaultSchedules);
    }

    res.json({
      success: true,
      schedules,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateMealSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const schedule = await MealSchedule.findById(id);

    if (!schedule) {
      res.status(404).json({ success: false, error: "Meal schedule entry not found" });
      return;
    }

    Object.assign(schedule, req.body);
    await schedule.save();

    res.json({
      success: true,
      message: "Meal plan updated successfully.",
      schedule,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
