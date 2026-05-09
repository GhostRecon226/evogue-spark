import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading } = useAuth();

  // While the Supabase session is still hydrating from storage, render a
  // calm loading screen instead of flashing the dashboard or bouncing to
  // /login (the source of the race condition on hard refresh).
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
