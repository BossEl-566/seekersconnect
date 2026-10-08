"use client";

import Image from "next/image";
import Link from "next/link";
import {
  usePathname,
} from "next/navigation";

import {
  BarChart3,
  Building2,
  FileCheck2,
  FileText,
  LayoutDashboard,
  PackageCheck,
  ReceiptText,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import type {
  AdminRole,
} from "@/lib/auth/admin";


// =========================================================
// OPERATIONS NAVIGATION
// =========================================================

const operationsNavigation = [
  {
    label:
      "Overview",

    href:
      "/admin",

    icon:
      LayoutDashboard,
  },

  {
    label:
      "Requests",

    href:
      "/admin/requests",

    icon:
      FileText,
  },

  {
    label:
      "Payments",

    href:
      "/admin/payments",

    icon:
      ReceiptText,
  },

  {
    label:
      "Documents",

    href:
      "/admin/documents",

    icon:
      FileCheck2,
  },

  {
    label:
      "Deliveries",

    href:
      "/admin/deliveries",

    icon:
      PackageCheck,
  },
];


// =========================================================
// SUPER ADMIN NAVIGATION
// =========================================================

const superAdminNavigation = [
  {
    label:
      "Universities",

    href:
      "/admin/universities",

    icon:
      Building2,
  },

  {
    label:
      "Services",

    href:
      "/admin/services",

    icon:
      ShieldCheck,
  },

  {
    label:
      "Admins",

    href:
      "/admin/admins",

    icon:
      Users,
  },

  {
    label:
      "Reports",

    href:
      "/admin/reports",

    icon:
      BarChart3,
  },

  {
    label:
      "Settings",

    href:
      "/admin/settings",

    icon:
      Settings,
  },
];


// =========================================================
// SIDEBAR
// =========================================================

export function AdminSidebar({
  role,
}: {
  role:
    AdminRole;
}) {
  const pathname =
    usePathname();


  const navigation =
    role ===
    "SUPER_ADMIN"
      ? [
          ...operationsNavigation,
          ...superAdminNavigation,
        ]
      : operationsNavigation;


  // =======================================================
  // ACTIVE ROUTE CHECK
  //
  // /admin only highlights Overview.
  //
  // Other sections remain highlighted for child routes:
  //
  // /admin/requests
  // /admin/requests/[id]
  //
  // both highlight Requests.
  // =======================================================

  function isActive(
    href:
      string,
  ) {
    if (
      href ===
      "/admin"
    ) {
      return (
        pathname ===
        "/admin"
      );
    }


    return (
      pathname ===
        href ||
      pathname.startsWith(
        `${href}/`,
      )
    );
  }


  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      {/* ===============================================
          BRAND
      =============================================== */}

      <div className="flex h-20 items-center border-b border-slate-200 px-5">
        <Link
          href="/admin"
          className="flex items-center gap-3"
        >
          <div className="relative h-11 w-11 overflow-hidden rounded-xl border bg-white">
            <Image
              src="/seekersconnect-logo.jpg"
              alt="Seekers Connect 247"
              fill
              className="object-contain p-1"
            />
          </div>


          <div>
            <p className="text-sm font-semibold text-slate-950">
              Seekers Connect
            </p>

            <p className="text-xs text-slate-400">
              Admin Console
            </p>
          </div>
        </Link>
      </div>


      {/* ===============================================
          NAVIGATION
      =============================================== */}

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Operations
        </p>


        <div className="mt-2 space-y-1">
          {navigation.map(
            ({
              label,
              href,
              icon:
                Icon,
            }) => {
              const active =
                isActive(
                  href,
                );


              return (
                <Link
                  key={
                    href
                  }
                  href={
                    href
                  }
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  {/* Active indicator */}

                  {active && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" />
                  )}


                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      active
                        ? "text-blue-600"
                        : "text-slate-400"
                    }`}
                  />


                  <span>
                    {
                      label
                    }
                  </span>
                </Link>
              );
            },
          )}
        </div>
      </nav>


      {/* ===============================================
          ROLE
      =============================================== */}

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-700">
            {role ===
            "SUPER_ADMIN"
              ? "Super Administrator"
              : "Operations Administrator"}
          </p>


          <p className="mt-1 text-[11px] leading-4 text-slate-400">
            Seekers Connect 247
          </p>
        </div>
      </div>
      
    </aside>
  );
}