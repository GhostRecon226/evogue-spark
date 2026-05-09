import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, BookOpen, Award, User, LogOut, Menu, ArrowLeft, Shield, GraduationCap, ClipboardCheck, Users, Wallet, Mail } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/landing/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/use-auth";

type NavItem = { label: string; to: string; icon: typeof LayoutDashboard };

const studentItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "My Courses", to: "/dashboard/courses", icon: BookOpen },
  { label: "Certificates", to: "/dashboard/certificates", icon: Award },
  { label: "Profile", to: "/dashboard/profile", icon: User },
];
const adminItems: NavItem[] = [
  { label: "Overview", to: "/admin", icon: Shield },
  { label: "Students", to: "/admin/students", icon: Users },
  { label: "Courses", to: "/admin/courses", icon: BookOpen },
  { label: "Enrollments", to: "/admin/enrollments", icon: ClipboardCheck },
  { label: "Payments", to: "/admin/payments", icon: Wallet },
  { label: "Inquiries", to: "/admin/inquiries", icon: Mail },
  { label: "Capstones", to: "/admin/capstones", icon: ClipboardCheck },
];
const instructorItems: NavItem[] = [
  { label: "Overview", to: "/instructor", icon: GraduationCap },
  { label: "My Courses", to: "/instructor/courses", icon: BookOpen },
  { label: "Students", to: "/instructor/students", icon: Users },
  { label: "Upload Content", to: "/instructor/upload", icon: ClipboardCheck },
  { label: "Capstones", to: "/instructor/capstones", icon: ClipboardCheck },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, signOut, isAdmin, isInstructor } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const initials = (user?.user_metadata?.full_name || user?.email || "U")
    .split(/\s+/)
    .map((p: string) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";

  const allItems = [
    ...studentItems,
    ...(isAdmin ? adminItems : []),
    ...(isInstructor ? instructorItems : []),
  ];

  const exactMatch = (to: string) => to === "/dashboard" || to === "/admin" || to === "/instructor";
  const current = allItems.find((it) =>
    exactMatch(it.to) ? path === it.to : path.startsWith(it.to),
  );

  const renderGroup = (label: string, group: typeof studentItems) => (
    <>
      <p className="px-4 pb-2 pt-3 text-[11px] uppercase tracking-[0.16em] font-semibold text-mint/45">
        {label}
      </p>
      {group.map((it) => {
        const active = exactMatch(it.to) ? path === it.to : path.startsWith(it.to);
        return (
          <Link
            key={it.to}
            to={it.to as "/dashboard"}
            onClick={() => setOpen(false)}
            className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
              active
                ? "bg-mint text-forest shadow-[0_10px_30px_-12px_color-mix(in_oklab,var(--mint)_55%,transparent)]"
                : "text-mint/80 hover:bg-mint/10 hover:text-mint"
            }`}
          >
            <it.icon className="h-4 w-4" /> {it.label}
          </Link>
        );
      })}
    </>
  );

  const Sidebar = (
    <div
      className="h-full flex flex-col text-mint"
      style={{ background: "var(--gradient-forest)" }}
    >
      <div className="px-6 py-6 border-b border-mint/15">
        <Link to="/" onClick={() => setOpen(false)} aria-label="Evogue Academy home">
          <Logo variant="light" />
        </Link>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {renderGroup("Student", studentItems)}
        {isInstructor && renderGroup("Instructor", instructorItems)}
        {isAdmin && renderGroup("Admin", adminItems)}
      </nav>
      <div className="px-3 py-4 border-t border-mint/15 space-y-1">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-mint/80 hover:bg-mint/10 hover:text-mint transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-mint/80 hover:bg-mint/10 hover:text-mint transition"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-mint-tint flex">
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">{Sidebar}</aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-background/85 backdrop-blur-md border-b border-border px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex items-center gap-3 min-w-0">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SheetTitle className="sr-only">Dashboard menu</SheetTitle>
                {Sidebar}
              </SheetContent>
            </Sheet>
            <div className="lg:hidden">
              <Link to="/" aria-label="Evogue Academy home"><Logo /></Link>
            </div>
            <h1 className="hidden lg:block font-display text-lg font-bold text-forest truncate">
              {current?.label ?? "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex rounded-full text-sm">
              <Link to="/courses">Browse courses</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full ring-2 ring-transparent hover:ring-secondary/40 transition" aria-label="Account menu">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt="" />
                    <AvatarFallback className="bg-forest text-mint font-bold text-sm">{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}
