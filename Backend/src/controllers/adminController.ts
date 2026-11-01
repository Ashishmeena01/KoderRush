import { Request, Response } from "express";
import { User } from "../models/User";
import { Hostel } from "../models/Hostel";
import { Booking } from "../models/Booking";

export const getPendingOwners = async (_req: Request, res: Response): Promise<void> => {
  try {
    const pendingOwners = await User.find({
      role: "owner",
      accountStatus: "pending",
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pendingOwners.length,
      owners: pendingOwners,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const reviewOwner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "approve" or "reject"

    const owner = await User.findById(id);
    if (!owner) {
      res.status(404).json({ success: false, error: "Owner user not found" });
      return;
    }

    if (action === "approve") {
      owner.accountStatus = "active";
    } else if (action === "reject") {
      owner.accountStatus = "suspended";
    } else {
      res.status(400).json({ success: false, error: "Invalid action. Expected 'approve' or 'reject'." });
      return;
    }

    await owner.save();

    res.json({
      success: true,
      message: `Owner account has been ${action === "approve" ? "approved" : "rejected"}.`,
      owner,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getPlatformMetrics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalHostels, totalBookings, bookings] = await Promise.all([
      User.countDocuments(),
      Hostel.countDocuments(),
      Booking.countDocuments(),
      Booking.find({ paymentStatus: "paid" }),
    ]);

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);

    res.json({
      success: true,
      metrics: {
        totalUsers,
        totalHostels,
        totalBookings,
        totalRevenue,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

