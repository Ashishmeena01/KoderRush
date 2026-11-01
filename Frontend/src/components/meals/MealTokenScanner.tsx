import React, { useState } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Utensils,
  RefreshCw,
  Search,
  DollarSign,
  History,
  Calendar,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface VerifiedTokenPreview {
  _id: string;
  tokenHash: string;
  residentName: string;
  residentEmail: string;
  residentId: string;
  hostelName: string;
  mealType: string;
  mealDate: string;
  priceSnapshot: number;
  status: string;
  expiresAt: string;
}

interface RedemptionResult {
  resident: string;
  residentEmail?: string;
  meal: string;
  date: string;
  amount: number;
  status: string;
  billing: string;
  tokenHash: string;
  transactionId?: string;
  redeemedAt: string;
}

interface MealTokenScannerProps {
  onRedemptionSuccess?: () => void;
  redemptionHistory?: any[];
  refreshHistory?: () => void;
}

export const MealTokenScanner: React.FC<MealTokenScannerProps> = ({
  onRedemptionSuccess,
  redemptionHistory = [],
  refreshHistory,
}) => {
  const [tokenInput, setTokenInput] = useState<string>("");
  const [verifying, setVerifying] = useState<boolean>(false);
  const [redeeming, setRedeeming] = useState<boolean>(false);

  // States for verification & success
  const [verifiedToken, setVerifiedToken] = useState<VerifiedTokenPreview | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successRedemption, setSuccessRedemption] = useState<RedemptionResult | null>(null);

  // Quick Demo tokens helper
  const handleQuickPaste = (code: string) => {
    setTokenInput(code);
    handleVerify(code);
  };

  // Step 1: Verify token against backend
  const handleVerify = async (codeToVerify?: string) => {
    const code = (codeToVerify || tokenInput).trim();
    if (!code) {
      toast.error("Please enter or scan a valid token code");
      return;
    }

    try {
      setVerifying(true);
      setErrorMessage(null);
      setSuccessRedemption(null);
      setVerifiedToken(null);

      const res = await api.post("/meal-tokens/verify", {
        tokenIdentifier: code,
      });

      if (res.data.success && res.data.token) {
        setVerifiedToken(res.data.token);
        toast.success("Token verified and ready for meal collection!");
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || "Token verification failed";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  // Step 2: Confirm collection & execute atomic redemption + billing
  const handleRedeem = async () => {
    const code = (verifiedToken ? verifiedToken.tokenHash : tokenInput).trim();
    if (!code) return;

    try {
      setRedeeming(true);
      setErrorMessage(null);

      const res = await api.post("/meal-tokens/redeem", {
        tokenIdentifier: code,
      });

      if (res.data.success && res.data.redemption) {
        setSuccessRedemption(res.data.redemption);
        setVerifiedToken(null);
        setTokenInput("");
        toast.success("Meal issued! Resident billed ₹" + res.data.redemption.amount);
        if (onRedemptionSuccess) onRedemptionSuccess();
        if (refreshHistory) refreshHistory();
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || "Redemption and billing failed";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setRedeeming(false);
    }
  };

  const handleReset = () => {
    setTokenInput("");
    setVerifiedToken(null);
    setErrorMessage(null);
    setSuccessRedemption(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SCANNER CONTROL PANEL */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="border border-neutral-200/90 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-5 pb-3 border-b border-neutral-100 bg-neutral-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    Meal Token Scanner & Verification Terminal
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-500 mt-0.5">
                    Scan resident QR passes to confirm meal eligibility and trigger automatic billing.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="font-mono text-[10px]">
                  POSTPAID LEDGER
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              {/* Token Input Box */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 block">
                  Scan QR Pass or Enter Token Code
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                    <Input
                      placeholder="e.g. HH-LU-DEMO100X or paste QR string..."
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                      className="pl-9 font-mono text-xs uppercase h-10 border-neutral-300"
                    />
                  </div>
                  <Button
                    onClick={() => handleVerify()}
                    disabled={verifying || !tokenInput.trim()}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs h-10 px-5"
                  >
                    {verifying ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    ) : (
                      <Search className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Verify Token
                  </Button>
                </div>
              </div>

              {/* Quick Simulator Buttons for Testing */}
              <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-3">
                <div className="text-[11px] font-semibold text-neutral-600 mb-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" /> Test Scenarios & Quick Token Simulation:
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPaste("HH-LU-DEMO100X")}
                    className="text-xs bg-white border-neutral-300 hover:bg-neutral-100"
                  >
                    HH-LU-DEMO100X (Already Redeemed)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPaste("HH-INVALID-999")}
                    className="text-xs bg-white border-neutral-300 hover:bg-neutral-100"
                  >
                    HH-INVALID-999 (Non-existent)
                  </Button>
                  {redemptionHistory.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickPaste(redemptionHistory[0].tokenHash)}
                      className="text-xs bg-white border-neutral-300 hover:bg-neutral-100"
                    >
                      {redemptionHistory[0].tokenHash} (History Token)
                    </Button>
                  )}
                </div>
              </div>

              {/* ERROR STATE */}
              {errorMessage && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-xs font-bold text-red-800">
                    Verification Rejected
                  </AlertTitle>
                  <AlertDescription className="text-xs text-red-700 mt-1">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* PREVIEW: VERIFIED TOKEN READY FOR REDEMPTION */}
              {verifiedToken && (
                <div className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-900 tracking-wide font-mono uppercase">
                        Token Verified • Eligible for Collection
                      </span>
                    </div>
                    <Badge className="bg-emerald-600 text-white font-mono text-xs">
                      ₹{verifiedToken.priceSnapshot}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-lg border border-emerald-100 text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                        Resident Name
                      </span>
                      <span className="font-bold text-neutral-900 block truncate">
                        {verifiedToken.residentName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                        Meal Type
                      </span>
                      <span className="font-bold capitalize text-neutral-900 block flex items-center gap-1">
                        <Utensils className="h-3 w-3 text-neutral-500" />
                        {verifiedToken.mealType}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                        Hostel Property
                      </span>
                      <span className="text-neutral-700 block truncate">
                        {verifiedToken.hostelName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
                        Token Hash
                      </span>
                      <span className="font-mono text-neutral-700 block">
                        {verifiedToken.tokenHash}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleRedeem}
                      disabled={redeeming}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-10 shadow-sm"
                    >
                      {redeeming ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      )}
                      Confirm Meal Collection & Redeem (Charge ₹{verifiedToken.priceSnapshot})
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="text-xs h-10 border-neutral-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDE: OFFICIAL REDEMPTION CONFIRMATION DISPLAY */}
        <div className="lg:col-span-5">
          {successRedemption ? (
            <Card className="border-2 border-emerald-500 bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              <div className="bg-emerald-600 text-white p-5 text-center">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-white" />
                <h3 className="text-base font-black tracking-tight uppercase">
                  Meal Verified Successfully
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Meal dispatched to student & ledger updated
                </p>
              </div>

              <CardContent className="p-6 space-y-4 font-sans text-xs">
                <div className="divide-y divide-neutral-100 bg-neutral-50 rounded-xl p-4 border border-neutral-200/90 space-y-2.5">
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-neutral-500 font-medium">Resident:</span>
                    <span className="font-bold text-neutral-900">{successRedemption.resident}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-neutral-500 font-medium">Meal:</span>
                    <span className="font-bold capitalize text-neutral-900">{successRedemption.meal}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-neutral-500 font-medium">Date:</span>
                    <span className="font-medium text-neutral-800">{successRedemption.date}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-neutral-500 font-medium">Amount:</span>
                    <span className="font-extrabold text-neutral-900 font-mono text-sm">₹{successRedemption.amount}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-neutral-500 font-medium">Status:</span>
                    <Badge className="bg-emerald-600 text-white text-[11px] font-mono">
                      {successRedemption.status}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-neutral-500 font-medium">Billing:</span>
                    <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50 font-semibold text-[11px]">
                      {successRedemption.billing}
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={handleReset}
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs h-10"
                >
                  Scan Next Resident Token
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-neutral-200/90 shadow-sm bg-neutral-50/50 p-6 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-14 h-14 rounded-2xl bg-white border border-neutral-200 shadow-sm flex items-center justify-center mb-3">
                <Utensils className="h-6 w-6 text-neutral-400" />
              </div>
              <h4 className="text-sm font-bold text-neutral-800">
                Awaiting Token Verification
              </h4>
              <p className="text-xs text-neutral-500 max-w-xs mt-1 leading-relaxed">
                Scan or paste a token on the left. The authoritative verification receipt and automatic resident charge details will appear here.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* RECENT REDEMPTION HISTORY TABLE */}
      <Card className="border border-neutral-200/90 shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-5 pb-3 border-b border-neutral-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <History className="h-4 w-4" />
              Recent Meal Token Redemptions
            </CardTitle>
            <CardDescription className="text-xs text-neutral-500">
              Verified dining counter collections across your managed residences.
            </CardDescription>
          </div>
          {refreshHistory && (
            <Button
              variant="outline"
              size="sm"
              onClick={refreshHistory}
              className="text-xs border-neutral-300"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Refresh Ledger
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {redemptionHistory.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              No meal tokens redeemed yet today.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead>Resident</TableHead>
                  <TableHead>Hostel</TableHead>
                  <TableHead>Meal Type</TableHead>
                  <TableHead>Redemption Time</TableHead>
                  <TableHead>Amount Charged</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redemptionHistory.map((item: any) => (
                  <TableRow key={item._id} className="text-xs">
                    <TableCell>
                      <div className="font-semibold text-neutral-900">{item.residentName}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{item.tokenHash}</div>
                    </TableCell>
                    <TableCell className="text-neutral-700">{item.hostelName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize text-[10px]">
                        {item.mealType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {item.redeemedAt
                        ? new Date(item.redeemedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Today"}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-neutral-900">
                      ₹{item.priceSnapshot}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-600 text-white text-[10px] font-mono">
                        REDEEMED & BILLED
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
  );
};

