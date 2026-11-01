export interface Hostel {
  _id: string;
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
  ownerId: string;
  ownerName: string;
  contactPhone: string;
  contactEmail: string;
  status: "active" | "maintenance" | "closed";
  createdAt: string;
}

export interface Room {
  _id: string;
  hostelId: string;
  roomNumber: string;
  type: "single" | "double" | "triple" | "dorm";
  capacity: number;
  occupied: number;
  pricePerMonth: number;
  floor: number;
  amenities: string[];
  isAvailable: boolean;
}

export interface Booking {
  _id: string;
  residentId: string;
  residentName: string;
  residentEmail: string;
  residentPhone?: string;
  hostelId: string;
  hostelName: string;
  roomId?: string;
  roomNumber?: string;
  checkInDate: string;
  durationMonths: number;
  monthlyRent: number;
  totalAmount: number;
  paymentStatus: "paid" | "pending" | "due";
  bookingStatus: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  specialRequests?: string;
  createdAt: string;
}

export interface MealSchedule {
  _id: string;
  hostelId: string;
  dayOfWeek: string;
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
}

