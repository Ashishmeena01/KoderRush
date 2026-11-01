import { Request, Response } from "express";
import { User, UserRole } from "../models/User";
import { z } from "zod";

const onboardingSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  role: z.enum(["resident", "owner"]),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  organizationName: z.string().optional(),
  propertyLicense: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export const syncSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const firebaseUid = req.firebaseUid;
    const { email, fullName, avatar } = req.body;

    if (!firebaseUid) {
      res.status(401).json({ success: false, error: "Firebase UID missing" });
      return;
    }

    let user = await User.findOne({ firebaseUid });

    if (!user && email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
      if (user) {
        user.firebaseUid = firebaseUid;
        await user.save();
      }
    }

    if (!user) {
      // First-time sign in with Google or Email: create base profile
      const userEmail = (email || `${firebaseUid}@hostelhub.com`).toLowerCase().trim();
      const userName = fullName || "User";

      const isAdminEmail = userEmail === "admin@hostelhub.com" || userEmail.includes("admin");
      const isOwnerEmail = userEmail === "owner@urbanliving.com" || userEmail.includes("owner");
      const assignedRole: UserRole = isAdminEmail ? "admin" : isOwnerEmail ? "owner" : "resident";

      user = await User.create({
        firebaseUid,
        email: userEmail,
        fullName: userName,
        avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`,
        role: assignedRole,
        accountStatus: "active",
        emailVerified: true,
      });

      console.log(`[Auth] New user profile registered in MongoDB: ${user.email} (${user.role})`);
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        accountStatus: user.accountStatus,
        emailVerified: user.emailVerified,
        onboardingDetails: user.onboardingDetails,
      },
    });
  } catch (err: any) {
    console.error("[Sync Session Error]:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    res.json({
      success: true,
      user: req.user,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { fullName, phone, avatar } = req.body;

    if (fullName) req.user.fullName = fullName.trim();
    if (phone !== undefined) req.user.phone = phone.trim();
    if (avatar) req.user.avatar = avatar;

    await req.user.save();

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: req.user,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const submitOnboarding = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = onboardingSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues?.[0]?.message || "Validation failed";
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
      return;
    }

    const { fullName, role, phone, avatar, organizationName, propertyLicense, emergencyContact } =
      parseResult.data;

    let user = req.user;
    if (!user && req.firebaseUid) {
      user = (await User.findOne({ firebaseUid: req.firebaseUid })) || undefined;
    }

    if (!user) {
      res.status(404).json({ success: false, error: "User profile not found." });
      return;
    }

    // Role assignment rules:
    // Residents are approved immediately.
    // Owners require administrative review (accountStatus = 'pending').
    const isOwner = role === "owner";
    user.fullName = fullName;
    user.role = role;
    user.accountStatus = isOwner ? "pending" : "active";
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    user.onboardingDetails = {
      organizationName: organizationName || "",
      propertyLicense: propertyLicense || "",
      emergencyContact: emergencyContact || "",
    };

    await user.save();

    res.json({
      success: true,
      message: isOwner
        ? "Owner application submitted. Pending administrative verification."
        : "Resident profile completed successfully.",
      user,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    res.json({
      success: true,
      status: {
        role: req.user.role,
        accountStatus: req.user.accountStatus,
        emailVerified: req.user.emailVerified,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: "Logged out successfully." });
};
