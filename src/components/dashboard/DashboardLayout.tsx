import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, BookOpen, Award, User, LogOut, Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/landing/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/use-auth";

const items = [
  { label: "Dashboard", to: "/dashboard" as const, icon: LayoutDashboard },
  { label: "My Courses", to: "/dashboard/courses" as const, icon: BookOpen },
  { label: "Certificates", to: "/dashboard/certificates" as const, icon: Award },
  { label: "Profile", to: "/dashboard/profile" as const, icon: User },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const Sidebar = (
    <div className="h-full flex flex-col bg-forest text-mint">
      <div className="px-6 py-6 border-b border-mint/15">
        <Link to="/"><Logo variant="light" /></Link>
      </div>
      <nav className="flex-1 px-3 py-5 space-y-1">
        {items.map((it) => {
          const active = it.to === "/dashboard" ? path === it.to : path.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                active ? "bg-mint text-forest" : "text-mint/85 hover:bg-mint/10"
              }`}
            >
              <it.icon className="h-4 w-4" /> {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-mint/15">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-mint/85 hover:bg-mint/10"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-mint-tint flex">
      <aside className="hidden lg:block w-64 shrink-0">{Sidebar}</aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between bg-background border-b border-border px-4 py-3">
          <Link to="/"><Logo /></Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
              <SheetTitle className="sr-only">Dashboard menu</SheetTitle>
              {Sidebar}
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}
