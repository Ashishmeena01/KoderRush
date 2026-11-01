export type MealType = "breakfast" | "lunch" | "dinner";
export type MealTokenStatus = "active" | "redeemed" | "expired" | "cancelled";

export interface MealItem {
  _id: string;
  hostelId: string;
  dayOfWeek: string;
  mealType: MealType;
  name: string;
  price: number;
  timings: string;
  isAvailable: boolean;
  tokenGenerationDeadline: string;
  tokenRedemptionDeadline: string;
}

export interface MealToken {
  _id: string;
  residentId: string;
  residentName: string;
  residentEmail: string;
  hostelId: string;
  hostelName: string;
  mealId?: string;
  mealType: MealType;
  mealDate: string;
  tokenHash: string;
  priceSnapshot: number;
  status: MealTokenStatus;
  generatedAt: string;
  expiresAt: string;
  redeemedAt?: string;
  redeemedBy?: string;
  transactionId?: string;
}

export interface MealTransaction {
  _id: string;
  residentId: string;
  residentName: string;
  residentEmail?: string;
  hostelId: string;
  hostelName: string;
  mealTokenId: string;
  mealType: string;
  mealDate: string;
  amount: number;
  transactionType: "meal_charge";
  description: string;
  status: "completed" | "paid" | "refunded";
  createdAt: string;
}

export interface MealBillingSummary {
  outstandingBalance: number;
  currency: string;
  currencySymbol: string;
  transactions: MealTransaction[];
}

