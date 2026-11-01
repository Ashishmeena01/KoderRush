import { Request, Response } from "express";
import { Hostel } from "../models/Hostel";
import { Room } from "../models/Room";
import { MealSchedule } from "../models/MealSchedule";

export const getHostels = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, city, minPrice, maxPrice, gender, amenity } = req.query;

    const query: any = { status: "active" };

    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: "i" } },
        { address: { $regex: search as string, $options: "i" } },
        { description: { $regex: search as string, $options: "i" } },
      ];
    }

    if (city && city !== "all") {
      query.city = { $regex: city as string, $options: "i" };
    }

    if (gender && gender !== "all") {
      query.gender = gender;
    }

    if (minPrice || maxPrice) {
      query.pricePerMonth = {};
      if (minPrice) query.pricePerMonth.$gte = Number(minPrice);
      if (maxPrice) query.pricePerMonth.$lte = Number(maxPrice);
    }

    if (amenity) {
      query.amenities = { $in: [amenity] };
    }

    const hostels = await Hostel.find(query).sort({ rating: -1, createdAt: -1 });

    res.json({
      success: true,
      count: hostels.length,
      hostels,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getHostelById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const hostel = await Hostel.findById(id);

    if (!hostel) {
      res.status(404).json({ success: false, error: "Hostel not found" });
      return;
    }

    const rooms = await Room.find({ hostelId: hostel._id });
    const mealSchedules = await MealSchedule.find({ hostelId: hostel._id });

    res.json({
      success: true,
      hostel,
      rooms,
      mealSchedules,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getOwnerHostels = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const hostels = await Hostel.find({ ownerId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: hostels.length,
      hostels,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createHostel = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const {
      name,
      description,
      address,
      city,
      pricePerMonth,
      gender,
      amenities,
      images,
      totalRooms,
      availableRooms,
      contactPhone,
      contactEmail,
    } = req.body;

    const hostel = await Hostel.create({
      name,
      description,
      address,
      city,
      pricePerMonth: Number(pricePerMonth),
      gender: gender || "all",
      amenities: amenities || ["High-speed WiFi", "Attached Washroom", "Power Backup"],
      images: images?.length
        ? images
        : [
            "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
          ],
      totalRooms: Number(totalRooms) || 20,
      availableRooms: Number(availableRooms) || 5,
      ownerId: req.user._id,
      ownerName: req.user.fullName,
      contactPhone: contactPhone || req.user.phone || "+1 555-0100",
      contactEmail: contactEmail || req.user.email,
    });

    res.status(201).json({
      success: true,
      message: "Hostel property published successfully.",
      hostel,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateHostel = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const hostel = await Hostel.findOne({ _id: id, ownerId: req.user._id });

    if (!hostel) {
      res.status(404).json({ success: false, error: "Hostel not found or unauthorized to edit" });
      return;
    }

    Object.assign(hostel, req.body);
    await hostel.save();

    res.json({
      success: true,
      message: "Hostel details updated.",
      hostel,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

