import { Schema, model, Document } from "mongoose";

export type UserRole = "resident" | "owner" | "admin";
export type AccountStatus = "pending" | "active" | "suspended";

export interface IUser extends Document {
  firebaseUid: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  outstandingMealBalance?: number;
  onboardingDetails?: {
    organizationName?: string;
    propertyLicense?: string;
    emergencyContact?: string;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["resident", "owner", "admin"],
      default: "resident",
    },
    accountStatus: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "active",
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    outstandingMealBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    onboardingDetails: {
      organizationName: { type: String, default: "" },
      propertyLicense: { type: String, default: "" },
      emergencyContact: { type: String, default: "" },
      notes: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>("User", userSchema);

