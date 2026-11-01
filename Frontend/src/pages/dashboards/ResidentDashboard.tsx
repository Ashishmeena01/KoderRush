import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Hostel, Booking, MealSchedule } from "@/types/hostel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SkeletonGrid } from "@/components/common/SkeletonCard";
import { SkeletonTable } from "@/components/common/SkeletonTable";
import { ResidentMealTokens } from "@/components/meals/ResidentMealTokens";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  Star,
  Wifi,
  Utensils,
  Shield,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  CreditCard,
  Building,
  Coffee,
  Sparkles,
  Bed,
  QrCode,
} from "lucide-react";

export const ResidentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("explore");

  // State: Hostels
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loadingHostels, setLoadingHostels] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");

  // State: Selected Hostel for Detail Dialog
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState<boolean>(false);
  const [bookingDuration, setBookingDuration] = useState<number>(6);
  const [checkInDate, setCheckInDate] = useState<string>("2026-11-01");
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [submittingBooking, setSubmittingBooking] = useState<boolean>(false);

  // State: Resident Bookings
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState<boolean>(false);

  // State: Meal Schedules
  const [mealSchedules, setMealSchedules] = useState<MealSchedule[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>("Monday");
  const [loadingMeals, setLoadingMeals] = useState<boolean>(false);

  // Fetch Hostels
  const fetchHostels = async () => {
    try {
      setLoadingHostels(true);
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedCity !== "all") params.city = selectedCity;
      if (selectedGender !== "all") params.gender = selectedGender;

      const res = await api.get("/hostels", { params });
      if (res.data.success) {
        setHostels(res.data.hostels);
      }
    } catch (err: any) {
      toast.error("Failed to load hostels");
    } finally {
      setLoadingHostels(false);
    }
  };

  // Fetch Resident Bookings
  const fetchMyBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await api.get("/bookings/my");
      if (res.data.success) {
        setMyBookings(res.data.bookings);
      }
    } catch (err) {
      console.warn("Bookings fetch note:", err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Fetch Meals for featured hostel
  const fetchMeals = async (hostelId: string) => {
    try {
      setLoadingMeals(true);
      const res = await api.get(`/meals/hostel/${hostelId}`);
      if (res.data.success) {
        setMealSchedules(res.data.schedules);
      }
    } catch (err) {
      console.warn("Meals fetch note:", err);
    } finally {
      setLoadingMeals(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, [searchQuery, selectedCity, selectedGender]);

  useEffect(() => {
    if (activeTab === "bookings") {
      fetchMyBookings();
    } else if (activeTab === "meals") {
      if (hostels.length > 0) {
        fetchMeals(hostels[0]._id);
      }
    }
  }, [activeTab, hostels]);

  // Handle Booking Creation
  const handleCreateBooking = async () => {
    if (!selectedHostel) return;
    try {
      setSubmittingBooking(true);
      const res = await api.post("/bookings", {
        hostelId: selectedHostel._id,
        durationMonths: bookingDuration,
        checkInDate,
        specialRequests,
      });

      if (res.data.success) {
        toast.success("Booking request sent to property manager!");
        setBookingDialogOpen(false);
        setSelectedHostel(null);
        setActiveTab("bookings");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to submit booking");
    } finally {
      setSubmittingBooking(false);
    }
  };

  // Handle Payment
  const handlePayInvoice = async (bookingId: string) => {
    try {
      const res = await api.patch(`/bookings/${bookingId}/pay`);
      if (res.data.success) {
        toast.success("Payment processed! Digital receipt issued.");
        fetchMyBookings();
      }
    } catch (err: any) {
      toast.error("Payment processing error");
    }
  };

  const activeMeal = mealSchedules.find((m) => m.dayOfWeek === selectedDay);

  return (
    <div className="min-h-screen bg-neutral-50/60 pb-16">
      {/* Welcome Banner */}
      <div className="bg-white border-b border-neutral-200/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                Welcome back, {user?.fullName || "Resident"}
              </h1>
              <Badge variant="secondary" className="font-mono text-xs">
                RESIDENT PORTAL
              </Badge>
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              Explore verified student sanctuaries, track reservations, and view chef-curated daily meal schedules.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="bg-neutral-100 p-1">
              <TabsTrigger value="explore" className="text-xs">
                <Building className="h-3.5 w-3.5 mr-1.5" /> Discovery
              </TabsTrigger>
              <TabsTrigger value="meal-tokens" className="text-xs font-semibold">
                <QrCode className="h-3.5 w-3.5 mr-1.5 text-emerald-600" /> My Meal Tokens
              </TabsTrigger>
              <TabsTrigger value="bookings" className="text-xs">
                <CreditCard className="h-3.5 w-3.5 mr-1.5" /> Bookings & Invoices
              </TabsTrigger>
              <TabsTrigger value="meals" className="text-xs">
                <Utensils className="h-3.5 w-3.5 mr-1.5" /> Meal Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* TAB 1: EXPLORE HOSTELS */}
        {activeTab === "explore" && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search by hostel name, area, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="h-9 text-xs w-36">
                    <SelectValue placeholder="Filter City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    <SelectItem value="Austin">Austin</SelectItem>
                    <SelectItem value="Seattle">Seattle</SelectItem>
                    <SelectItem value="Boston">Boston</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedGender} onValueChange={setSelectedGender}>
                  <SelectTrigger className="h-9 text-xs w-36">
                    <SelectValue placeholder="Gender Accom." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accommodations</SelectItem>
                    <SelectItem value="male">Boys Hostel</SelectItem>
                    <SelectItem value="female">Girls Hostel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Hostel Grid or Skeleton */}
            {loadingHostels ? (
              <SkeletonGrid count={6} />
            ) : hostels.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
                <Building className="mx-auto h-12 w-12 text-neutral-300" />
                <h3 className="mt-2 text-sm font-semibold text-neutral-900">
                  No hostels matched your filter
                </h3>
                <p className="mt-1 text-xs text-neutral-500">
                  Try adjusting your keywords or clearing the city filter.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 text-xs"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCity("all");
                    setSelectedGender("all");
                  }}
                >
                  Reset filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostels.map((hostel) => (
                  <Card
                    key={hostel._id}
                    className="overflow-hidden border border-neutral-200/80 hover:border-neutral-400 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative h-48 overflow-hidden bg-neutral-100">
                        <img
                          src={
                            hostel.images?.[0] ||
                            "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80"
                          }
                          alt={hostel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 shadow-sm text-neutral-900">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{hostel.rating || 4.8}</span>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <Badge className="bg-neutral-900/80 backdrop-blur-sm text-white text-[10px] border-0">
                            {hostel.availableRooms} rooms available
                          </Badge>
                        </div>
                      </div>

                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base font-bold text-neutral-900 line-clamp-1">
                          {hostel.name}
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1 text-neutral-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                          <span className="truncate">{hostel.address}, {hostel.city}</span>
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-4 pt-1 space-y-3">
                        <p className="text-xs text-neutral-600 line-clamp-2">
                          {hostel.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {hostel.amenities?.slice(0, 3).map((amenity, i) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-[10px] bg-neutral-100 text-neutral-700 font-normal"
                            >
                              {amenity}
                            </Badge>
                          ))}
                          {hostel.amenities?.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-neutral-500"
                            >
                              +{hostel.amenities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </div>

                    <CardFooter className="p-4 pt-3 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/40">
                      <div>
                        <span className="text-xs text-neutral-500 block">Monthly rent</span>
                        <span className="text-base font-bold text-neutral-900">
                          ${hostel.pricePerMonth}
                          <span className="text-xs font-normal text-neutral-500">/mo</span>
                        </span>
                      </div>

                      <Button
                        size="sm"
                        className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs"
                        onClick={() => {
                          setSelectedHostel(hostel);
                          setBookingDialogOpen(true);
                        }}
                      >
                        Book Stay
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY BOOKINGS & BILLING */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">
                  My Bookings & Invoices
                </h2>
                <p className="text-xs text-neutral-500">
                  Track room reservation confirmation, monthly statements, and digital payment receipts.
                </p>
              </div>
            </div>

            {loadingBookings ? (
              <SkeletonTable rows={4} />
            ) : myBookings.length === 0 ? (
              <Card className="p-12 text-center border-neutral-200">
                <Bed className="mx-auto h-12 w-12 text-neutral-300" />
                <h3 className="text-base font-semibold text-neutral-900 mt-3">
                  No active bookings found
                </h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                  You haven't requested any hostel stays yet. Head over to the Discovery tab to select a property.
                </p>
                <Button
                  className="mt-4 bg-neutral-900 text-xs"
                  onClick={() => setActiveTab("explore")}
                >
                  Explore Hostels
                </Button>
              </Card>
            ) : (
              <Card className="border border-neutral-200/90 shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hostel & Property</TableHead>
                      <TableHead>Check-in Date</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Total Bill</TableHead>
                      <TableHead>Booking Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myBookings.map((b) => (
                      <TableRow key={b._id}>
                        <TableCell>
                          <div className="font-semibold text-neutral-900">
                            {b.hostelName}
                          </div>
                          <div className="text-xs text-neutral-500">
                            Room: {b.roomNumber || "Pending Allocation"}
                          </div>
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
                        <TableCell>
                          <Badge
                            variant={b.paymentStatus === "paid" ? "success" : "outline"}
                            className="text-[10px] uppercase font-mono"
                          >
                            {b.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {b.paymentStatus !== "paid" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 border-neutral-300"
                              onClick={() => handlePayInvoice(b._id)}
                            >
                              <CreditCard className="h-3.5 w-3.5 mr-1" /> Pay Rent
                            </Button>
                          ) : (
                            <span className="text-xs text-emerald-600 font-medium flex items-center justify-end gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Receipt Issued
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
        )}

        {/* TAB 3: MEAL SCHEDULE CALENDAR */}
        {activeTab === "meals" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">
                  Weekly Dining Schedule & Nutrition Menu
                </h2>
                <p className="text-xs text-neutral-500">
                  Curated daily meals included in hostel residency. Chef-prepared with dietary customization.
                </p>
              </div>

              {/* Day Selector Pills */}
              <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-lg border border-neutral-200">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                  (day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${
                        selectedDay === day
                          ? "bg-neutral-900 text-white shadow-sm"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  )
                )}
              </div>
            </div>

            {loadingMeals ? (
              <SkeletonTable rows={3} />
            ) : !activeMeal ? (
              <Card className="p-8 text-center border-neutral-200">
                <Utensils className="mx-auto h-8 w-8 text-neutral-300" />
                <p className="text-xs text-neutral-500 mt-2">
                  No specific menu published for {selectedDay} yet.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Breakfast Card */}
                <Card className="border border-neutral-200/90 shadow-sm">
                  <CardHeader className="p-5 pb-3 border-b border-neutral-100 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Coffee className="h-4 w-4 text-amber-600" /> Breakfast
                      </CardTitle>
                      <CardDescription className="text-xs font-mono mt-1">
                        {activeMeal.breakfast.timings}
                      </CardDescription>
                    </div>
                    <Badge variant={activeMeal.breakfast.isAvailable ? "success" : "destructive"}>
                      {activeMeal.breakfast.isAvailable ? "Available" : "Closed"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-5 text-sm text-neutral-800 leading-relaxed font-medium">
                    {activeMeal.breakfast.menu}
                  </CardContent>
                </Card>

                {/* Lunch Card */}
                <Card className="border border-neutral-200/90 shadow-sm">
                  <CardHeader className="p-5 pb-3 border-b border-neutral-100 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-emerald-600" /> Lunch
                      </CardTitle>
                      <CardDescription className="text-xs font-mono mt-1">
                        {activeMeal.lunch.timings}
                      </CardDescription>
                    </div>
                    <Badge variant={activeMeal.lunch.isAvailable ? "success" : "destructive"}>
                      {activeMeal.lunch.isAvailable ? "Available" : "Closed"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-5 text-sm text-neutral-800 leading-relaxed font-medium">
                    {activeMeal.lunch.menu}
                  </CardContent>
                </Card>

                {/* Dinner Card */}
                <Card className="border border-neutral-200/90 shadow-sm">
                  <CardHeader className="p-5 pb-3 border-b border-neutral-100 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600" /> Dinner
                      </CardTitle>
                      <CardDescription className="text-xs font-mono mt-1">
                        {activeMeal.dinner.timings}
                      </CardDescription>
                    </div>
                    <Badge variant={activeMeal.dinner.isAvailable ? "success" : "destructive"}>
                      {activeMeal.dinner.isAvailable ? "Available" : "Closed"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-5 text-sm text-neutral-800 leading-relaxed font-medium">
                    {activeMeal.dinner.menu}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MY MEAL TOKENS & AUTOMATIC BILLING */}
        {activeTab === "meal-tokens" && (
          <ResidentMealTokens
            hostelId={myBookings[0]?.hostelId as string}
            hostelName={myBookings[0]?.hostelName || "The Zenith Student Sanctuary"}
          />
        )}
      </div>

      {/* Booking Modal Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Room Reservation</DialogTitle>
            <DialogDescription className="text-xs">
              Reserve accommodation at {selectedHostel?.name}. Your reservation request is authoritatively sent to the property owner.
            </DialogDescription>
          </DialogHeader>

          {selectedHostel && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1">
                <div className="flex justify-between font-semibold text-neutral-900">
                  <span>Monthly Tariff:</span>
                  <span>${selectedHostel.pricePerMonth} / month</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Location:</span>
                  <span>{selectedHostel.city}</span>
                </div>
              </div>

              <div>
                <label className="font-medium text-neutral-700 block mb-1">
                  Check-in Start Date
                </label>
                <Input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="font-medium text-neutral-700 block mb-1">
                  Tenancy Duration
                </label>
                <Select
                  value={String(bookingDuration)}
                  onValueChange={(val) => setBookingDuration(Number(val))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months (Semester)</SelectItem>
                    <SelectItem value="12">12 Months (Full Academic Year)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="font-medium text-neutral-700 block mb-1">
                  Special Requests / Dietary Needs (Optional)
                </label>
                <Input
                  placeholder="e.g. Vegetarian diet, quiet study floor, bottom bunk"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="p-3 bg-neutral-900 text-white rounded-lg flex items-center justify-between font-medium">
                <span>Estimated Contract Value:</span>
                <span className="text-sm font-bold">
                  ${selectedHostel.pricePerMonth * bookingDuration}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBookingDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-neutral-900 hover:bg-neutral-800 text-white"
              onClick={handleCreateBooking}
              disabled={submittingBooking}
            >
              {submittingBooking ? "Sending..." : "Submit Reservation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

