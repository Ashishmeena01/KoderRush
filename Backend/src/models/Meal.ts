import { Schema, model, Document, Types } from "mongoose";

export type MealType = "breakfast" | "lunch" | "dinner";

export interface IMeal extends Document {
  hostelId: Types.ObjectId;
  dayOfWeek: string; // "Monday", "Tuesday", etc.
  mealType: MealType;
  name: string;
  price: number;
  timings: string;
  isAvailable: boolean;
  tokenGenerationDeadline: string; // e.g., "09:00 AM"
  tokenRedemptionDeadline: string; // e.g., "09:30 AM"
  createdAt: Date;
  updatedAt: Date;
}

const mealSchema = new Schema<IMeal>(
  {
    hostelId: { type: Schema.Types.ObjectId, ref: "Hostel", required: true, index: true },
    dayOfWeek: { type: String, required: true },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner"],
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    timings: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    tokenGenerationDeadline: { type: String, default: "09:00 AM" },
    tokenRedemptionDeadline: { type: String, default: "09:30 AM" },
  },
  { timestamps: true }
);

mealSchema.index({ hostelId: 1, dayOfWeek: 1, mealType: 1 }, { unique: true });

export const Meal = model<IMeal>("Meal", mealSchema);

