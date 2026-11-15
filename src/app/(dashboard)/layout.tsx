"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useSidebar } from "@/hooks/useSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const { mobileOpen, setMobileOpen } = useSidebar();

  const checkingSession = status !== "authenticated";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onOpenMobileNav={() => setMobileOpen(true)} />
        <main className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
          {checkingSession ? (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-50"
              role="status"
              aria-label="Checking session"
            >
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
              <p className="text-sm text-slate-500">Checking your session…</p>
            </div>
          ) : null}
        </main>
        <footer className="px-6 pb-6 text-center text-xs text-slate-400">
          Care Guide · Doctor Tracker administrative portal
        </footer>
      </div>
    </div>
  );
}
