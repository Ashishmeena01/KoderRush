import { Request, Response } from "express";
import crypto from "crypto";
import { Types } from "mongoose";
import { MealToken } from "../models/MealToken";
import { MealTransaction } from "../models/MealTransaction";
import { Meal } from "../models/Meal";
import { Hostel } from "../models/Hostel";
import { User } from "../models/User";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * 1. RESIDENT: Generate a secure digital meal token
 */
export const generateMealToken = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Authentication required" });
      return;
    }

    const { hostelId, mealType, mealDate } = req.body;

    if (!hostelId || !mealType) {
      res.status(400).json({ success: false, error: "hostelId and mealType are required" });
      return;
    }

    if (!["breakfast", "lunch", "dinner"].includes(mealType)) {
      res.status(400).json({ success: false, error: "mealType must be breakfast, lunch, or dinner" });
      return;
    }

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      res.status(404).json({ success: false, error: "Hostel not found" });
      return;
    }

    // Determine target date (default to today)
    const targetDate = mealDate ? new Date(mealDate) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const todayDayName = DAYS[targetDate.getDay()];

    // 1. Authoritative Backend Meal Config Check
    let meal: any = await Meal.findOne({
      hostelId: hostel._id,
      dayOfWeek: todayDayName,
      mealType,
    });

    // Fallback default if not yet seeded
    if (!meal) {
      const defaultPrices: Record<string, { price: number; timings: string; name: string }> = {
        breakfast: { price: 50, timings: "07:30 AM - 09:30 AM", name: "South Indian Breakfast & Filter Coffee" },
        lunch: { price: 100, timings: "12:30 PM - 02:30 PM", name: "Standard Full Meal Thali" },
        dinner: { price: 80, timings: "07:30 PM - 09:30 PM", name: "Chef Special Dinner & Dessert" },
      };
      const def = defaultPrices[mealType] || { price: 80, timings: "07:30 PM - 09:30 PM", name: "Dining Meal" };
      meal = await Meal.create({
        hostelId: hostel._id,
        dayOfWeek: todayDayName,
        mealType,
        name: def.name,
        price: def.price,
        timings: def.timings,
        isAvailable: true,
        tokenGenerationDeadline: "09:00 PM",
        tokenRedemptionDeadline: "09:30 PM",
      });
    }

    // 2. Meal Availability Check
    if (!meal.isAvailable) {
      res.status(400).json({
        success: false,
        error: `Sorry, ${mealType} service is unavailable at ${hostel.name} today.`,
      });
      return;
    }

    // 3. Duplicate Prevention: Check for existing active or redeemed token
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const existingToken = await MealToken.findOne({
      residentId: req.user._id,
      mealType,
      mealDate: { $gte: targetDate, $lt: nextDay },
      status: { $in: ["active", "redeemed"] },
    });

    if (existingToken) {
      res.status(409).json({
        success: false,
        error: `You already have an ${existingToken.status} token for ${mealType} on this date. Each resident can claim one token per meal.`,
        existingToken,
      });
      return;
    }

    // 4. Secure Unpredictable Token Identifier
    const randomHex = crypto.randomBytes(8).toString("hex").toUpperCase();
    const tokenHash = `HH-${mealType.substring(0, 2).toUpperCase()}-${randomHex}`;

    // Expiration: End of meal window (or end of target date)
    const expiresAt = new Date(targetDate);
    expiresAt.setHours(23, 59, 59, 999);

    // 5. Create Token with Frozen Price Snapshot
    const mealToken = await MealToken.create({
      residentId: req.user._id,
      residentName: req.user.fullName,
      residentEmail: req.user.email,
      hostelId: hostel._id,
      hostelName: hostel.name,
      mealId: meal._id,
      mealType,
      mealDate: targetDate,
      tokenHash,
      priceSnapshot: meal.price, // Authoritative snapshot
      status: "active",
      generatedAt: new Date(),
      expiresAt,
    });

    res.status(201).json({
      success: true,
      message: "Meal token generated successfully! Show the QR code at the dining counter.",
      token: mealToken,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 2. RESIDENT: Get all tokens belonging to the current user
 */
export const getMyTokens = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Authentication required" });
      return;
    }

    const tokens = await MealToken.find({ residentId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tokens.length,
      tokens,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 3. RESIDENT / STAFF: Retrieve token by ID or Hash
 */
export const getTokenById = async (req: Request, res: Response): Promise<void> => {
  try {
    const idStr = String(req.params.id);

    const isObjectId = Types.ObjectId.isValid(idStr);
    const token: any = await MealToken.findOne(
      isObjectId ? { _id: new Types.ObjectId(idStr) } : { tokenHash: idStr }
    );

    if (!token) {
      res.status(404).json({ success: false, error: "Meal token not found" });
      return;
    }

    // Permission check: resident who owns it OR owner/admin
    if (
      req.user?.role === "resident" &&
      token.residentId.toString() !== req.user._id.toString()
    ) {
      res.status(403).json({ success: false, error: "Access denied to this token" });
      return;
    }

    res.json({
      success: true,
      token,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 4. STAFF / OWNER: Verify Scanned QR Token
 */
export const verifyMealToken = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Authentication required" });
      return;
    }

    const { tokenIdentifier } = req.body;
    if (!tokenIdentifier) {
      res.status(400).json({ success: false, error: "tokenIdentifier is required" });
      return;
    }

    const idStr = String(tokenIdentifier);
    const isObjectId = Types.ObjectId.isValid(idStr);
    const token: any = await MealToken.findOne(
      isObjectId ? { $or: [{ _id: new Types.ObjectId(idStr) }, { tokenHash: idStr }] } : { tokenHash: idStr }
    );

    if (!token) {
      res.status(404).json({
        success: false,
        verified: false,
        error: "Invalid meal token. Token does not exist in records.",
      });
      return;
    }

    // Check hostel authority if user is owner
    if (req.user.role === "owner") {
      const ownedHostels = await Hostel.find({ ownerId: req.user._id });
      if (ownedHostels.length > 0) {
        const isOwnerOfHostel = ownedHostels.some(
          (h) => h._id.toString() === token.hostelId.toString()
        );
        if (!isOwnerOfHostel) {
          res.status(403).json({
            success: false,
            verified: false,
            error: "Unauthorized: This meal token belongs to a different hostel property.",
          });
          return;
        }
      }
    }

    // Check status
    if (token.status === "redeemed") {
      res.status(400).json({
        success: false,
        verified: false,
        status: "redeemed",
        error: `Token already REDEEMED at ${token.redeemedAt ? new Date(token.redeemedAt).toLocaleTimeString() : "earlier time"}. Cannot be redeemed twice.`,
        token,
      });
      return;
    }

    if (token.status === "cancelled") {
      res.status(400).json({
        success: false,
        verified: false,
        status: "cancelled",
        error: "This token has been cancelled and cannot be used.",
        token,
      });
      return;
    }

    // Check expiration
    if (token.status === "expired" || new Date() > new Date(token.expiresAt)) {
      if (token.status !== "expired") {
        token.status = "expired";
        await token.save();
      }
      res.status(400).json({
        success: false,
        verified: false,
        status: "expired",
        error: "This meal token has EXPIRED. Meal collection window is closed.",
        token,
      });
      return;
    }

    // Verified and eligible for redemption!
    res.json({
      success: true,
      verified: true,
      isEligibleForRedemption: true,
      token: {
        _id: token._id,
        tokenHash: token.tokenHash,
        residentName: token.residentName,
        residentEmail: token.residentEmail,
        residentId: token.residentId,
        hostelName: token.hostelName,
        mealType: token.mealType,
        mealDate: token.mealDate,
        priceSnapshot: token.priceSnapshot,
        status: token.status,
        expiresAt: token.expiresAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 5. STAFF / OWNER: Redeem Token & Atomic Automatic Billing
 */
export const redeemMealToken = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Authentication required" });
      return;
    }

    const { tokenIdentifier } = req.body;
    if (!tokenIdentifier) {
      res.status(400).json({ success: false, error: "tokenIdentifier is required" });
      return;
    }

    const idStr = String(tokenIdentifier);
    const isObjectId = Types.ObjectId.isValid(idStr);

    const query: any = isObjectId
      ? { $or: [{ _id: new Types.ObjectId(idStr) }, { tokenHash: idStr }], status: "active" }
      : { tokenHash: idStr, status: "active" };

    // ATOMIC REDEMPTION: Find and transition from 'active' to 'redeemed'
    const redeemedToken: any = await MealToken.findOneAndUpdate(
      query,
      {
        status: "redeemed",
        redeemedAt: new Date(),
        redeemedBy: req.user._id,
      },
      { new: true }
    );

    if (!redeemedToken) {
      // Check existing token to provide descriptive rejection reason
      const existing: any = await MealToken.findOne(
        isObjectId ? { $or: [{ _id: new Types.ObjectId(idStr) }, { tokenHash: idStr }] } : { tokenHash: idStr }
      );

      if (!existing) {
        res.status(404).json({ success: false, error: "Token not found" });
        return;
      }

      if (existing.status === "redeemed") {
        res.status(400).json({
          success: false,
          error: "Token has ALREADY been redeemed! Duplicate scan rejected.",
          redeemedAt: existing.redeemedAt,
        });
        return;
      }

      if (existing.status === "expired" || new Date() > new Date(existing.expiresAt)) {
        res.status(400).json({ success: false, error: "Token has expired." });
        return;
      }

      res.status(400).json({ success: false, error: `Token cannot be redeemed (status: ${existing.status})` });
      return;
    }

    // ATOMIC BILLING: Idempotent transaction generation
    let transaction: any = await MealTransaction.findOne({ mealTokenId: redeemedToken._id });

    if (!transaction) {
      transaction = await MealTransaction.create({
        residentId: redeemedToken.residentId,
        residentName: redeemedToken.residentName,
        residentEmail: redeemedToken.residentEmail,
        hostelId: redeemedToken.hostelId,
        hostelName: redeemedToken.hostelName,
        mealTokenId: redeemedToken._id,
        mealType: redeemedToken.mealType,
        mealDate: redeemedToken.mealDate,
        amount: redeemedToken.priceSnapshot,
        transactionType: "meal_charge",
        description: `${redeemedToken.mealType.toUpperCase()} meal served at ${redeemedToken.hostelName}`,
        status: "completed",
      });

      // Link transaction ID
      redeemedToken.transactionId = transaction._id;
      await redeemedToken.save();

      // Update resident outstanding meal balance atomically
      await User.findByIdAndUpdate(redeemedToken.residentId, {
        $inc: { outstandingMealBalance: redeemedToken.priceSnapshot },
      });
    }

    const formattedDate = new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(redeemedToken.mealDate));

    // Return the exact expected format
    res.json({
      success: true,
      message: "MEAL VERIFIED SUCCESSFULLY",
      redemption: {
        resident: redeemedToken.residentName,
        residentEmail: redeemedToken.residentEmail,
        meal: redeemedToken.mealType.charAt(0).toUpperCase() + redeemedToken.mealType.slice(1),
        date: formattedDate,
        amount: redeemedToken.priceSnapshot,
        status: "Redeemed",
        billing: "Successfully charged",
        tokenHash: redeemedToken.tokenHash,
        transactionId: transaction._id,
        redeemedAt: redeemedToken.redeemedAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 6. STAFF / OWNER: View Redemption History
 */
export const getRedemptionHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Authentication required" });
      return;
    }

    let filter: any = { status: "redeemed" };

    if (req.user.role === "owner") {
      const ownedHostels = await Hostel.find({ ownerId: req.user._id });
      const hostelIds = ownedHostels.map((h) => h._id);
      if (hostelIds.length > 0) {
        filter.hostelId = { $in: hostelIds };
      }
    } else if (req.user.role === "resident") {
      filter.residentId = req.user._id;
    }

    const history = await MealToken.find(filter)
      .sort({ redeemedAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 7. RESIDENT: Get Meal Billing History & Outstanding Balance
 */
export const getResidentMealBilling = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Authentication required" });
      return;
    }

    const transactions = await MealTransaction.find({ residentId: req.user._id }).sort({
      createdAt: -1,
    });

    const user = await User.findById(req.user._id);
    const outstanding = user?.outstandingMealBalance || 0;

    res.json({
      success: true,
      outstandingBalance: outstanding,
      currency: "INR",
      currencySymbol: "₹",
      transactions,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 8. RESIDENT: Pay / Settle Outstanding Meal Balance
 */
export const payResidentMealBilling = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Authentication required" });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    const previousBalance = user.outstandingMealBalance || 0;

    user.outstandingMealBalance = 0;
    await user.save();

    await MealTransaction.updateMany(
      { residentId: req.user._id, status: "completed" },
      { status: "paid" }
    );

    res.json({
      success: true,
      message: `Outstanding meal dues of ₹${previousBalance} paid successfully. Digital receipt issued.`,
      outstandingBalance: 0,
      clearedAmount: previousBalance,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
