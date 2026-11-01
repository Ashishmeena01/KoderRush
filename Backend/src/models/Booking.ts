import { Schema, model, Document, Types } from "mongoose";

export interface IBooking extends Document {
  residentId: Types.ObjectId;
  residentName: string;
  residentEmail: string;
  residentPhone?: string;
  hostelId: Types.ObjectId;
  hostelName: string;
  roomId?: Types.ObjectId;
  roomNumber?: string;
  checkInDate: Date;
  durationMonths: number;
  monthlyRent: number;
  totalAmount: number;
  paymentStatus: "paid" | "pending" | "due";
  bookingStatus: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    residentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    residentName: { type: String, required: true },
    residentEmail: { type: String, required: true },
    residentPhone: { type: String, default: "" },
    hostelId: { type: Schema.Types.ObjectId, ref: "Hostel", required: true, index: true },
    hostelName: { type: String, required: true },
    roomId: { type: Schema.Types.ObjectId, ref: "Room" },
    roomNumber: { type: String, default: "TBD" },
    checkInDate: { type: Date, required: true },
    durationMonths: { type: Number, required: true, default: 6 },
    monthlyRent: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["paid", "pending", "due"], default: "pending" },
    bookingStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "completed"],
      default: "pending",
      index: true,
    },
    specialRequests: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Booking = model<IBooking>("Booking", bookingSchema);

