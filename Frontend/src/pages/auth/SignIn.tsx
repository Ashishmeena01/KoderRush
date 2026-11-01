import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Mail, Loader2, Sparkles } from "lucide-react";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean(),
});

type SignInValues = z.infer<typeof signInSchema>;

export const SignIn: React.FC = () => {
  const { loginWithEmail, signInWithGoogle, switchDevDemoRole } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/dashboard/resident";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  const onSubmit = async (data: SignInValues) => {
    try {
      setIsSubmitting(true);
      setAuthError(null);
      await loginWithEmail(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setAuthError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      setAuthError(null);
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      setAuthError(err.message || "Google authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in to your account"
      subtitle="Access your hostel bookings, meal schedules, and management dashboard."
    >
      {authError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}

      {/* Google OAuth Provider */}
      <Button
        type="button"
        variant="outline"
        className="w-full flex items-center justify-center gap-3 py-5 font-medium border-neutral-300 hover:bg-neutral-50 transition-all text-neutral-800"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.19 0 10.04 0 12s.45 3.81 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>Continue with Google</span>
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-neutral-500 font-medium tracking-wider">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-neutral-700 font-medium">
            Email address
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

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-neutral-700 font-medium">
              Password
            </Label>
            <Link
              to="/forgot-password"
              className="text-xs text-neutral-600 hover:text-neutral-900 underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-9 pr-10"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <Checkbox id="remember" defaultChecked />
          <label
            htmlFor="remember"
            className="text-xs font-medium text-neutral-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Remember session on this device
          </label>
        </div>

        <Button
          type="submit"
          className="w-full py-5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Sign in
        </Button>
      </form>

      {/* Quick Role Logins for Testing & Evaluation */}
      <div className="mt-6 pt-5 border-t border-neutral-100">
        <p className="text-xs text-neutral-500 font-medium mb-2.5 text-center flex items-center justify-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-500" /> Quick Testing Logins (Instant Evaluation)
        </p>
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs py-1"
            onClick={async () => {
              await switchDevDemoRole("resident");
              navigate("/dashboard/resident");
            }}
          >
            Resident
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs py-1"
            onClick={async () => {
              await switchDevDemoRole("owner");
              navigate("/dashboard/owner");
            }}
          >
            Owner
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs py-1"
            onClick={async () => {
              await switchDevDemoRole("admin");
              navigate("/dashboard/admin");
            }}
          >
            Admin
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-neutral-600">
        Don't have an account?{" "}
        <Link
          to="/sign-up"
          className="font-semibold text-neutral-900 underline underline-offset-4 hover:text-neutral-700"
        >
          Create account
        </Link>
      </div>
    </AuthLayout>
  );
};
