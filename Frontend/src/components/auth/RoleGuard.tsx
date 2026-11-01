import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import { AuthLoading } from "./AuthLoading";
import { AlertCircle, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  // Owner pending approval state handling
  if (user.role === "owner" && user.accountStatus === "pending") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">
            Owner Verification Pending
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Thank you for registering your property. Your account and license details (
            <span className="font-mono text-xs font-semibold">
              {user.onboardingDetails?.propertyLicense || "Pending Review"}
            </span>
            ) are currently being verified by platform administrators.
          </p>
          <div className="p-3 bg-neutral-50 rounded-lg text-xs text-neutral-500 text-left border border-neutral-200/60">
            <strong>Next step:</strong> Administrators review submissions within 24 hours. You can explore resident features in the meantime.
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="w-1/2"
              onClick={() => logout()}
            >
              Sign Out
            </Button>
            <Button
              className="w-1/2 bg-neutral-900"
              onClick={() => (window.location.href = "/dashboard/resident")}
            >
              Resident View
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (user.accountStatus === "suspended") {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-red-200 shadow-sm text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">Account Suspended</h2>
          <p className="text-sm text-neutral-600">
            This account has been temporarily restricted by system administrators.
          </p>
          <Button variant="outline" onClick={() => logout()}>
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their actual authorized dashboard
    const defaultRoute =
      user.role === "admin"
        ? "/dashboard/admin"
        : user.role === "owner"
        ? "/dashboard/owner"
        : "/dashboard/resident";

    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
};

