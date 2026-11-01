import { Schema, model, Document, Types } from "mongoose";

export interface IRoom extends Document {
  hostelId: Types.ObjectId;
  roomNumber: string;
  type: "single" | "double" | "triple" | "dorm";
  capacity: number;
  occupied: number;
  pricePerMonth: number;
  floor: number;
  amenities: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    hostelId: { type: Schema.Types.ObjectId, ref: "Hostel", required: true, index: true },
    roomNumber: { type: String, required: true },
    type: { type: String, enum: ["single", "double", "triple", "dorm"], default: "double" },
    capacity: { type: Number, required: true, default: 2 },
    occupied: { type: Number, default: 0 },
    pricePerMonth: { type: Number, required: true },
    floor: { type: Number, default: 1 },
    amenities: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Room = model<IRoom>("Room", roomSchema);

