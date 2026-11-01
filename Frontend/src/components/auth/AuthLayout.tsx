import React from "react";
import { Link } from "react-router-dom";
import { Building2, ShieldCheck, Sparkles } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle geometric background accents inspired by haikei & minimal grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 transition-colors text-neutral-900 text-sm font-medium mb-6"
        >
          <Building2 className="h-4 w-4" />
          <span>HostelHub SaaS</span>
          <span className="flex items-center gap-1 text-xs text-neutral-500 font-mono">
            <Sparkles className="h-3 w-3 text-amber-500" /> v3.0
          </span>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900">
          {title}
        </h2>
        <p className="mt-2 text-sm text-neutral-600 max-w-sm mx-auto">
          {subtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-sm border border-neutral-200/90 rounded-2xl">
          {children}
        </div>

        {/* Security assurance footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-neutral-500">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Firebase Identity & RBAC Protection Verified</span>
        </div>
      </div>
    </div>
  );
};

