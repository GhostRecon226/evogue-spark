import { Link } from "@tanstack/react-router";
import { forwardRef, type ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

type Props = Omit<ButtonProps, "asChild"> & {
  children: ReactNode;
  onNavigate?: () => void;
};

/**
 * Enroll CTA — sends authenticated users to /dashboard, others to /contact (inquiry form).
 * Self-registration is intentionally disabled — students receive credentials via email
 * after admin creates their account.
 */
export const EnrollButton = forwardRef<HTMLButtonElement, Props>(
  ({ children, onNavigate, ...buttonProps }, ref) => {
    const { user, loading } = useAuth();
    const to = user ? "/dashboard" : "/contact";
    return (
      <Button ref={ref} asChild disabled={loading} {...buttonProps}>
        <Link to={to} onClick={onNavigate}>{children}</Link>
      </Button>
    );
  },
);
EnrollButton.displayName = "EnrollButton";
