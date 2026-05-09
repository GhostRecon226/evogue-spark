import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, isAdmin, navigate]);

  if (loading || !isAdmin) {
    return (
      <DashboardLayout>
        <div className="grid place-items-center py-20 text-foreground/50">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}
