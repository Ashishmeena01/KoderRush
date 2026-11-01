import { Schema, model, Document, Types } from "mongoose";

export interface IMealTransaction extends Document {
  residentId: Types.ObjectId;
  residentName: string;
  residentEmail: string;
  hostelId: Types.ObjectId;
  hostelName: string;
  mealTokenId: Types.ObjectId;
  mealType: string;
  mealDate: Date;
  amount: number;
  transactionType: "meal_charge";
  description: string;
  status: "completed" | "paid" | "refunded";
  createdAt: Date;
  updatedAt: Date;
}

const mealTransactionSchema = new Schema<IMealTransaction>(
  {
    residentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    residentName: { type: String, required: true },
    residentEmail: { type: String, required: true },
    hostelId: { type: Schema.Types.ObjectId, ref: "Hostel", required: true, index: true },
    hostelName: { type: String, required: true },
    mealTokenId: {
      type: Schema.Types.ObjectId,
      ref: "MealToken",
      required: true,
      unique: true, // Prevents duplicate charges for the same token!
      index: true,
    },
    mealType: { type: String, required: true },
    mealDate: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    transactionType: {
      type: String,
      default: "meal_charge",
    },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["completed", "paid", "refunded"],
      default: "completed",
    },
  },
  { timestamps: true }
);

export const MealTransaction = model<IMealTransaction>("MealTransaction", mealTransactionSchema);

