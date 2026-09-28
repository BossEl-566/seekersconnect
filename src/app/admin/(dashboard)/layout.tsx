import {
  requireAdmin,
} from "@/lib/auth/admin";

import {
  AdminSidebar,
} from "@/components/admin/admin-sidebar";

import {
  AdminTopbar,
} from "@/components/admin/admin-topbar";

export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin =
    await requireAdmin();

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <AdminSidebar
        role={admin.role}
      />

      <AdminTopbar
        admin={admin}
      />

      <main className="lg:ml-64">
        <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}