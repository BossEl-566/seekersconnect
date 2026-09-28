import {
  Bell,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import type {
  CurrentAdmin,
} from "@/lib/auth/admin";

import {
  logoutAdmin,
} from "@/app/admin/(dashboard)/actions";

export function AdminTopbar({
  admin,
}: {
  admin: CurrentAdmin;
}) {
  const initials =
    admin.fullName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:ml-64 lg:px-8">
      <div>
        <p className="text-xs text-slate-400">
          Seekers Connect 247
        </p>

        <p className="text-sm font-semibold text-slate-800">
          Operations Dashboard
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Button>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-xs font-semibold text-blue-700">
            {initials}
          </div>

          <div>
            <p className="max-w-36 truncate text-xs font-semibold text-slate-800">
              {admin.fullName}
            </p>

            <p className="text-[10px] text-slate-400">
              {admin.role ===
              "SUPER_ADMIN"
                ? "Super Admin"
                : "Operations Admin"}
            </p>
          </div>

          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>

        <form action={logoutAdmin}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="rounded-xl"
          >
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}