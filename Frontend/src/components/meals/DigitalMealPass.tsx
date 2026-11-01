import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { MealToken } from "@/types/meal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Copy,
  Utensils,
  Building2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface DigitalMealPassProps {
  token: MealToken | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalMealPass: React.FC<DigitalMealPassProps> = ({
  token,
  isOpen,
  onClose,
}) => {
  if (!token) return null;

  const copyTokenCode = () => {
    navigator.clipboard.writeText(token.tokenHash);
    toast.success("Token code copied to clipboard!");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs px-2.5 py-0.5">
            <CheckCircle2 className="h-3 w-3 mr-1" /> ACTIVE • READY TO REDEEM
          </Badge>
        );
      case "redeemed":
        return (
          <Badge className="bg-neutral-800 text-neutral-200 font-mono text-xs px-2.5 py-0.5">
            <CheckCircle2 className="h-3 w-3 mr-1" /> REDEEMED
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive" className="font-mono text-xs px-2.5 py-0.5">
            <AlertCircle className="h-3 w-3 mr-1" /> EXPIRED
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="font-mono text-xs px-2.5 py-0.5 text-neutral-500">
            <XCircle className="h-3 w-3 mr-1" /> CANCELLED
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(token.mealDate));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white border border-neutral-200/90 shadow-2xl rounded-2xl">
        {/* Pass Header Banner */}
        <div className="bg-neutral-950 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-neutral-300" />
              HOSTELHUB DIGITAL MEAL PASS
            </div>
            {getStatusBadge(token.status)}
          </div>
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-black capitalize tracking-tight text-white flex items-center gap-2">
              <Utensils className="h-5 w-5 text-neutral-300" />
              {token.mealType} Token
            </h2>
            <div className="text-xl font-extrabold text-neutral-100 font-mono">
              ₹{token.priceSnapshot}
            </div>
          </div>
          <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {token.hostelName}
          </p>
        </div>

        {/* QR Code Presentation Box */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-neutral-300 shadow-inner flex flex-col items-center">
            {/* The QR code encodes token.tokenHash */}
            <div className="p-3 bg-white rounded-xl shadow-sm border border-neutral-100">
              <QRCodeSVG
                value={token.tokenHash}
                size={180}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/favicon.ico",
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
              />
            </div>
            <div className="mt-3 flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-mono text-neutral-800">
              <span className="font-semibold">{token.tokenHash}</span>
              <button
                onClick={copyTokenCode}
                title="Copy Token Code"
                className="text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Resident & Meal Metadata Grid */}
          <div className="w-full grid grid-cols-2 gap-3 text-left bg-neutral-50 p-4 rounded-xl border border-neutral-200/80 text-xs">
            <div>
              <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider block">
                Resident Name
              </span>
              <span className="font-bold text-neutral-900 truncate block">
                {token.residentName}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider block">
                Resident ID
              </span>
              <span className="font-mono text-neutral-700 truncate block">
                {String(token.residentId).slice(-8).toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider block">
                Scheduled Date
              </span>
              <span className="font-medium text-neutral-800 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-neutral-400" />
                {formattedDate}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider block">
                Valid Until
              </span>
              <span className="font-medium text-neutral-800 flex items-center gap-1">
                <Clock className="h-3 w-3 text-neutral-400" />
                {new Date(token.expiresAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Collection Instructions */}
          <div className="w-full text-left bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
            <div className="font-semibold flex items-center gap-1 text-amber-950">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Dining Collection Instructions
            </div>
            <p className="leading-relaxed">
              Show this QR code at the dining hall counter. Once scanned by the kitchen warden, your meal will be issued and <span className="font-semibold">₹{token.priceSnapshot}</span> will be charged automatically to your hostel billing ledger.
            </p>
          </div>

          <div className="w-full flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={copyTokenCode}
              className="flex-1 text-xs border-neutral-300 hover:bg-neutral-100"
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy Code
            </Button>
            <Button
              size="sm"
              onClick={onClose}
              className="flex-1 text-xs bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

