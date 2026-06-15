import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardGate,
});

function DashboardGate() {
  const { isAdmin, isInstructor, loading } = useAuth();
  if (loading) return null;
  if (isAdmin) return <Navigate to="/admin" replace />;
  if (isInstructor) return <Navigate to="/instructor" replace />;
  return <Outlet />;
}
