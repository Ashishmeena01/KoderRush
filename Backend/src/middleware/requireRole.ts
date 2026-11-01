import { Request, Response, NextFunction } from "express";
import { UserRole } from "../models/User";

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required to access this resource.",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Requires one of [${allowedRoles.join(", ")}] roles. Your role is '${req.user.role}'.`,
      });
      return;
    }

    next();
  };
};

export const requireActiveAccount = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Authentication required.",
    });
    return;
  }

  if (req.user.accountStatus === "pending") {
    res.status(403).json({
      success: false,
      error: "Your account is pending administrative approval. Restricted access until approved.",
      accountStatus: "pending",
    });
    return;
  }

  if (req.user.accountStatus === "suspended") {
    res.status(403).json({
      success: false,
      error: "Your account has been suspended. Please contact platform administrators.",
      accountStatus: "suspended",
    });
    return;
  }

  next();
};

