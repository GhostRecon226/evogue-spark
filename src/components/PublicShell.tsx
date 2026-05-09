import type { ReactNode } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Toaster } from "@/components/ui/sonner";

export function PublicShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-1 pt-20 md:pt-24 ${className}`}>{children}</main>
      <Footer />
      <Toaster richColors position="top-center" />
    </div>
  );
}
