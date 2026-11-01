import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Building2, User, Check, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { UserRole } from "@/types/auth";

export const RoleSelection: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("resident");
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [orgName, setOrgName] = useState("");
  const [license, setLicense] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/auth/onboarding", {
        fullName,
        role: selectedRole,
        phone,
        organizationName: orgName,
        propertyLicense: license,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        await refreshProfile();
        navigate(selectedRole === "owner" ? "/dashboard/owner" : "/dashboard/resident");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to submit onboarding.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="text-neutral-600 bg-white">
            Onboarding Step 1 of 1
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Select Your Account Workspace
          </h1>
          <p className="text-sm text-neutral-600">
            Choose how you intend to use HostelHub. Roles determine permissions and dashboard interfaces.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Resident Card */}
            <Card
              className={`cursor-pointer transition-all border-2 ${
                selectedRole === "resident"
                  ? "border-neutral-950 bg-neutral-50/50 shadow-md"
                  : "border-neutral-200 hover:border-neutral-300 bg-white"
              }`}
              onClick={() => setSelectedRole("resident")}
            >
              <CardHeader className="p-5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  {selectedRole === "resident" && (
                    <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg mt-3">Resident</CardTitle>
                <CardDescription className="text-xs">
                  For students, interns, and professionals seeking accommodations.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 text-xs text-neutral-600 space-y-1.5">
                <p>• Discover verified student hostels</p>
                <p>• Room bookings & digital invoices</p>
                <p>• Daily interactive meal schedules</p>
                <Badge variant="success" className="mt-2 text-[10px]">
                  Instant Activation
                </Badge>
              </CardContent>
            </Card>

            {/* Owner Card */}
            <Card
              className={`cursor-pointer transition-all border-2 ${
                selectedRole === "owner"
                  ? "border-neutral-950 bg-neutral-50/50 shadow-md"
                  : "border-neutral-200 hover:border-neutral-300 bg-white"
              }`}
              onClick={() => setSelectedRole("owner")}
            >
              <CardHeader className="p-5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                    <Building2 className="h-5 w-5" />
                  </div>
                  {selectedRole === "owner" && (
                    <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg mt-3">Property Owner</CardTitle>
                <CardDescription className="text-xs">
                  For hostel owners, coliving managers, and landlords.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 text-xs text-neutral-600 space-y-1.5">
                <p>• Publish & manage hostel properties</p>
                <p>• Room inventory & tenant bookings</p>
                <p>• Revenue analytics & meal scheduling</p>
                <Badge variant="warning" className="mt-2 text-[10px]">
                  Requires Admin Review
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Role Details Form */}
          <Card className="bg-white border border-neutral-200 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-neutral-900 text-sm">
              Personal & Verification Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-xs font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your legal name"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-xs font-medium">
                  Contact Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="mt-1"
                />
              </div>
            </div>

            {selectedRole === "owner" && (
              <div className="pt-2 border-t border-neutral-100 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
                  <ShieldCheck className="h-4 w-4 text-neutral-700" />
                  Owner Verification Information
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="orgName" className="text-xs font-medium">
                      Organization / Operating Name
                    </Label>
                    <Input
                      id="orgName"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. Skyline Living LLC"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="license" className="text-xs font-medium">
                      Property / Hospitality License No.
                    </Label>
                    <Input
                      id="license"
                      value={license}
                      onChange={(e) => setLicense(e.target.value)}
                      placeholder="e.g. LIC-2026-994"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white mt-4"
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirm & Continue to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
};

