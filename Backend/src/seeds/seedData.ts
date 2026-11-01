import { User } from "../models/User";
import { Hostel } from "../models/Hostel";
import { Room } from "../models/Room";
import { MealSchedule } from "../models/MealSchedule";
import { Booking } from "../models/Booking";
import { Meal } from "../models/Meal";
import { MealToken } from "../models/MealToken";
import { MealTransaction } from "../models/MealTransaction";

export const seedDatabase = async () => {
  try {
    // Check if test users already exist
    const adminUser = await User.findOne({ email: "admin@hostelhub.com" });
    const ownerUser = await User.findOne({ email: "owner@urbanliving.com" });
    const residentUser = await User.findOne({ email: "resident@student.edu" });

    let admin = adminUser;
    let owner = ownerUser;
    let resident = residentUser;

    // 1. Ensure Admin User exists in MongoDB
    if (!admin) {
      admin = await User.create({
        firebaseUid: "admin-platform-uid",
        fullName: "Platform Administrator",
        email: "admin@hostelhub.com",
        phone: "+1 800-555-0100",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        role: "admin",
        accountStatus: "active",
        emailVerified: true,
      });
      console.log("[Seed] Admin user seeded in MongoDB.");
    }

    // 2. Ensure Owner User exists in MongoDB
    if (!owner) {
      owner = await User.create({
        firebaseUid: "owner-urban-uid",
        fullName: "Vikram Malhotra",
        email: "owner@urbanliving.com",
        phone: "+1 800-555-0188",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        role: "owner",
        accountStatus: "active",
        emailVerified: true,
        onboardingDetails: {
          organizationName: "Malhotra Stays & Hospitality",
          propertyLicense: "LIC-NYC-98442",
        },
      });
      console.log("[Seed] Owner user seeded in MongoDB.");
    }

    // 3. Ensure Pending Owner User exists in MongoDB
    const pendingOwner = await User.findOne({ email: "elena@skylinehostels.com" });
    if (!pendingOwner) {
      await User.create({
        firebaseUid: "owner-pending-uid",
        fullName: "Elena Rostova",
        email: "elena@skylinehostels.com",
        phone: "+1 800-555-0199",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
        role: "owner",
        accountStatus: "pending",
        emailVerified: true,
        onboardingDetails: {
          organizationName: "Skyline Premium Coliving",
          propertyLicense: "LIC-SF-20241",
          notes: "Requesting approval for 35-bed tech hostel near Downtown campus.",
        },
      });
      console.log("[Seed] Pending Owner seeded in MongoDB.");
    }

    // 4. Ensure Resident User exists in MongoDB
    if (!resident) {
      resident = await User.create({
        firebaseUid: "resident-student-uid",
        fullName: "Rohan Patel",
        email: "resident@student.edu",
        phone: "+1 800-555-0144",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
        role: "resident",
        accountStatus: "active",
        emailVerified: true,
      });
      console.log("[Seed] Resident user seeded in MongoDB.");
    }

    // 5. Ensure Hostels exist
    const hostelCount = await Hostel.countDocuments();
    let hostel1: any;
    if (hostelCount === 0 && owner) {
      hostel1 = await Hostel.create({
        name: "The Zenith Student Sanctuary",
        description:
          "Modern luxury living engineered for students and tech interns. Ultra-fast optic fiber internet, biometric security, air conditioning, and chef-curated balanced daily meals.",
        address: "442 Tech Boulevard, University District",
        city: "Austin",
        pricePerMonth: 650,
        gender: "all",
        amenities: [
          "1 Gbps Fiber WiFi",
          "Biometric Security",
          "Air Conditioned",
          "3 Times Meal Included",
          "Gym & Fitness Zone",
          "Study Pods",
        ],
        images: [
          "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80",
        ],
        rating: 4.9,
        totalRooms: 40,
        availableRooms: 8,
        ownerId: owner._id,
        ownerName: owner.fullName,
        contactPhone: owner.phone,
        contactEmail: owner.email,
        status: "active",
      });

      const hostel2 = await Hostel.create({
        name: "Solace Heights Coliving",
        description:
          "Calm, light-filled spaces designed for focused learning and community connection. Includes attached private balconies, daily housekeeping, and laundry service.",
        address: "128 Pine Hill Road, West End",
        city: "Seattle",
        pricePerMonth: 580,
        gender: "all",
        amenities: [
          "High-speed WiFi",
          "Balcony View",
          "Daily Housekeeping",
          "In-house Laundry",
          "CCTV Surveillance",
          "Library Lounge",
        ],
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
        ],
        rating: 4.8,
        totalRooms: 30,
        availableRooms: 4,
        ownerId: owner._id,
        ownerName: owner.fullName,
        contactPhone: owner.phone,
        contactEmail: owner.email,
        status: "active",
      });

      await Hostel.create({
        name: "Urban Nest Women's Residency",
        description:
          "Safe, vibrant and strictly monitored premium women's residency with 24/7 female warden, biometric entry gates, doctor on call, and nutritious organic food.",
        address: "79 Bloom Street, Garden Quarter",
        city: "Boston",
        pricePerMonth: 520,
        gender: "female",
        amenities: [
          "24/7 Female Warden",
          "Biometric Turnstiles",
          "Doctor on Call",
          "Organic Meals",
          "High-speed WiFi",
          "Yoga Terrace",
        ],
        images: [
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80",
        ],
        rating: 4.95,
        totalRooms: 25,
        availableRooms: 3,
        ownerId: owner._id,
        ownerName: owner.fullName,
        contactPhone: owner.phone,
        contactEmail: owner.email,
        status: "active",
      });

      // Seed Rooms for Hostel 1
      await Room.create([
        {
          hostelId: hostel1._id,
          roomNumber: "101",
          type: "single",
          capacity: 1,
          occupied: 1,
          pricePerMonth: 850,
          floor: 1,
          amenities: ["Attached Bath", "Work Desk", "Balcony"],
          isAvailable: false,
        },
        {
          hostelId: hostel1._id,
          roomNumber: "102",
          type: "double",
          capacity: 2,
          occupied: 1,
          pricePerMonth: 650,
          floor: 1,
          amenities: ["Twin Beds", "Study Lamps", "Air Conditioning"],
          isAvailable: true,
        },
      ]);

      // Seed Weekly Meal Schedules
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      for (const day of days) {
        await MealSchedule.create({
          hostelId: hostel1._id,
          dayOfWeek: day,
          breakfast: {
            menu: day === "Sunday" ? "Belgian Waffles, Scrambled Eggs & Espresso" : "Fresh Granola, Fruit Bowl, Omelette & Cappuccino",
            timings: "07:30 AM - 09:30 AM",
            isAvailable: true,
          },
          lunch: {
            menu: "Herb Grilled Chicken / Paneer Steak with Quinoa & Steamed Greens",
            timings: "12:30 PM - 02:30 PM",
            isAvailable: true,
          },
          dinner: {
            menu: day === "Friday" ? "Handmade Pizza, Caesar Salad & Gelato" : "Creamy Tomato Basil Penne with Roasted Garlic Bread",
            timings: "07:30 PM - 09:30 PM",
            isAvailable: true,
          },
          specialDietOptions: ["Gluten-Free", "High Protein", "Vegan"],
        });
      }
    } else {
      hostel1 = await Hostel.findOne();
    }

    // 6. Ensure Bookings exist for Resident
    if (resident && hostel1) {
      const existingBooking = await Booking.findOne({ residentId: resident._id });
      if (!existingBooking) {
        await Booking.create([
          {
            residentId: resident._id,
            residentName: resident.fullName,
            residentEmail: resident.email,
            residentPhone: resident.phone,
            hostelId: hostel1._id,
            hostelName: hostel1.name,
            roomNumber: "102",
            checkInDate: new Date("2026-11-01"),
            durationMonths: 6,
            monthlyRent: hostel1.pricePerMonth,
            totalAmount: hostel1.pricePerMonth * 6,
            paymentStatus: "paid",
            bookingStatus: "approved",
            specialRequests: "Quiet study floor, vegetarian diet plan",
          },
          {
            residentId: resident._id,
            residentName: resident.fullName,
            residentEmail: resident.email,
            residentPhone: resident.phone,
            hostelId: hostel1._id,
            hostelName: hostel1.name,
            roomNumber: "Pending Allocation",
            checkInDate: new Date("2027-05-01"),
            durationMonths: 3,
            monthlyRent: hostel1.pricePerMonth,
            totalAmount: hostel1.pricePerMonth * 3,
            paymentStatus: "pending",
            bookingStatus: "pending",
            specialRequests: "Balcony room preference",
          },
        ]);
        console.log("[Seed] Resident bookings seeded in MongoDB.");
      }
    }

    // 7. Ensure Meal Configurations exist for Hostel
    if (hostel1) {
      const mealCount = await Meal.countDocuments({ hostelId: hostel1._id });
      if (mealCount === 0) {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const mealSeeds: any[] = [];
        for (const day of days) {
          mealSeeds.push(
            {
              hostelId: hostel1._id,
              dayOfWeek: day,
              mealType: "breakfast",
              name: day === "Sunday" ? "Poori Bhaji, Sprouts Salad & Tea" : "Masala Dosa, Idli-Vada with Sambar & Filter Coffee",
              price: 50,
              timings: "07:30 AM - 09:30 AM",
              isAvailable: true,
              tokenGenerationDeadline: "09:00 AM",
              tokenRedemptionDeadline: "09:30 AM",
            },
            {
              hostelId: hostel1._id,
              dayOfWeek: day,
              mealType: "lunch",
              name: "Royal Thali: Dal Tadka, Paneer Butter Masala, Basmati Rice, Phulka Roti & Salad",
              price: 100,
              timings: "12:30 PM - 02:30 PM",
              isAvailable: true,
              tokenGenerationDeadline: "02:00 PM",
              tokenRedemptionDeadline: "02:30 PM",
            },
            {
              hostelId: hostel1._id,
              dayOfWeek: day,
              mealType: "dinner",
              name: day === "Friday" ? "Dum Biryani / Shahi Paneer, Raita & Gulab Jamun" : "Dal Makhani, Seasonal Sabzi, Tandoori Roti & Kheer",
              price: 80,
              timings: "07:30 PM - 09:30 PM",
              isAvailable: true,
              tokenGenerationDeadline: "09:00 PM",
              tokenRedemptionDeadline: "09:30 PM",
            }
          );
        }
        await Meal.insertMany(mealSeeds);
        console.log("[Seed] 21 Meal items (Breakfast/Lunch/Dinner) seeded for hostel.");
      }

      // 8. Ensure a sample redeemed token & billing transaction for resident
      if (resident) {
        const existingToken = await MealToken.findOne({ residentId: resident._id });
        if (!existingToken) {
          const pastDate = new Date();
          pastDate.setDate(pastDate.getDate() - 1);
          pastDate.setHours(13, 0, 0, 0);

          const sampleToken = await MealToken.create({
            residentId: resident._id,
            residentName: resident.fullName,
            residentEmail: resident.email,
            hostelId: hostel1._id,
            hostelName: hostel1.name,
            mealType: "lunch",
            mealDate: pastDate,
            tokenHash: "HH-LU-DEMO100X",
            priceSnapshot: 100,
            status: "redeemed",
            generatedAt: new Date(pastDate.getTime() - 3600000),
            expiresAt: new Date(pastDate.getTime() + 7200000),
            redeemedAt: pastDate,
            redeemedBy: owner?._id,
          });

          const sampleTx = await MealTransaction.create({
            residentId: resident._id,
            residentName: resident.fullName,
            residentEmail: resident.email,
            hostelId: hostel1._id,
            hostelName: hostel1.name,
            mealTokenId: sampleToken._id,
            mealType: "lunch",
            mealDate: pastDate,
            amount: 100,
            transactionType: "meal_charge",
            description: "LUNCH meal served at " + hostel1.name,
            status: "completed",
            createdAt: pastDate,
          });

          sampleToken.transactionId = sampleTx._id as any;
          await sampleToken.save();

          await User.findByIdAndUpdate(resident._id, {
            $set: { outstandingMealBalance: 100 },
          });

          console.log("[Seed] Sample redeemed meal token & ₹100 billing transaction seeded for resident.");
        }
      }
    }

    console.log("[Seed] Database verification & seeding completed successfully.");
  } catch (err: any) {
    console.error("[Seed Error]:", err.message);
  }
};
