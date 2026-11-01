import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: { email: string }) => {
    setIsSubmitting(true);
    await resetPassword(data.email);
    setIsSent(true);
    setIsSubmitting(false);
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email associated with your account and we'll send a password recovery link."
    >
      {isSent ? (
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900">
            Check your inbox
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            If an account exists with that email, instructions to reset your password have been dispatched.
          </p>
          <div className="pt-2">
            <Link to="/sign-in">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" /> Return to sign in
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-neutral-700 font-medium">
              Registered email address
            </Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="pl-9"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full py-5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Send password reset link
          </Button>

          <div className="pt-2 text-center">
            <Link
              to="/sign-in"
              className="inline-flex items-center text-xs text-neutral-600 hover:text-neutral-900"
            >
              <ArrowLeft className="h-3 w-3 mr-1" /> Back to sign in
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

