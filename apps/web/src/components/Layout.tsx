import { UserButton, useUser } from "@clerk/clerk-react";
import { FileText, Home, Menu } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useClerkApiAuth } from "@/hooks/useClerkApiAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/posts", label: "Posts", icon: FileText },
];

export function Layout() {
  useClerkApiAuth();
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <span className="text-lg font-semibold tracking-tight">MyApp</span>
            <Separator orientation="vertical" className="h-5" />
            <nav className="flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-secondary font-medium text-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                    )
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right — Clerk UserButton */}
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:block">
              {user?.firstName ?? user?.emailAddresses[0]?.emailAddress}
            </span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
