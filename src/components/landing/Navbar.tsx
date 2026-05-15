import { useEffect, useState } from "react";
import { Menu, LayoutDashboard, LogOut, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";

const links = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Courses", to: "/courses" },
  { label: "Scholarship", to: "/scholarship" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initials = (user?.user_metadata?.full_name || user?.email || "U")
    .split(/\s+/)
    .map((p: string) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-background border-b border-border/60 transition-shadow ${
        scrolled ? "shadow-[0_2px_12px_rgba(0,0,0,0.08)]" : ""
      }`}
    >
      <div className="mx-auto flex h-20 md:h-24 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Evogue Academy home">
          <Logo />
        </Link>

        <div className="hidden md:flex items-center gap-7 ml-auto">
          <nav className="flex items-center gap-7">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="relative text-sm font-medium text-foreground/80 transition-colors hover:text-secondary data-[status=active]:text-secondary data-[status=active]:after:absolute data-[status=active]:after:left-0 data-[status=active]:after:right-0 data-[status=active]:after:-bottom-1.5 data-[status=active]:after:h-0.5 data-[status=active]:after:rounded-full data-[status=active]:after:bg-secondary"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
          {loading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full ring-2 ring-transparent hover:ring-secondary/40 transition">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt="" />
                    <AvatarFallback className="bg-[#00F5A0] text-[#0A2E1A] font-bold">{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
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
          ) : (
            <Button asChild className="h-10 rounded-full bg-[#0A2E1A] px-5 text-sm font-semibold text-white hover:bg-[#0A2E1A]/90">
              <Link to="/login">Login</Link>
            </Button>
          )}
          </div>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85%] max-w-sm">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="mt-2 flex flex-col gap-1">
              <Logo />
              <nav className="mt-8 flex flex-col items-end gap-1">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    activeOptions={{ exact: l.to === "/" }}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-accent data-[status=active]:bg-secondary/10 data-[status=active]:text-secondary"
                  >
                    {l.label}
                  </Link>
                ))}
                {user && (
                  <>
                    <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-accent data-[status=active]:bg-secondary/10 data-[status=active]:text-secondary">
                      Dashboard
                    </Link>
                    <button
                      onClick={async () => { setOpen(false); await signOut(); }}
                      className="text-right rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-accent"
                    >
                      Logout
                    </button>
                  </>
                )}
              </nav>
              {!loading && !user && (
                <Button asChild className="mt-6 h-11 w-full rounded-full bg-secondary text-forest hover:bg-secondary/90 text-sm font-semibold">
                  <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
