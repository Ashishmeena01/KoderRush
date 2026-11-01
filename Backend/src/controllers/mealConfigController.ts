import { Request, Response } from "express";
import { Types } from "mongoose";
import { Meal } from "../models/Meal";
import { Hostel } from "../models/Hostel";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Default meal templates
const DEFAULT_MEALS = [
  {
    mealType: "breakfast" as const,
    name: "Masala Dosa, Idli-Vada with Sambar & Filter Coffee",
    price: 50,
    timings: "07:30 AM - 09:30 AM",
    isAvailable: true,
    tokenGenerationDeadline: "09:00 AM",
    tokenRedemptionDeadline: "09:30 AM",
  },
  {
    mealType: "lunch" as const,
    name: "Royal Thali: Dal Tadka, Paneer Butter Masala, Rice, Roti & Salad",
    price: 100,
    timings: "12:30 PM - 02:30 PM",
    isAvailable: true,
    tokenGenerationDeadline: "02:00 PM",
    tokenRedemptionDeadline: "02:30 PM",
  },
  {
    mealType: "dinner" as const,
    name: "Chef Special: Dum Biryani / Mix Veg, Dal Makhani & Gulab Jamun",
    price: 80,
    timings: "07:30 PM - 09:30 PM",
    isAvailable: true,
    tokenGenerationDeadline: "09:00 PM",
    tokenRedemptionDeadline: "09:30 PM",
  },
];

export const getTodayMeals = async (req: Request, res: Response): Promise<void> => {
  try {
    let hostelIdStr = req.query.hostelId as string | undefined;

    if (!hostelIdStr) {
      const defaultHostel = await Hostel.findOne();
      if (!defaultHostel) {
        res.status(404).json({ success: false, error: "No hostel registered" });
        return;
      }
      hostelIdStr = defaultHostel._id.toString();
    }

    const todayDayName = DAYS[new Date().getDay()];

    let meals: any[] = await Meal.find({
      hostelId: new Types.ObjectId(hostelIdStr),
      dayOfWeek: todayDayName,
    });

    // Auto-seed today's meals for this hostel if none exist
    if (!meals.length) {
      const newMeals = DEFAULT_MEALS.map((m) => ({
        ...m,
        hostelId: new Types.ObjectId(hostelIdStr),
        dayOfWeek: todayDayName,
      }));
      meals = await Meal.insertMany(newMeals);
    }

    res.json({
      success: true,
      day: todayDayName,
      date: new Date().toISOString(),
      meals,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getAllMealsForHostel = async (req: Request, res: Response): Promise<void> => {
  try {
    const hostelId = req.params.hostelId as string;
    let meals: any[] = await Meal.find({ hostelId: new Types.ObjectId(hostelId) }).sort({
      dayOfWeek: 1,
      mealType: 1,
    });

    if (!meals.length) {
      const weekMeals: any[] = [];
      for (const day of DAYS) {
        for (const tmpl of DEFAULT_MEALS) {
          weekMeals.push({
            ...tmpl,
            hostelId: new Types.ObjectId(hostelId),
            dayOfWeek: day,
          });
        }
      }
      meals = await Meal.insertMany(weekMeals);
    }

    res.json({
      success: true,
      meals,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createMealConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      hostelId,
      dayOfWeek,
      mealType,
      name,
      price,
      timings,
      isAvailable,
      tokenGenerationDeadline,
      tokenRedemptionDeadline,
    } = req.body;

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      res.status(404).json({ success: false, error: "Hostel not found" });
      return;
    }

    // Owner check
    if (req.user?.role !== "admin" && hostel.ownerId.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, error: "Unauthorized for this hostel" });
      return;
    }

    const meal = await Meal.findOneAndUpdate(
      { hostelId, dayOfWeek, mealType },
      {
        name,
        price: Number(price),
        timings,
        isAvailable: isAvailable ?? true,
        tokenGenerationDeadline: tokenGenerationDeadline || "09:00 AM",
        tokenRedemptionDeadline: tokenRedemptionDeadline || "09:30 AM",
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: "Meal configuration saved.",
      meal,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateMealConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const meal = await Meal.findById(id);

    if (!meal) {
      res.status(404).json({ success: false, error: "Meal configuration not found" });
      return;
    }

    const hostel = await Hostel.findById(meal.hostelId);
    if (!hostel || (req.user?.role !== "admin" && hostel.ownerId.toString() !== req.user?._id.toString())) {
      res.status(403).json({ success: false, error: "Unauthorized to modify meals for this hostel" });
      return;
    }

    const { name, price, timings, isAvailable, tokenGenerationDeadline, tokenRedemptionDeadline } = req.body;

    if (name !== undefined) meal.name = name;
    if (price !== undefined) meal.price = Number(price);
    if (timings !== undefined) meal.timings = timings;
    if (isAvailable !== undefined) meal.isAvailable = isAvailable;
    if (tokenGenerationDeadline !== undefined) meal.tokenGenerationDeadline = tokenGenerationDeadline;
    if (tokenRedemptionDeadline !== undefined) meal.tokenRedemptionDeadline = tokenRedemptionDeadline;

    await meal.save();

    res.json({
      success: true,
      message: "Meal pricing & availability updated successfully.",
      meal,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
