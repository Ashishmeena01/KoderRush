import { Request, Response, NextFunction } from "express";
import { verifyFirebaseToken } from "../config/firebaseAdmin";
import { User, IUser, UserRole } from "../models/User";

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      firebaseUid?: string;
    }
  }
}

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: "Authentication token missing or invalid format. Expected 'Bearer <token>'.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyFirebaseToken(token);

    if (!decoded || !decoded.uid) {
      res.status(401).json({
        success: false,
        error: "Invalid or expired authentication credentials.",
      });
      return;
    }

    req.firebaseUid = decoded.uid;

    // 1. Find user by unique Firebase UID
    let user = await User.findOne({ firebaseUid: decoded.uid });

    // 2. If not found by UID, match by email (links seeded or simulated accounts)
    if (!user && decoded.email) {
      user = await User.findOne({ email: decoded.email.toLowerCase().trim() });
      if (user) {
        user.firebaseUid = decoded.uid;
        await user.save();
      }
    }

    // 3. If still not found, automatically provision the profile in MongoDB
    if (!user) {
      const email = (decoded.email || `${decoded.uid}@hostelhub.com`).toLowerCase().trim();
      const isAdmin = email.includes("admin") || decoded.uid.includes("admin");
      const isOwner = email.includes("owner") || decoded.uid.includes("owner");
      const assignedRole: UserRole = isAdmin ? "admin" : isOwner ? "owner" : "resident";

      user = await User.create({
        firebaseUid: decoded.uid,
        fullName: decoded.email ? decoded.email.split("@")[0] : "Test User",
        email,
        phone: "+1 800-555-0199",
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(decoded.uid)}`,
        role: assignedRole,
        accountStatus: "active",
        emailVerified: true,
      });

      console.log(`[Auth] Auto-provisioned user in MongoDB: ${user.email} (${user.role})`);
    }

    // Synchronize email verification status if changed in Firebase
    if (decoded.email_verified !== undefined && user.emailVerified !== decoded.email_verified) {
      user.emailVerified = decoded.email_verified;
      await user.save();
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.error("[Auth Middleware Error]:", error.message);
    res.status(401).json({
      success: false,
      error: "Authentication failed. Token validation rejected.",
    });
  }
};
