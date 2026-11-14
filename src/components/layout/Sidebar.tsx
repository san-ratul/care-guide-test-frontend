"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, Stethoscope, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Doctors", href: "/doctors", icon: Stethoscope },
  { name: "Patients", href: "/patients", icon: Users },
];

export const BRAND_NAME = "Care Guide";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
      {navigation.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-teal-600/15 text-teal-300"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
            )}
          >
            <item.icon
              className={cn("h-5 w-5 shrink-0", active ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300")}
              aria-hidden
            />
            {item.name}
            {active ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-teal-400" aria-hidden /> : null}
          </Link>
        );
      })}
    </nav>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5 px-5 pt-5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400">
        <Activity className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-bold tracking-tight text-white">{BRAND_NAME}</p>
        <p className="text-[11px] text-slate-400">Doctor Tracker</p>
      </div>
    </div>
  );
}

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-slate-900 lg:flex print:hidden">
        <BrandMark />
        <NavLinks />
        <div className="border-t border-white/5 px-5 py-4">
          <p className="text-[11px] leading-4 text-slate-500">
            Administrative portal for doctors and their patients.
          </p>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-slate-900 shadow-xl">
            <div className="flex items-center justify-between pr-3">
              <BrandMark />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <NavLinks onNavigate={onClose} />
          </div>
        </div>
      ) : null}
    </>
  );
}
