import { Schema, model, Document, Types } from "mongoose";

export interface IMealSchedule extends Document {
  hostelId: Types.ObjectId;
  dayOfWeek: string; // "Monday", "Tuesday", etc.
  dateString?: string;
  breakfast: {
    menu: string;
    timings: string;
    isAvailable: boolean;
  };
  lunch: {
    menu: string;
    timings: string;
    isAvailable: boolean;
  };
  dinner: {
    menu: string;
    timings: string;
    isAvailable: boolean;
  };
  specialDietOptions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const mealScheduleSchema = new Schema<IMealSchedule>(
  {
    hostelId: { type: Schema.Types.ObjectId, ref: "Hostel", required: true, index: true },
    dayOfWeek: { type: String, required: true },
    dateString: { type: String },
    breakfast: {
      menu: { type: String, required: true },
      timings: { type: String, default: "07:30 AM - 09:30 AM" },
      isAvailable: { type: Boolean, default: true },
    },
    lunch: {
      menu: { type: String, required: true },
      timings: { type: String, default: "12:30 PM - 02:30 PM" },
      isAvailable: { type: Boolean, default: true },
    },
    dinner: {
      menu: { type: String, required: true },
      timings: { type: String, default: "07:30 PM - 09:30 PM" },
      isAvailable: { type: Boolean, default: true },
    },
    specialDietOptions: [{ type: String }],
  },
  { timestamps: true }
);

export const MealSchedule = model<IMealSchedule>("MealSchedule", mealScheduleSchema);

