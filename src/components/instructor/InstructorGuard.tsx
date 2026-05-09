import { useEffect, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";

export function InstructorGuard({ children }: { children: ReactNode }) {
  const { isInstructor, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isInstructor) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, isInstructor, navigate]);

  if (loading || !isInstructor) {
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
