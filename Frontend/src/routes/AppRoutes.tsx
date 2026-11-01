import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "@/pages/LandingPage";
import { SignIn } from "@/pages/auth/SignIn";
import { SignUp } from "@/pages/auth/SignUp";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import { VerifyEmail } from "@/pages/auth/VerifyEmail";
import { RoleSelection } from "@/pages/onboarding/RoleSelection";
import { ResidentDashboard } from "@/pages/dashboards/ResidentDashboard";
import { OwnerDashboard } from "@/pages/dashboards/OwnerDashboard";
import { AdminDashboard } from "@/pages/dashboards/AdminDashboard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleGuard } from "@/components/auth/RoleGuard";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Protected Onboarding */}
      <Route
        path="/onboarding/role"
        element={
          <ProtectedRoute>
            <RoleSelection />
          </ProtectedRoute>
        }
      />

      {/* Role-Protected Dashboards */}
      <Route
        path="/dashboard/resident"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={["resident", "owner", "admin"]}>
              <ResidentDashboard />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/owner"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={["owner", "admin"]}>
              <OwnerDashboard />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute>
            <RoleGuard allowedRoles={["admin"]}>
              <AdminDashboard />
            </RoleGuard>
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

