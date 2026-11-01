import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";

export const AuthLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 border border-neutral-200 rounded-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white">
            <Building2 className="h-5 w-5 animate-pulse" />
          </div>
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="space-y-4 pt-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="flex justify-center pt-2">
          <p className="text-xs text-neutral-400 font-mono tracking-wider">
            AUTHENTICATING USER IDENTITY...
          </p>
        </div>
      </div>
    </div>
  );
};

