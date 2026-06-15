import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  User,
  LogOut,
  Menu,
  ArrowLeft,
  Shield,
  GraduationCap,
  ClipboardCheck,
  Users,
  Wallet,
  Mail,
  CalendarDays,
  PlayCircle,
  Megaphone,
  Settings as SettingsIcon,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  UserCircle2,
  Video,
  Ticket,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Logo } from "@/components/landing/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

type NavItem = { label: string; to: string; icon: typeof LayoutDashboard };

const studentItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "My Courses", to: "/dashboard/courses", icon: BookOpen },
  { label: "Capstone", to: "/dashboard/capstone", icon: GraduationCap },
  { label: "Certificate", to: "/dashboard/certificate", icon: Award },
  { label: "Profile", to: "/dashboard/profile", icon: User },
];
const adminItems: NavItem[] = [
  { label: "Overview", to: "/admin", icon: Shield },
  { label: "Students", to: "/admin/students", icon: Users },
  { label: "Applications", to: "/admin/applications", icon: ClipboardCheck },
  { label: "Courses", to: "/admin/courses", icon: BookOpen },
  { label: "Cohorts", to: "/admin/cohorts", icon: CalendarDays },
  { label: "Lessons", to: "/admin/lessons", icon: PlayCircle },
  { label: "Enrollments", to: "/admin/enrollments", icon: ClipboardCheck },
  { label: "Capstones", to: "/admin/capstones", icon: ClipboardCheck },
  { label: "Certificates", to: "/admin/certificates", icon: Award },
  { label: "Payments", to: "/admin/payments", icon: Wallet },
  { label: "Inquiries", to: "/admin/inquiries", icon: Mail },
  { label: "Announcements", to: "/admin/announcements", icon: Megaphone },
  { label: "Coupons", to: "/admin/coupons", icon: Ticket },
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
  const { user, profile, signOut, isAdmin, isInstructor } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const canCollapse = isAdmin || isInstructor;
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("sidebar-collapsed") === "1";
  });
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("sidebar-collapsed", collapsed ? "1" : "0");
    }
  }, [collapsed]);

  // Notifications: admins see live counts of new applications + payments; others see placeholders.
  type NotifItem = {
    id: string;
    type: "class" | "announcement" | "certificate" | "application" | "payment";
    title: string;
    body: string;
    time: string;
    read: boolean;
    to?: string;
  };
  const [notifOpen, setNotifOpen] = useState(false);
  const [adminCounts, setAdminCounts] = useState<{ applications: number; payments: number }>({
    applications: 0,
    payments: 0,
  });

  const readLastViewed = (key: string): number => {
    if (typeof window === "undefined") return 0;
    const v = window.localStorage.getItem(key);
    return v ? Number(v) || 0 : 0;
  };
  const writeLastViewed = (key: string, value: number) => {
    if (typeof window !== "undefined") window.localStorage.setItem(key, String(value));
  };

  const refreshAdminCounts = async () => {
    const sinceApps = new Date(readLastViewed("admin-notif-apps") || 0).toISOString();
    const sincePays = new Date(readLastViewed("admin-notif-pays") || 0).toISOString();
    const [apps, pays] = await Promise.all([
      supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .gt("created_at", sinceApps),
      supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .gt("created_at", sincePays),
    ]);
    setAdminCounts({
      applications: apps.count ?? 0,
      payments: pays.count ?? 0,
    });
  };

  useEffect(() => {
    if (!isAdmin) return;
    void refreshAdminCounts();
    const ch = supabase
      .channel("admin-notif-bell")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications" },
        () => void refreshAdminCounts(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => void refreshAdminCounts(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // Clear the relevant counter when admin opens the matching table.
  useEffect(() => {
    if (!isAdmin) return;
    if (path === "/admin/applications" || path.startsWith("/admin/applications/")) {
      writeLastViewed("admin-notif-apps", Date.now());
      setAdminCounts((c) => ({ ...c, applications: 0 }));
    }
    if (path === "/admin/payments" || path.startsWith("/admin/payments/")) {
      writeLastViewed("admin-notif-pays", Date.now());
      setAdminCounts((c) => ({ ...c, payments: 0 }));
    }
  }, [path, isAdmin]);

  const adminNotifications: NotifItem[] = isAdmin
    ? [
        ...(adminCounts.applications > 0
          ? [
              {
                id: "admin-apps",
                type: "application" as const,
                title:
                  adminCounts.applications === 1
                    ? "New application"
                    : `${adminCounts.applications} new applications`,
                body: "Review and follow up with prospective students.",
                time: "Just now",
                read: false,
                to: "/admin/applications",
              },
            ]
          : []),
        ...(adminCounts.payments > 0
          ? [
              {
                id: "admin-pays",
                type: "payment" as const,
                title:
                  adminCounts.payments === 1
                    ? "New payment recorded"
                    : `${adminCounts.payments} new payments`,
                body: "Open the Payments table to view details.",
                time: "Just now",
                read: false,
                to: "/admin/payments",
              },
            ]
          : []),
      ]
    : [];

  // Students: pull real notifications from the notifications table (realtime).
  const [studentNotifications, setStudentNotifications] = useState<NotifItem[]>([]);
  const isStudentUser = !isAdmin && !isInstructor;

  const fmtRelative = (iso: string) => {
    const then = new Date(iso).getTime();
    const diff = Math.max(0, Date.now() - then);
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(iso).toLocaleDateString();
  };

  const loadStudentNotifications = async (uid: string) => {
    const { data } = await supabase
      .from("notifications")
      .select("id, title, message, is_read, created_at, link")
      .eq("student_id", uid)
      .order("created_at", { ascending: false })
      .limit(20);
    setStudentNotifications(
      (data ?? []).map((n: any) => ({
        id: n.id as string,
        type: "announcement" as const,
        title: n.title as string,
        body: n.message as string,
        time: fmtRelative(n.created_at as string),
        read: Boolean(n.is_read),
        to: (n.link as string | null) ?? undefined,
      })),
    );
  };

  useEffect(() => {
    if (!isStudentUser || !user?.id) return;
    void loadStudentNotifications(user.id);
    const ch = supabase
      .channel(`student-notif-bell-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `student_id=eq.${user.id}`,
        },
        () => void loadStudentNotifications(user.id),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStudentUser, user?.id]);

  const notifications: NotifItem[] = isAdmin
    ? adminNotifications
    : isStudentUser
      ? studentNotifications
      : [];

  const markAllRead = async () => {
    if (isAdmin) {
      writeLastViewed("admin-notif-apps", Date.now());
      writeLastViewed("admin-notif-pays", Date.now());
      setAdminCounts({ applications: 0, payments: 0 });
      return;
    }
    if (isStudentUser && user?.id) {
      const unreadIds = studentNotifications.filter((n) => !n.read).map((n) => n.id);
      if (unreadIds.length === 0) return;
      setStudentNotifications((arr) => arr.map((n) => ({ ...n, read: true })));
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", unreadIds);
    }
  };
  const markOneRead = async (id: string) => {
    if (isAdmin) {
      if (id === "admin-apps") {
        writeLastViewed("admin-notif-apps", Date.now());
        setAdminCounts((c) => ({ ...c, applications: 0 }));
      } else if (id === "admin-pays") {
        writeLastViewed("admin-notif-pays", Date.now());
        setAdminCounts((c) => ({ ...c, payments: 0 }));
      }
      return;
    }
    if (isStudentUser) {
      setStudentNotifications((arr) =>
        arr.map((x) => (x.id === id ? { ...x, read: true } : x)),
      );
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    }
  };
  const unreadCount = notifications.filter((n) => !n.read).length;
  const notifRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!notifOpen) return;
    const onDown = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [notifOpen]);

  const initials = (profile?.full_name || user?.user_metadata?.full_name || user?.email || "U")
    .split(/\s+/)
    .map((p: string) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  // Role-based: admin sees ONLY admin nav, instructor sees ONLY instructor nav, student sees student nav.
  const navItems: NavItem[] = isAdmin ? adminItems : isInstructor ? instructorItems : studentItems;
  const roleLabel = isAdmin ? "Admin" : isInstructor ? "Instructor" : "Student";
  const isStudent = !isAdmin && !isInstructor;

  const exactMatch = (to: string) => to === "/dashboard" || to === "/admin" || to === "/instructor";
  // Pick the longest matching nav item so deeper routes (e.g. /dashboard/courses) win over /dashboard.
  const current = [...navItems]
    .sort((a, b) => b.to.length - a.to.length)
    .find((it) =>
      exactMatch(it.to) ? path === it.to : path === it.to || path.startsWith(it.to + "/"),
    );
  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const renderSidebar = (isMobile: boolean) => {
    const isCollapsed = !isMobile && canCollapse && collapsed;
    return (
      <div
        className="h-full flex flex-col text-mint"
        style={{ background: "var(--gradient-forest)" }}
      >
        <div
          className={`${isCollapsed ? "px-3" : "px-6"} pt-6 pb-7 border-b border-mint/15 relative`}
        >
          <div
            className={`flex ${isCollapsed ? "justify-center" : "items-start justify-between gap-2"}`}
          >
            <Link to="/" onClick={() => setOpen(false)} aria-label="Evogue Academy home">
              <Logo variant="light" className={isCollapsed ? "h-9 w-auto" : "h-16 w-auto"} />
            </Link>
            {!isMobile && canCollapse && !isCollapsed && (
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
                className="h-8 w-8 grid place-items-center rounded-lg text-mint/70 hover:bg-mint/10 hover:text-mint transition"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            )}
          </div>
          {!isCollapsed && (
            <div className="mt-5">
              {isStudent ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 ring-2 ring-mint/40">
                    <AvatarImage src={avatarUrl} alt="" />
                    <AvatarFallback className="bg-mint text-forest font-bold text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-white truncate">{displayName}</p>
                    {profile?.registration_number ? (
                      <p className="text-[11px] font-mono tracking-wider text-mint truncate">
                        {profile.registration_number}
                      </p>
                    ) : (
                      <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-mint mt-0.5">
                        Student
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-[14px] font-semibold text-white truncate">{displayName}</p>
                  <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-mint mt-0.5">
                    {roleLabel}
                  </p>
                </>
              )}
            </div>
          )}
          {!isMobile && canCollapse && isCollapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="mt-3 mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-mint/70 hover:bg-mint/10 hover:text-mint transition"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}
        </div>
        <nav
          className={`sidebar-scroll flex-1 ${isCollapsed ? "px-2" : "px-3"} py-4 space-y-1 overflow-y-auto`}
        >
          {navItems.map((it) => {
            const active = exactMatch(it.to) ? path === it.to : path.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to as "/dashboard"}
                onClick={() => setOpen(false)}
                title={isCollapsed ? it.label : undefined}
                aria-current={active ? "page" : undefined}
                className={`group relative flex items-center ${isCollapsed ? "justify-center px-0" : "gap-3 px-5"} rounded-xl py-3 text-sm font-semibold transition-all ${
                  active
                    ? "bg-mint/15 text-mint shadow-[inset_3px_0_0_0_var(--mint)]"
                    : "text-mint/75 hover:bg-mint/10 hover:text-mint"
                }`}
              >
                <it.icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{it.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className={`${isCollapsed ? "px-2" : "px-3"} py-4 border-t border-mint/15 space-y-1`}>
          {!isCollapsed && (
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-5 py-2.5 text-xs font-semibold text-mint/45 hover:bg-mint/5 hover:text-mint/70 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to site
            </Link>
          )}
          <button
            onClick={() => signOut()}
            title={isCollapsed ? "Logout" : undefined}
            className={`w-full flex items-center ${isCollapsed ? "justify-center px-0" : "gap-3 px-5"} rounded-xl py-3 text-sm font-semibold text-mint/80 hover:bg-mint/10 hover:text-mint transition`}
          >
            <LogOut className="h-4 w-4" /> {!isCollapsed && "Logout"}
          </button>
        </div>
      </div>
    );
  };

  // Mobile bottom nav: students see student tabs; admin/instructor users keep using the hamburger sheet for their portals.
  const showStudentBottomNav = !isAdmin && !isInstructor;
  const desktopAsideWidth = canCollapse && collapsed ? "w-[72px]" : "w-[260px]";

  return (
    <div className="min-h-screen bg-mint-tint flex">
      <aside
        className={`hidden lg:block ${desktopAsideWidth} shrink-0 sticky top-0 h-screen transition-[width] duration-200`}
      >
        {renderSidebar(false)}
      </aside>

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
                {renderSidebar(true)}
              </SheetContent>
            </Sheet>
            <div className="lg:hidden min-w-0">
              <Link to="/" aria-label="Evogue Academy home">
                <Logo />
              </Link>
            </div>
            <div className="hidden lg:flex flex-col min-w-0">
              <h1 className="font-display text-lg font-bold text-forest truncate leading-tight">
                {current?.label ?? "Dashboard"}
              </h1>
              {isStudent && <p className="text-[11px] text-foreground/55 truncate">{todayStr}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isAdmin && (
              <Button
                asChild
                variant="ghost"
                className="hidden sm:inline-flex rounded-full text-sm"
              >
                <Link to="/courses">Browse courses</Link>
              </Button>
            )}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => setNotifOpen((v) => !v)}
                className="relative h-11 w-11 grid place-items-center rounded-full hover:bg-mint/15 transition"
              >
                <Bell className="h-5 w-5 text-forest" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-mint text-forest text-[10px] font-extrabold ring-2 ring-background">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div
                  className="fixed left-4 right-4 top-[72px] sm:absolute sm:right-0 sm:left-auto sm:top-[52px] sm:w-[320px] max-h-[calc(100vh-96px)] sm:max-h-[360px] overflow-hidden flex flex-col"
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    border: "1px solid rgba(10,46,26,0.08)",
                    boxShadow: "0 8px 32px rgba(10,46,26,0.12)",
                    zIndex: 100,
                  }}
                >
                  <div
                    className="flex items-center justify-between shrink-0"
                    style={{ padding: "16px 20px", borderBottom: "1px solid rgba(10,46,26,0.08)" }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#0A2E1A" }}>
                      Notifications
                    </span>
                    <button
                      type="button"
                      onClick={markAllRead}
                      style={{
                        fontSize: "12px",
                        color: "#1A8C4E",
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                      }}
                    >
                      Mark all as read
                    </button>
                  </div>
                  {notifications.length === 0 || unreadCount === 0 ? (
                    <div
                      className="flex-1 flex flex-col items-center justify-center"
                      style={{ padding: "40px 20px", textAlign: "center" }}
                    >
                      <div
                        className="mx-auto grid place-items-center mb-4"
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "16px",
                          background: "#EDF7F0",
                        }}
                      >
                        <Bell className="h-6 w-6" style={{ color: "#1A8C4E" }} />
                      </div>
                      <p style={{ fontSize: "15px", fontWeight: 600, color: "#0A2E1A" }}>
                        {notifications.length === 0
                          ? "No notifications yet"
                          : "You're all caught up"}
                      </p>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "rgba(10,46,26,0.45)",
                          lineHeight: 1.6,
                          marginTop: "6px",
                        }}
                      >
                        {notifications.length === 0
                          ? "We'll notify you about classes, announcements and certificate updates."
                          : "Check back later for new classes, announcements and certificates."}
                      </p>
                    </div>
                  ) : (
                    <ul className="overflow-y-auto">
                      {notifications.map((n) => {
                        const Icon =
                          n.type === "class"
                            ? Video
                            : n.type === "announcement"
                              ? Megaphone
                              : n.type === "application"
                                ? ClipboardCheck
                                : n.type === "payment"
                                  ? Wallet
                                  : Award;
                        return (
                          <li
                            key={n.id}
                            onClick={() => {
                              markOneRead(n.id);
                              if (n.to) {
                                setNotifOpen(false);
                                window.location.assign(n.to);
                              }
                            }}
                            className="hover:bg-[rgba(10,46,26,0.03)]"
                            style={{
                              padding: "14px 20px",
                              borderBottom: "1px solid rgba(10,46,26,0.06)",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "12px",
                              cursor: "pointer",
                              transition: "background 0.15s",
                            }}
                          >
                            <div style={{ position: "relative" }}>
                              <span
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  background: "#EDF7F0",
                                  color: "#1A8C4E",
                                  display: "grid",
                                  placeItems: "center",
                                }}
                              >
                                <Icon style={{ fontSize: "16px" }} className="h-4 w-4" />
                              </span>
                              {!n.read && (
                                <span
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    background: "#00F5A0",
                                  }}
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p style={{ fontSize: "13px", fontWeight: 600, color: "#0A2E1A" }}>
                                {n.title}
                              </p>
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: "rgba(10,46,26,0.55)",
                                  lineHeight: 1.5,
                                }}
                              >
                                {n.body}
                              </p>
                              <p
                                style={{
                                  fontSize: "11px",
                                  color: "rgba(10,46,26,0.35)",
                                  marginTop: "3px",
                                }}
                              >
                                {n.time}
                              </p>
                            </div>
                            {!n.read && (
                              <span
                                className="shrink-0 self-center"
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  color: "#1A8C4E",
                                  background: "#EDF7F0",
                                  padding: "2px 8px",
                                  borderRadius: "6px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.04em",
                                }}
                              >
                                New
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded-full ring-2 ring-transparent hover:ring-secondary/40 transition h-11 w-11 grid place-items-center"
                  aria-label="Account menu"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt="" />
                    <AvatarFallback className="bg-forest text-mint font-bold text-sm">
                      {initials}
                    </AvatarFallback>
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

        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 min-w-0 ${showStudentBottomNav ? "pb-24 lg:pb-8" : ""}`}
        >
          {children}
        </main>

        {showStudentBottomNav && (
          <nav
            className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            aria-label="Primary"
          >
            <ul className="grid grid-cols-5">
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
