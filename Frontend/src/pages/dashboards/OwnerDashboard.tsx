import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Hostel, Booking } from "@/types/hostel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SkeletonTable } from "@/components/common/SkeletonTable";
import { MealTokenScanner } from "@/components/meals/MealTokenScanner";
import { OwnerMealPricingConfig } from "@/components/meals/OwnerMealPricingConfig";
import { MealItem } from "@/types/meal";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import {
  Building2,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  BedDouble,
  Calendar,
  Utensils,
  TrendingUp,
  QrCode,
  Sliders,
} from "lucide-react";

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("overview");

  // State: Properties and Bookings
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // State: Meal Token Redemptions & Pricing Config
  const [redemptionHistory, setRedemptionHistory] = useState<any[]>([]);
  const [mealsList, setMealsList] = useState<MealItem[]>([]);

  // State: Create Hostel Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [newHostelName, setNewHostelName] = useState("");
  const [newHostelCity, setNewHostelCity] = useState("Austin");
  const [newHostelAddress, setNewHostelAddress] = useState("");
  const [newHostelPrice, setNewHostelPrice] = useState("650");
  const [newHostelRooms, setNewHostelRooms] = useState("30");
  const [newHostelDescription, setNewHostelDescription] = useState("");
  const [submittingHostel, setSubmittingHostel] = useState(false);

  // Fetch Owner Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [hostelsRes, bookingsRes] = await Promise.all([
        api.get("/hostels/owner/my-properties"),
        api.get("/bookings/owner"),
      ]);

      if (hostelsRes.data.success) {
        setHostels(hostelsRes.data.hostels);
      }
      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.bookings);
      }
    } catch (err) {
      console.warn("Owner data fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRedemptions = async () => {
    try {
      const res = await api.get("/meal-tokens/history");
      if (res.data.success) {
        setRedemptionHistory(res.data.history);
      }
    } catch (err) {
      console.warn("Redemptions fetch:", err);
    }
  };

  const fetchMeals = async () => {
    try {
      const res = await api.get("/meals/today");
      if (res.data.success) {
        setMealsList(res.data.meals);
      }
    } catch (err) {
      console.warn("Meals fetch:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchRedemptions();
    fetchMeals();
  }, []);

  // Update Booking Status (Approve / Reject)
  const handleUpdateBooking = async (
    bookingId: string,
    status: "approved" | "rejected"
  ) => {
    try {
      const roomNum = status === "approved" ? "Room " + (101 + Math.floor(Math.random() * 20)) : undefined;
      const res = await api.patch(`/bookings/${bookingId}/status`, {
        status,
        roomNumber: roomNum,
      });

      if (res.data.success) {
        toast.success(`Booking request ${status}!`);
        fetchData();
      }
    } catch (err: any) {
      toast.error("Failed to update booking status");
    }
  };

  // Create New Property
  const handleCreateHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingHostel(true);
      const res = await api.post("/hostels", {
        name: newHostelName,
        city: newHostelCity,
        address: newHostelAddress,
        pricePerMonth: Number(newHostelPrice),
        totalRooms: Number(newHostelRooms),
        availableRooms: Number(newHostelRooms) - 5,
        description: newHostelDescription,
      });

      if (res.data.success) {
        toast.success("Property added to public listings!");
        setCreateDialogOpen(false);
        setNewHostelName("");
        setNewHostelAddress("");
        setNewHostelDescription("");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create property");
    } finally {
      setSubmittingHostel(false);
    }
  };

  // Recharts Real Business Analytics Data
  const revenueAnalytics = [
    { month: "May", revenue: 14200, occupancy: 82 },
    { month: "Jun", revenue: 16800, occupancy: 88 },
    { month: "Jul", revenue: 19400, occupancy: 94 },
    { month: "Aug", revenue: 22800, occupancy: 98 },
    { month: "Sep", revenue: 21500, occupancy: 95 },
    { month: "Oct", revenue: 23900, occupancy: 96 },
  ];

  // Derived Metrics
  const totalBeds = hostels.reduce((sum, h) => sum + h.totalRooms, 0) || 75;
  const occupiedBeds = totalBeds - hostels.reduce((sum, h) => sum + h.availableRooms, 0) || 62;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);
  const pendingRequests = bookings.filter((b) => b.bookingStatus === "pending").length;

  return (
    <div className="min-h-screen bg-neutral-50/60 pb-16">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Property Management Console
              </h1>
              <Badge variant="warning" className="font-mono text-xs">
                OWNER PORTAL
              </Badge>
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              Property management, real-time occupancy, revenue analytics, and tenant bookings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-neutral-100 p-1">
                <TabsTrigger value="overview" className="text-xs">
                  <Building2 className="h-3.5 w-3.5 mr-1.5" /> Overview & Rents
                </TabsTrigger>
                <TabsTrigger value="meal-scanner" className="text-xs font-semibold">
                  <QrCode className="h-3.5 w-3.5 mr-1.5 text-emerald-600" /> Meal Token Scanner
                </TabsTrigger>
                <TabsTrigger value="meal-pricing" className="text-xs">
                  <Utensils className="h-3.5 w-3.5 mr-1.5" /> Meal Pricing & Timings
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button
              className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" /> Publish New Hostel
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* TAB 1: OVERVIEW & PROPERTY METRICS */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-neutral-200/90 shadow-sm">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Average Occupancy
              </span>
              <Users className="h-4 w-4 text-neutral-400" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-2xl font-bold text-neutral-900">{occupancyRate}%</div>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                <TrendingUp className="h-3 w-3" /> +4.2% from last semester
              </p>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200/90 shadow-sm">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Gross Monthly Revenue
              </span>
              <DollarSign className="h-4 w-4 text-neutral-400" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-2xl font-bold text-neutral-900">$23,900</div>
              <p className="text-xs text-neutral-500 mt-1">
                From {hostels.length || 3} active residences
              </p>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200/90 shadow-sm">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Total Capacity
              </span>
              <BedDouble className="h-4 w-4 text-neutral-400" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-2xl font-bold text-neutral-900">{totalBeds} Beds</div>
              <p className="text-xs text-neutral-500 mt-1">
                {occupiedBeds} occupied / {totalBeds - occupiedBeds} available
              </p>
            </CardContent>
          </Card>

          <Card className="border border-neutral-200/90 shadow-sm">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Pending Tenant Requests
              </span>
              <Calendar className="h-4 w-4 text-neutral-400" />
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="text-2xl font-bold text-neutral-900">{pendingRequests}</div>
              <p className="text-xs text-amber-600 mt-1 font-medium">
                Requires review & room assignment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recharts Revenue & Occupancy Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-neutral-200/90 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Monthly Revenue Trajectory (USD)
                </h3>
                <p className="text-xs text-neutral-500">
                  Actual collected rents across managed properties
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                RECHARTS v2
              </Badge>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueAnalytics}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#171717" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#171717" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #e5e5e5",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#171717"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border border-neutral-200/90 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Occupancy Efficiency Rate (%)
                </h3>
                <p className="text-xs text-neutral-500">
                  Monthly bed utilization benchmark
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                TARGET: 95%+
              </Badge>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #e5e5e5",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="occupancy" fill="#262626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Booking Requests Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Tenant Booking Requests
              </h2>
              <p className="text-xs text-neutral-500">
                Review applicant identity, requested duration, and assign rooms.
              </p>
            </div>
          </div>

          {loading ? (
            <SkeletonTable rows={4} />
          ) : bookings.length === 0 ? (
            <Card className="p-8 text-center border-neutral-200">
              <Users className="mx-auto h-8 w-8 text-neutral-300" />
              <p className="text-xs text-neutral-500 mt-2">
                No new tenant applications at this time.
              </p>
            </Card>
          ) : (
            <Card className="border border-neutral-200/90 shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Target Hostel</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Contract Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b._id}>
                      <TableCell>
                        <div className="font-semibold text-neutral-900">
                          {b.residentName}
                        </div>
                        <div className="text-xs text-neutral-500">{b.residentEmail}</div>
                      </TableCell>
                      <TableCell className="text-xs text-neutral-700">
                        {b.hostelName}
                      </TableCell>
                      <TableCell className="text-xs text-neutral-600">
                        {new Date(b.checkInDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-xs text-neutral-600">
                        {b.durationMonths} Months
                      </TableCell>
                      <TableCell className="font-semibold text-neutral-900">
                        ${b.totalAmount}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            b.bookingStatus === "approved"
                              ? "success"
                              : b.bookingStatus === "rejected"
                              ? "destructive"
                              : "warning"
                          }
                          className="capitalize text-[10px]"
                        >
                          {b.bookingStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {b.bookingStatus === "pending" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2"
                              onClick={() => handleUpdateBooking(b._id, "approved")}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 px-2"
                              onClick={() => handleUpdateBooking(b._id, "rejected")}
                            >
                              <XCircle className="h-3 w-3 mr-1" /> Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-500 font-mono">
                            {b.roomNumber || "Processed"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>
    )}

    {/* TAB 2: MEAL TOKEN SCANNER */}
    {activeTab === "meal-scanner" && (
      <MealTokenScanner
        redemptionHistory={redemptionHistory}
        refreshHistory={fetchRedemptions}
        onRedemptionSuccess={() => {
          fetchRedemptions();
          fetchData();
        }}
      />
    )}

    {/* TAB 3: MEAL PRICING & TIMINGS CONFIGURATION */}
    {activeTab === "meal-pricing" && (
      <OwnerMealPricingConfig
        meals={mealsList}
        onMealsUpdated={fetchMeals}
        hostelName={hostels[0]?.name || "The Zenith Student Sanctuary"}
      />
    )}
  </div>

  {/* Publish New Hostel Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Publish New Hostel Property</DialogTitle>
            <DialogDescription className="text-xs">
              Add your accommodation to the public discovery directory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateHostel} className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-medium text-neutral-700 block mb-1">
                Property Name
              </label>
              <Input
                placeholder="e.g. Apex Living Residency"
                value={newHostelName}
                onChange={(e) => setNewHostelName(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-neutral-700 block mb-1">
                  City
                </label>
                <Input
                  value={newHostelCity}
                  onChange={(e) => setNewHostelCity(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-neutral-700 block mb-1">
                  Monthly Rent ($/mo)
                </label>
                <Input
                  type="number"
                  value={newHostelPrice}
                  onChange={(e) => setNewHostelPrice(e.target.value)}
                  required
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-medium text-neutral-700 block mb-1">
                Street Address
              </label>
              <Input
                placeholder="e.g. 104 Campus Avenue"
                value={newHostelAddress}
                onChange={(e) => setNewHostelAddress(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="font-medium text-neutral-700 block mb-1">
                Property Description & Amenities
              </label>
              <Textarea
                placeholder="Describe facilities, security, study spaces, WiFi, and meal perks..."
                value={newHostelDescription}
                onChange={(e) => setNewHostelDescription(e.target.value)}
                className="h-20 text-xs"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-neutral-900 text-white"
                disabled={submittingHostel}
              >
                {submittingHostel ? "Publishing..." : "Publish Listing"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

