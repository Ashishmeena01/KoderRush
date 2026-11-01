import { Request, Response } from "express";
import { Booking } from "../models/Booking";
import { Hostel } from "../models/Hostel";

export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { hostelId, checkInDate, durationMonths, specialRequests } = req.body;

    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      res.status(404).json({ success: false, error: "Hostel not found" });
      return;
    }

    const months = Number(durationMonths) || 6;
    const total = hostel.pricePerMonth * months;

    const booking = await Booking.create({
      residentId: req.user._id,
      residentName: req.user.fullName,
      residentEmail: req.user.email,
      residentPhone: req.user.phone || "",
      hostelId: hostel._id,
      hostelName: hostel.name,
      checkInDate: new Date(checkInDate || Date.now()),
      durationMonths: months,
      monthlyRent: hostel.pricePerMonth,
      totalAmount: total,
      paymentStatus: "pending",
      bookingStatus: "pending",
      specialRequests: specialRequests || "",
    });

    res.status(201).json({
      success: true,
      message: "Booking request created successfully. Awaiting owner confirmation.",
      booking,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const bookings = await Booking.find({ residentId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getOwnerBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    // Find all hostels owned by current user
    const ownerHostels = await Hostel.find({ ownerId: req.user._id });
    const hostelIds = ownerHostels.map((h) => h._id);

    const bookings = await Booking.find({ hostelId: { $in: hostelIds } }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const { status, roomNumber } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      res.status(404).json({ success: false, error: "Booking not found" });
      return;
    }

    // Verify ownership of the hostel
    const hostel = await Hostel.findById(booking.hostelId);
    if (!hostel || (hostel.ownerId.toString() !== req.user._id.toString() && req.user.role !== "admin")) {
      res.status(403).json({ success: false, error: "Unauthorized to update this booking" });
      return;
    }

    if (status) booking.bookingStatus = status;
    if (roomNumber) booking.roomNumber = roomNumber;

    await booking.save();

    res.json({
      success: true,
      message: `Booking status updated to ${status}.`,
      booking,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const payInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, residentId: req.user._id });

    if (!booking) {
      res.status(404).json({ success: false, error: "Booking invoice not found" });
      return;
    }

    booking.paymentStatus = "paid";
    await booking.save();

    res.json({
      success: true,
      message: "Payment processed successfully. Receipt generated.",
      booking,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

