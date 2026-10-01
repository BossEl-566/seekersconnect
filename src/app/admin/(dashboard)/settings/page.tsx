import {
  Settings,
} from "lucide-react";

import {
  requireSuperAdmin,
} from "@/lib/auth/admin";

import {
  getSystemSettings,
} from "@/lib/settings/system-settings";

import {
  SystemSettingsManager,
} from "@/components/admin/system-settings-manager";


export default async function SettingsPage() {
  await requireSuperAdmin();


  const settings =
    await getSystemSettings();


  return (
    <>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Settings className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-medium text-blue-600">
            Super Admin
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
            System Settings
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage company information, payment details, customer
            support contacts and request workflow notices.
          </p>
        </div>
      </div>


      <div className="mt-7 max-w-5xl">
        <SystemSettingsManager
          initialSettings={
            settings
          }
        />
      </div>
    </>
  );
}