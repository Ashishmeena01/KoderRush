import React from "react";
import { Building2, Shield, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-neutral-200/80 bg-white py-8 text-neutral-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-neutral-900" />
          <span className="font-semibold text-neutral-900">HostelHub</span>
          <span>— Production Coliving & Student Accommodation SaaS</span>
        </div>
        <div className="flex items-center gap-6 text-neutral-500">
          <span className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-emerald-600" /> Firebase Auth + Node.js Admin RBAC
          </span>
          <span>© 2026 HostelHub Inc. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

