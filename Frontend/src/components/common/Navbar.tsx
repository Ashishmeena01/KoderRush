import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  LogOut,
  Shield,
  Home,
  UtensilsCrossed,
  Receipt,
  BarChart3,
  Users,
  Layers,
  ChevronDown,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout, switchDevDemoRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "owner":
        return "warning";
      case "resident":
      default:
        return "secondary";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-neutral-900 tracking-tight leading-none text-base">
                HostelHub
              </span>
              <span className="text-[10px] text-neutral-500 font-mono tracking-wider">
                COLIVING SAAS
              </span>
            </div>
          </Link>

          {/* Navigation items based on role */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              <Link to="/dashboard/resident">
                <Button
                  variant={
                    location.pathname === "/dashboard/resident" ? "secondary" : "ghost"
                  }
                  size="sm"
                  className="text-xs font-medium"
                >
                  <Home className="h-3.5 w-3.5 mr-1.5" /> Discovery
                </Button>
              </Link>

              {user.role === "owner" && (
                <Link to="/dashboard/owner">
                  <Button
                    variant={
                      location.pathname === "/dashboard/owner" ? "secondary" : "ghost"
                    }
                    size="sm"
                    className="text-xs font-medium"
                  >
                    <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> Owner Portal
                  </Button>
                </Link>
              )}

              {user.role === "admin" && (
                <Link to="/dashboard/admin">
                  <Button
                    variant={
                      location.pathname === "/dashboard/admin" ? "secondary" : "ghost"
                    }
                    size="sm"
                    className="text-xs font-medium"
                  >
                    <Shield className="h-3.5 w-3.5 mr-1.5" /> Admin Console
                  </Button>
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Right action area */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Testing Role Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:inline-flex items-center gap-1.5 text-xs h-8 border-dashed border-neutral-300"
                  >
                    <Layers className="h-3.5 w-3.5 text-neutral-500" />
                    <span>Role:</span>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="uppercase text-[10px] px-1.5 py-0">
                      {user.role}
                    </Badge>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs text-neutral-500 font-mono">
                    TESTING ROLE SWITCHER
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      switchDevDemoRole("resident");
                      navigate("/dashboard/resident");
                    }}
                  >
                    <Home className="h-4 w-4 mr-2" /> Resident View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      switchDevDemoRole("owner");
                      navigate("/dashboard/owner");
                    }}
                  >
                    <Building2 className="h-4 w-4 mr-2" /> Owner View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      switchDevDemoRole("admin");
                      navigate("/dashboard/admin");
                    }}
                  >
                    <Shield className="h-4 w-4 mr-2" /> Admin View
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Avatar Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9 border border-neutral-200">
                      <AvatarImage src={user.avatar} alt={user.fullName} />
                      <AvatarFallback>
                        {user.fullName ? user.fullName[0].toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2">
                    <p className="text-sm font-semibold text-neutral-900 leading-none">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-neutral-500 truncate mt-1">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Badge variant={getRoleBadgeVariant(user.role)} className="uppercase text-[10px]">
                        {user.role}
                      </Badge>
                      <Badge
                        variant={user.accountStatus === "active" ? "success" : "warning"}
                        className="text-[10px]"
                      >
                        {user.accountStatus}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/onboarding/role")}>
                    <Layers className="h-4 w-4 mr-2" /> Change Role
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="h-4 w-4 mr-2 text-red-600" />
                    <span className="text-red-600">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/sign-in">
                <Button variant="ghost" size="sm" className="text-xs">
                  Sign in
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button size="sm" className="text-xs bg-neutral-900 hover:bg-neutral-800 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

