import logoUrl from "@/assets/logo.png";

interface LogoProps {
  variant?: "dark" | "light";
  className?: string;
}

export function Logo({ variant = "dark", className }: LogoProps) {
  return (
    <div className="flex items-center">
      <img
        src={logoUrl}
        alt="Evogue Academy"
        className={`${className ?? "h-16 md:h-20 w-auto"} ${variant === "light" ? "brightness-0 invert" : ""}`}
      />
    </div>
  );
}
