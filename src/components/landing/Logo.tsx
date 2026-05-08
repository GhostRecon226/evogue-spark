import { GraduationCap } from "lucide-react";

interface LogoProps {
  variant?: "dark" | "light";
}

/**
 * Brand mark. Replace this component's contents with the uploaded
 * Evogue logo image when it lands. The wordmark below is a placeholder.
 */
export function Logo({ variant = "dark" }: LogoProps) {
  const text = variant === "light" ? "text-background" : "text-forest";
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest text-mint shadow-soft">
        <GraduationCap className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <span className={`font-display text-xl font-extrabold tracking-tight ${text}`}>
        Evogue<span className="text-secondary">.</span>
      </span>
    </div>
  );
}
