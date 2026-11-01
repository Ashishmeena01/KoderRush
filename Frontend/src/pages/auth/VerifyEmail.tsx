import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { MailCheck, RefreshCw, LogOut } from "lucide-react";
import { toast } from "sonner";

export const VerifyEmail: React.FC = () => {
  const { user, resendVerification, refreshProfile, logout } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    await resendVerification();
    setIsResending(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProfile();
    toast.success("Checked email verification status.");
    setIsRefreshing(false);
  };

  return (
    <AuthLayout
      title="Verify your email address"
      subtitle="A verification link was dispatched to your inbox. Please click the link to confirm your account."
    >
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center">
          <MailCheck className="h-6 w-6" />
        </div>
        <p className="text-sm text-neutral-600">
          Current account email:{" "}
          <span className="font-semibold text-neutral-900">
            {user?.email || "your-email@domain.com"}
          </span>
        </p>
        <div className="p-3 bg-neutral-50 rounded-lg text-xs text-neutral-600 border border-neutral-200">
          Once verified, you'll unlock immediate room bookings and direct communication with verified property owners.
        </div>
        <div className="space-y-2 pt-2">
          <Button
            className="w-full bg-neutral-900"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            I've verified my email
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={isResending}
          >
            Resend verification email
          </Button>
          <Button
            variant="ghost"
            className="w-full text-xs text-neutral-500"
            onClick={() => logout()}
          >
            <LogOut className="h-3 w-3 mr-1" /> Sign out
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

