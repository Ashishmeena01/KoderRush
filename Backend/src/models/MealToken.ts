import { Schema, model, Document, Types } from "mongoose";

export type MealTokenType = "breakfast" | "lunch" | "dinner";
export type MealTokenStatus = "active" | "redeemed" | "expired" | "cancelled";

export interface IMealToken extends Document {
  residentId: Types.ObjectId;
  residentName: string;
  residentEmail: string;
  hostelId: Types.ObjectId;
  hostelName: string;
  mealId?: Types.ObjectId;
  mealType: MealTokenType;
  mealDate: Date;
  tokenHash: string;
  priceSnapshot: number;
  status: MealTokenStatus;
  generatedAt: Date;
  expiresAt: Date;
  redeemedAt?: Date;
  redeemedBy?: Types.ObjectId;
  transactionId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const mealTokenSchema = new Schema<IMealToken>(
  {
    residentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    residentName: { type: String, required: true },
    residentEmail: { type: String, required: true },
    hostelId: { type: Schema.Types.ObjectId, ref: "Hostel", required: true, index: true },
    hostelName: { type: String, required: true },
    mealId: { type: Schema.Types.ObjectId, ref: "Meal" },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner"],
      required: true,
    },
    mealDate: { type: Date, required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    priceSnapshot: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["active", "redeemed", "expired", "cancelled"],
      default: "active",
      index: true,
    },
    generatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    redeemedAt: { type: Date },
    redeemedBy: { type: Schema.Types.ObjectId, ref: "User" },
    transactionId: { type: Schema.Types.ObjectId, ref: "MealTransaction" },
  },
  { timestamps: true }
);

// Prevent duplicate active/redeemed tokens for the same resident, meal, and date
mealTokenSchema.index({ residentId: 1, mealDate: 1, mealType: 1 }, { background: true });

export const MealToken = model<IMealToken>("MealToken", mealTokenSchema);

