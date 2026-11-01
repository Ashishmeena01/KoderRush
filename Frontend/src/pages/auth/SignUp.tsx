import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Lock, Mail, User as UserIcon, Loader2 } from "lucide-react";
import { UserRole } from "@/types/auth";

const signUpSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
    role: z.enum(["resident", "owner"]),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms & conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

export const SignUp: React.FC = () => {
  const { registerWithEmail, signInWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("resident");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "resident",
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: SignUpValues) => {
    try {
      setIsSubmitting(true);
      setAuthError(null);
      await registerWithEmail(data.email, data.password, data.fullName, data.role);
      navigate(data.role === "owner" ? "/dashboard/owner" : "/dashboard/resident");
    } catch (err: any) {
      setAuthError(err.message || "Failed to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsSubmitting(true);
      setAuthError(null);
      await signInWithGoogle();
      navigate("/dashboard/resident");
    } catch (err: any) {
      setAuthError(err.message || "Google signup failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register as a hostel resident or property owner."
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
        onClick={handleGoogleSignUp}
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
        <span>Sign up with Google</span>
      </Button>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-3 text-neutral-500 font-medium tracking-wider">
            Or fill details below
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="fullName" className="text-neutral-700 font-medium">
            Full Name
          </Label>
          <div className="relative mt-1">
            <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              id="fullName"
              placeholder="e.g. Maya Lin"
              className="pl-9"
              {...register("fullName")}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="text-neutral-700 font-medium">
            Email address
          </Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              id="email"
              type="email"
              placeholder="maya@student.edu"
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

        {/* Account Role Selector */}
        <div>
          <Label htmlFor="role" className="text-neutral-700 font-medium">
            Requested Account Role
          </Label>
          <div className="mt-1">
            <Select
              defaultValue="resident"
              onValueChange={(val: any) => {
                setSelectedRole(val);
                setValue("role", val);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resident">
                  Resident (Student / Working Professional)
                </SelectItem>
                <SelectItem value="owner">
                  Hostel Owner / Property Manager (Requires Verification)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            {selectedRole === "owner"
              ? "Owner registrations require administrative approval before public listing."
              : "Residents get immediate access to browse, book, and view meals."}
          </p>
        </div>

        <div>
          <Label htmlFor="password" className="text-neutral-700 font-medium">
            Password (min 8 chars, 1 uppercase, 1 number)
          </Label>
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

        <div>
          <Label htmlFor="confirmPassword" className="text-neutral-700 font-medium">
            Confirm Password
          </Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-9"
              {...register("confirmPassword")}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex items-start space-x-2 pt-1">
          <Checkbox
            id="acceptTerms"
            onCheckedChange={(checked) => setValue("acceptTerms", !!checked)}
          />
          <label
            htmlFor="acceptTerms"
            className="text-xs text-neutral-600 leading-snug cursor-pointer"
          >
            I agree to the{" "}
            <span className="font-medium text-neutral-900 underline underline-offset-2">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="font-medium text-neutral-900 underline underline-offset-2">
              Privacy Policy
            </span>
            .
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-xs text-red-600 font-medium">
            {errors.acceptTerms.message}
          </p>
        )}

        <Button
          type="submit"
          className="w-full py-5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Create account
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-neutral-600">
        Already registered?{" "}
        <Link
          to="/sign-in"
          className="font-semibold text-neutral-900 underline underline-offset-4 hover:text-neutral-700"
        >
          Sign in here
        </Link>
      </div>
    </AuthLayout>
  );
};

