"use client";

import { useState } from "react";
import { LogOut, Menu } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function Topbar({ onOpenMobileNav }: { onOpenMobileNav: () => void }) {
  const { user, logout } = useAuth();
  const [confirming, setConfirming] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur print:hidden">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileNav}
            aria-label="Open navigation menu"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <p className="hidden text-sm text-slate-500 sm:block">
            Welcome back, <span className="font-semibold text-slate-800">{user?.name ?? "Admin"}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 sm:flex">
            <Avatar name={user?.name ?? "Admin"} className="h-7 w-7 text-[10px]" />
            <div className="leading-tight">
              <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
              <p className="text-[10px] text-slate-500">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setConfirming(true)} aria-label="Log out">
            <LogOut className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={async () => {
          setConfirming(false);
          await logout();
        }}
        title="Log out"
        message="You will be returned to the login screen. Your session tokens will be revoked on the server."
        confirmLabel="Log out"
        loading={false}
      />
    </header>
  );
}
