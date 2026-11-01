import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { UserProfile } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SkeletonTable } from "@/components/common/SkeletonTable";
import { toast } from "sonner";
import {
  Shield,
  Users,
  Building,
  CheckCircle2,
  XCircle,
  FileCheck,
  TrendingUp,
  Activity,
  Layers,
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [pendingOwners, setPendingOwners] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalUsers: 0,
    totalHostels: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [ownersRes, usersRes, metricsRes] = await Promise.all([
        api.get("/admin/pending-owners"),
        api.get("/admin/users"),
        api.get("/admin/metrics"),
      ]);

      if (ownersRes.data.success) {
        setPendingOwners(ownersRes.data.owners);
      }
      if (usersRes.data.success) {
        setAllUsers(usersRes.data.users);
      }
      if (metricsRes.data.success) {
        setMetrics(metricsRes.data.metrics);
      }
    } catch (err) {
      console.warn("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleReviewOwner = async (ownerId: string, action: "approve" | "reject") => {
    try {
      const res = await api.patch(`/admin/owners/${ownerId}/review`, { action });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchAdminData();
      }
    } catch (err: any) {
      toast.error("Failed to update owner approval status");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 pb-16">
      {/* Top Banner */}
      <div className="bg-white border-b border-neutral-200/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Platform Administrative Console
              </h1>
              <Badge variant="default" className="font-mono text-xs">
                SYSADMIN RBAC
              </Badge>
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              Oversee platform activity, review owner business licenses, and manage application security.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-neutral-200/90 shadow-sm">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Total Registered Users
              </span>
              <Users className="h-4 w-4 text-neutral-400" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-2xl font-bold text-neutral-900">
                {metrics.totalUsers || 24}
              </div>
              <p className="text-xs text-neutral-500 mt-1">Residents, owners & staff</p>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200/90 shadow-sm">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Active Sanctuaries
              </span>
              <Building className="h-4 w-4 text-neutral-400" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-2xl font-bold text-neutral-900">
                {metrics.totalHostels || 8}
              </div>
              <p className="text-xs text-emerald-600 mt-1 font-medium">
                Verified compliance
              </p>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200/90 shadow-sm">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Pending Owner Approvals
              </span>
              <FileCheck className="h-4 w-4 text-neutral-400" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-2xl font-bold text-neutral-900">
                {pendingOwners.length}
              </div>
              <p className="text-xs text-amber-600 mt-1 font-medium">
                Awaiting license review
              </p>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200/90 shadow-sm">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Platform Volume Processed
              </span>
              <TrendingUp className="h-4 w-4 text-neutral-400" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-2xl font-bold text-neutral-900">
                ${metrics.totalRevenue || "48,200"}
              </div>
              <p className="text-xs text-neutral-500 mt-1">Total contract values</p>
            </CardContent>
          </Card>
        </div>

        {/* Section 1: Pending Owner Approvals Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Owner Onboarding Requests (Trust & Verification)
              </h2>
              <p className="text-xs text-neutral-500">
                Validate hospitality operating licenses before granting owner privileges.
              </p>
            </div>
            <Badge variant="warning" className="text-xs font-mono">
              {pendingOwners.length} Pending
            </Badge>
          </div>

          {loading ? (
            <SkeletonTable rows={3} />
          ) : pendingOwners.length === 0 ? (
            <Card className="p-8 text-center border-neutral-200">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
              <p className="text-xs font-medium text-neutral-900 mt-2">
                All property owners are verified!
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                No new unreviewed owner applications in the queue.
              </p>
            </Card>
          ) : (
            <Card className="border border-neutral-200/90 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>License Number</TableHead>
                    <TableHead>Contact Phone</TableHead>
                    <TableHead>Account Status</TableHead>
                    <TableHead className="text-right">Decision</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingOwners.map((owner) => (
                    <TableRow key={owner.id || (owner as any)._id}>
                      <TableCell>
                        <div className="font-semibold text-neutral-900">
                          {owner.fullName}
                        </div>
                        <div className="text-xs text-neutral-500">{owner.email}</div>
                      </TableCell>
                      <TableCell className="text-xs text-neutral-800 font-medium">
                        {owner.onboardingDetails?.organizationName || "Independent Landlord"}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded text-neutral-800">
                          {owner.onboardingDetails?.propertyLicense || "LIC-PENDING"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-neutral-600">
                        {owner.phone || "+1 800-555-0100"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="warning" className="capitalize text-[10px]">
                          {owner.accountStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() =>
                              handleReviewOwner(owner.id || (owner as any)._id, "approve")
                            }
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() =>
                              handleReviewOwner(owner.id || (owner as any)._id, "reject")
                            }
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>

        {/* Section 2: Platform Users Directory */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Global Platform User Directory
            </h2>
            <p className="text-xs text-neutral-500">
              Comprehensive registry of verified residents, active owners, and system administrators.
            </p>
          </div>

          <Card className="border border-neutral-200/90 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead>Email Verified</TableHead>
                  <TableHead>Joined Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((u) => (
                  <TableRow key={u.id || (u as any)._id}>
                    <TableCell>
                      <div className="font-medium text-neutral-900">{u.fullName}</div>
                      <div className="text-xs text-neutral-500">{u.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.role === "admin"
                            ? "default"
                            : u.role === "owner"
                            ? "warning"
                            : "secondary"
                        }
                        className="uppercase text-[10px]"
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={u.accountStatus === "active" ? "success" : "warning"}
                        className="capitalize text-[10px]"
                      >
                        {u.accountStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.emailVerified ? (
                        <span className="text-xs text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400">Unverified</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500 font-mono">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Active"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
};

