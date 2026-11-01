import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { MealItem, MealToken, MealBillingSummary } from "@/types/meal";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DigitalMealPass } from "./DigitalMealPass";
import {
  Utensils,
  QrCode,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  History,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

interface ResidentMealTokensProps {
  hostelId?: string;
  hostelName?: string;
}

export const ResidentMealTokens: React.FC<ResidentMealTokensProps> = ({
  hostelId,
  hostelName = "The Zenith Student Sanctuary",
}) => {
  const [todayMeals, setTodayMeals] = useState<MealItem[]>([]);
  const [myTokens, setMyTokens] = useState<MealToken[]>([]);
  const [billing, setBilling] = useState<MealBillingSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generatingMealType, setGeneratingMealType] = useState<string | null>(null);

  // Digital Pass Dialog state
  const [selectedTokenForPass, setSelectedTokenForPass] = useState<MealToken | null>(null);
  const [passDialogOpen, setPassDialogOpen] = useState<boolean>(false);

  // Paying bill state
  const [payingBill, setPayingBill] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mealsRes, tokensRes, billingRes] = await Promise.all([
        api.get("/meals/today", { params: hostelId ? { hostelId } : {} }),
        api.get("/meal-tokens/my-tokens"),
        api.get("/meal-tokens/billing/my-transactions"),
      ]);

      if (mealsRes.data.success) {
        setTodayMeals(mealsRes.data.meals);
      }
      if (tokensRes.data.success) {
        setMyTokens(tokensRes.data.tokens);
      }
      if (billingRes.data.success) {
        setBilling(billingRes.data);
      }
    } catch (err: any) {
      console.warn("Meal data fetch notice:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [hostelId]);

  // Generate Token
  const handleGenerateToken = async (meal: MealItem) => {
    try {
      setGeneratingMealType(meal.mealType);
      const res = await api.post("/meal-tokens/generate", {
        hostelId: meal.hostelId || hostelId,
        mealType: meal.mealType,
        mealDate: new Date().toISOString(),
      });

      if (res.data.success && res.data.token) {
        toast.success(`Token generated for ${meal.mealType}! Digital QR pass is ready.`);
        setSelectedTokenForPass(res.data.token);
        setPassDialogOpen(true);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Could not generate meal token");
    } finally {
      setGeneratingMealType(null);
    }
  };

  // Pay Outstanding Balance
  const handlePayBilling = async () => {
    if (!billing || billing.outstandingBalance <= 0) return;

    try {
      setPayingBill(true);
      const res = await api.post("/meal-tokens/billing/pay");
      if (res.data.success) {
        toast.success(res.data.message || "Meal dues settled successfully!");
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Payment processing failed");
    } finally {
      setPayingBill(false);
    }
  };

  // Find active token for today
  const activeTodayToken = myTokens.find(
    (t) =>
      t.status === "active" &&
      new Date(t.mealDate).toDateString() === new Date().toDateString()
  );

  return (
    <div className="space-y-8">
      {/* ACTIVE TOKEN HERO BANNER (If resident has an active pass right now) */}
      {activeTodayToken && (
        <Card className="border-2 border-neutral-900 bg-neutral-950 text-white shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-emerald-500/10 to-transparent blur-2xl pointer-events-none" />
          <CardContent className="p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500 text-neutral-950 font-bold font-mono text-xs">
                  READY FOR DINING COLLECTION
                </Badge>
                <span className="text-xs text-neutral-400 font-mono">
                  Code: {activeTodayToken.tokenHash}
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white capitalize">
                Your {activeTodayToken.mealType} Pass is Active
              </h3>
              <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
                Show this digital QR code at the dining counter to collect your meal. Automatic billing of ₹{activeTodayToken.priceSnapshot} will be charged only after kitchen staff verification.
              </p>
            </div>

            <Button
              size="lg"
              onClick={() => {
                setSelectedTokenForPass(activeTodayToken);
                setPassDialogOpen(true);
              }}
              className="bg-white hover:bg-neutral-100 text-neutral-950 font-bold text-xs h-11 px-6 shadow-md transition-all active:scale-[0.98]"
            >
              <QrCode className="h-4 w-4 mr-2" />
              View Digital QR Pass
            </Button>
          </CardContent>
        </Card>
      )}

      {/* TODAY'S MEALS: BREAKFAST, LUNCH, DINNER CARDS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Today's Meals & Digital Token Desk
            </h2>
            <p className="text-xs text-neutral-500">
              Claim chef-prepared meals for today at {hostelName}. Tokens are verified via QR scanner at the counter.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="text-xs border-neutral-300 w-fit"
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Refresh Desk
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 border-neutral-200 animate-pulse h-48 bg-neutral-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {todayMeals.map((meal) => {
              // Check if resident already claimed a token for this meal today
              const existingTokenForMeal = myTokens.find(
                (t) =>
                  t.mealType === meal.mealType &&
                  new Date(t.mealDate).toDateString() === new Date().toDateString() &&
                  t.status !== "cancelled"
              );

              const isClaimed = !!existingTokenForMeal;
              const isGenerating = generatingMealType === meal.mealType;

              return (
                <Card
                  key={meal._id}
                  className={`border transition-all bg-white overflow-hidden flex flex-col justify-between ${
                    existingTokenForMeal?.status === "active"
                      ? "border-emerald-500 shadow-md ring-1 ring-emerald-500/30"
                      : "border-neutral-200/90 shadow-sm hover:shadow-md"
                  }`}
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="capitalize text-xs font-bold">
                        {meal.mealType}
                      </Badge>
                      <div className="text-lg font-black font-mono text-neutral-900">
                        ₹{meal.price}
                      </div>
                    </div>
                    <CardTitle className="text-sm font-bold text-neutral-900 leading-snug">
                      {meal.name}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3">
                    <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/70 text-[11px] space-y-1.5 font-mono text-neutral-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-neutral-500">
                          <Clock className="h-3 w-3" /> Timings:
                        </span>
                        <span className="font-semibold text-neutral-800">{meal.timings}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Claim Deadline:</span>
                        <span className="font-semibold text-neutral-800">
                          {meal.tokenGenerationDeadline || "1 hr before"}
                        </span>
                      </div>
                    </div>

                    {isClaimed ? (
                      <div className="pt-2">
                        {existingTokenForMeal?.status === "active" ? (
                          <Button
                            onClick={() => {
                              setSelectedTokenForPass(existingTokenForMeal);
                              setPassDialogOpen(true);
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-semibold"
                          >
                            <QrCode className="h-3.5 w-3.5 mr-1.5" /> View Active QR Pass
                          </Button>
                        ) : (
                          <div className="text-center py-2 bg-neutral-100 rounded-lg text-xs font-semibold text-neutral-600 flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-neutral-500" />
                            Meal Collected ({existingTokenForMeal?.status.toUpperCase()})
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="pt-2">
                        <Button
                          disabled={!meal.isAvailable || isGenerating}
                          onClick={() => handleGenerateToken(meal)}
                          className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs h-9 font-semibold transition-all active:scale-[0.98]"
                        >
                          {isGenerating ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                          ) : (
                            <QrCode className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          Get {meal.mealType} Token (₹{meal.price})
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* AUTOMATIC BILLING & TRANSACTIONS SUMMARY CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <Card className="border border-neutral-200/90 shadow-sm bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Postpaid Meal Ledger
              </span>
              <Wallet className="h-4 w-4 text-neutral-400" />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-neutral-500">Current Outstanding Due</span>
              <div className="text-3xl font-black text-neutral-900 font-mono">
                ₹{billing?.outstandingBalance || 0}
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed pt-1">
                Charges accrue automatically only upon kitchen staff redemption. Added to your semester invoice.
              </p>
            </div>

            <Button
              disabled={payingBill || (billing?.outstandingBalance || 0) <= 0}
              onClick={handlePayBilling}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs h-9 font-semibold"
            >
              {payingBill ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <CreditCard className="h-3.5 w-3.5 mr-1.5" />
              )}
              Clear Dues (₹{billing?.outstandingBalance || 0})
            </Button>
          </Card>
        </div>

        {/* RECENT TRANSACTIONS LEDGER */}
        <div className="lg:col-span-8">
          <Card className="border border-neutral-200/90 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-4 pb-2 border-b border-neutral-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Itemized Meal Billing Ledger
                </CardTitle>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                AUTO-POSTED
              </Badge>
            </CardHeader>

            <CardContent className="p-0">
              {!billing || billing.transactions.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-500">
                  No meal charges accrued yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs">
                      <TableHead>Date</TableHead>
                      <TableHead>Meal Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billing.transactions.map((tx) => (
                      <TableRow key={tx._id} className="text-xs">
                        <TableCell className="text-neutral-600">
                          {new Date(tx.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-neutral-900">{tx.description}</div>
                          <div className="text-[10px] text-neutral-400 capitalize">
                            {tx.mealType} • Postpaid Charge
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-bold text-neutral-900">
                          ₹{tx.amount}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-[10px] font-mono ${
                              tx.status === "completed"
                                ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                            }`}
                          >
                            {tx.status === "completed" ? "OUTSTANDING" : "PAID"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* PREVIOUS TOKEN CLAIMS TABLE */}
      <Card className="border border-neutral-200/90 shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-4 pb-2 border-b border-neutral-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" />
              Meal Token Claim History
            </CardTitle>
          </div>
          <span className="text-xs text-neutral-400">Total Tokens: {myTokens.length}</span>
        </CardHeader>

        <CardContent className="p-0">
          {myTokens.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              You haven't claimed any meal tokens yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead>Token Code</TableHead>
                  <TableHead>Meal</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Snapshot Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myTokens.map((t) => (
                  <TableRow key={t._id} className="text-xs">
                    <TableCell className="font-mono font-semibold text-neutral-900">
                      {t.tokenHash}
                    </TableCell>
                    <TableCell className="capitalize font-medium text-neutral-800">
                      {t.mealType}
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {new Date(t.mealDate).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-neutral-900">
                      ₹{t.priceSnapshot}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`font-mono text-[10px] ${
                          t.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : t.status === "redeemed"
                            ? "bg-neutral-100 text-neutral-700 border-neutral-300"
                            : "bg-red-50 text-red-700 border-red-300"
                        }`}
                      >
                        {t.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTokenForPass(t);
                          setPassDialogOpen(true);
                        }}
                        className="text-xs h-7 hover:bg-neutral-100 text-neutral-700"
                      >
                        <QrCode className="h-3.5 w-3.5 mr-1" /> View Pass
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* DIGITAL QR MEAL PASS MODAL */}
      <DigitalMealPass
        token={selectedTokenForPass}
        isOpen={passDialogOpen}
        onClose={() => setPassDialogOpen(false)}
      />
    </div>
  );
};

