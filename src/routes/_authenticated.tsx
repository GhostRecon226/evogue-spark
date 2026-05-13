import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, profile, loading, signOut } = useAuth();

  // If the profile shows the account is suspended, sign out and bounce to login.
  useEffect(() => {
    if (!loading && user && profile && profile.is_active === false) {
      toast.error("Your account has been suspended. Please contact Evogue Academy for support.");
      void signOut();
    }
  }, [loading, user, profile, signOut]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-mint-tint">
        <div className="flex flex-col items-center gap-3 text-forest">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm font-medium text-foreground/60">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        search={{ redirect: window.location.pathname + window.location.search } as never}
        replace
      />
    );
  }

  return <Outlet />;
}
