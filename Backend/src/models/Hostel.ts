import { Schema, model, Document, Types } from "mongoose";

export interface IHostel extends Document {
  name: string;
  description: string;
  address: string;
  city: string;
  pricePerMonth: number;
  gender: "all" | "male" | "female";
  amenities: string[];
  images: string[];
  rating: number;
  totalRooms: number;
  availableRooms: number;
  ownerId: Types.ObjectId;
  ownerName: string;
  contactPhone: string;
  contactEmail: string;
  status: "active" | "maintenance" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const hostelSchema = new Schema<IHostel>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    pricePerMonth: { type: Number, required: true },
    gender: { type: String, enum: ["all", "male", "female"], default: "all" },
    amenities: [{ type: String }],
    images: [{ type: String }],
    rating: { type: Number, default: 4.5 },
    totalRooms: { type: Number, required: true, default: 20 },
    availableRooms: { type: Number, required: true, default: 5 },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ownerName: { type: String, default: "Property Manager" },
    contactPhone: { type: String, default: "+1 555-0199" },
    contactEmail: { type: String, default: "owner@hostelhub.com" },
    status: { type: String, enum: ["active", "maintenance", "closed"], default: "active" },
  },
  { timestamps: true }
);

export const Hostel = model<IHostel>("Hostel", hostelSchema);

