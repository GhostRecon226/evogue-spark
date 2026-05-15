import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, BookOpen, Award, User, LogOut, Menu, ArrowLeft, Shield, GraduationCap, ClipboardCheck, Users, Wallet, Mail, CalendarDays, PlayCircle, Megaphone, Settings as SettingsIcon, Bell } from "lucide-react";
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
  { label: "Cohorts", to: "/admin/cohorts", icon: CalendarDays },
  { label: "Lessons", to: "/admin/lessons", icon: PlayCircle },
  { label: "Enrollments", to: "/admin/enrollments", icon: ClipboardCheck },
  { label: "Capstones", to: "/admin/capstones", icon: ClipboardCheck },
  { label: "Certificates", to: "/admin/certificates", icon: Award },
  { label: "Payments", to: "/admin/payments", icon: Wallet },
  { label: "Inquiries", to: "/admin/inquiries", icon: Mail },
  { label: "Announcements", to: "/admin/announcements", icon: Megaphone },
  { label: "Settings", to: "/admin/settings", icon: SettingsIcon },
];
const instructorItems: NavItem[] = [
  { label: "Overview", to: "/instructor", icon: GraduationCap },
  { label: "My Courses", to: "/instructor/courses", icon: BookOpen },
  { label: "Students", to: "/instructor/students", icon: Users },
  { label: "Upload Content", to: "/instructor/upload", icon: ClipboardCheck },
  { label: "Capstone Reviews", to: "/instructor/capstones", icon: ClipboardCheck },
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

  // Role-based: admin sees ONLY admin nav, instructor sees ONLY instructor nav, student sees student nav.
  const navItems: NavItem[] = isAdmin ? adminItems : isInstructor ? instructorItems : studentItems;
  const roleLabel = isAdmin ? "Admin" : isInstructor ? "Instructor" : "Student";

  const exactMatch = (to: string) => to === "/dashboard" || to === "/admin" || to === "/instructor";
  const current = navItems.find((it) =>
    exactMatch(it.to) ? path === it.to : path.startsWith(it.to),
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
        <div className="mt-4">
          <p className="text-sm font-semibold text-white truncate">{displayName}</p>
          <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-mint mt-0.5">{roleLabel}</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((it) => {
          const active = exactMatch(it.to) ? path === it.to : path.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to as "/dashboard"}
              onClick={() => setOpen(false)}
              className={`group relative flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                active
                  ? "bg-mint text-forest shadow-[0_10px_30px_-12px_color-mix(in_oklab,var(--mint)_55%,transparent)]"
                  : "text-mint/80 hover:bg-mint/10 hover:text-mint"
              }`}
            >
              <it.icon className="h-4 w-4 shrink-0" /> <span className="truncate">{it.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-mint/15 space-y-1">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-xl px-5 py-2.5 text-xs font-semibold text-mint/45 hover:bg-mint/5 hover:text-mint/70 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to site
        </Link>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold text-mint/80 hover:bg-mint/10 hover:text-mint transition"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );

  // Mobile bottom nav: students see student tabs; admin/instructor users keep using the hamburger sheet for their portals.
  const showStudentBottomNav = !isAdmin && !isInstructor;

  return (
    <div className="min-h-screen bg-mint-tint flex">
      <aside className="hidden lg:block w-[260px] shrink-0 sticky top-0 h-screen">{Sidebar}</aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-background/85 backdrop-blur-md border-b border-border px-4 sm:px-6 lg:px-8 h-16">
          <div className="flex items-center gap-3 min-w-0">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" aria-label="Open menu" className="h-11 w-11">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[85vw] max-w-xs">
                <SheetTitle className="sr-only">Dashboard menu</SheetTitle>
                {Sidebar}
              </SheetContent>
            </Sheet>
            <div className="lg:hidden min-w-0">
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
            <button
              type="button"
              aria-label="Notifications"
              className="relative h-11 w-11 grid place-items-center rounded-full hover:bg-mint/15 transition"
            >
              <Bell className="h-5 w-5 text-forest" />
              <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-mint text-forest text-[10px] font-extrabold ring-2 ring-background">
                3
              </span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full ring-2 ring-transparent hover:ring-secondary/40 transition h-11 w-11 grid place-items-center" aria-label="Account menu">
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

        <main className={`flex-1 p-4 sm:p-6 lg:p-8 min-w-0 ${showStudentBottomNav ? "pb-24 lg:pb-8" : ""}`}>
          {children}
        </main>

        {showStudentBottomNav && (
          <nav
            className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            aria-label="Primary"
          >
            <ul className="grid grid-cols-4">
              {studentItems.map((it) => {
                const active = it.to === "/dashboard" ? path === it.to : path.startsWith(it.to);
                return (
                  <li key={it.to}>
                    <Link
                      to={it.to as "/dashboard"}
                      className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold min-h-[56px] transition ${
                        active ? "text-secondary" : "text-foreground/60 hover:text-forest"
                      }`}
                    >
                      <it.icon className="h-5 w-5" />
                      <span className="truncate max-w-full px-1">{it.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}
