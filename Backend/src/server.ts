import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import { seedDatabase } from "./seeds/seedData";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/authRoutes";
import hostelRoutes from "./routes/hostelRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import mealRoutes from "./routes/mealRoutes";
import mealTokenRoutes from "./routes/mealTokenRoutes";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.set("trust proxy", false);

// 1. Security Headers (nevergethacked compliance)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

// 2. CORS Configuration
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 3. Rate Limiting Protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests from this IP address. Please try again after 15 minutes.",
  },
});
app.use("/api/", limiter);

// 4. Body Parsers with payload limits
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// 5. Health Check Endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Hostel Platform API (MERN + Firebase Auth)",
  });
});

// 6. Application Routes
app.use("/api/auth", authRoutes);
app.use("/api/hostels", hostelRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/meal-tokens", mealTokenRoutes);
app.use("/api/admin", adminRoutes);

// 7. Central Error Handling Middleware
app.use(errorHandler);

// 8. Server Bootstrapping
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 HostelHub API Server is active on port: ${PORT}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🛡️  Security: Helmet, Rate Limiter & RBAC Active`);
      console.log(`===============================================`);
    });
  } catch (error: any) {
    console.error("FATAL: Failed to start backend server:", error.message);
    process.exit(1);
  }
};

startServer();

