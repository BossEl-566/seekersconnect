"use client";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  Menu,
  Package,
} from "lucide-react";

import {
  Button,
  buttonVariants,
} from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import type {
  SystemSettings,
} from "@/lib/validation/system-settings";


// =========================================================
// NAVIGATION
// =========================================================

const navigation = [
  {
    label:
      "Home",

    href:
      "/",
  },

  {
    label:
      "Services",

    href:
      "/services",
  },

  {
    label:
      "Track Request",

    href:
      "/track",
  },

  {
    label:
      "Contact",

    href:
      "/contact",
  },
];


// =========================================================
// PUBLIC HEADER
// =========================================================

export function PublicHeader() {
  const [
    companyName,
    setCompanyName,
  ] =
    useState(
      "Seekers Connect 247",
    );


  useEffect(
    () => {
      let cancelled =
        false;


      async function loadSettings() {
        try {
          const response =
            await fetch(
              "/api/public-settings",
              {
                cache:
                  "no-store",
              },
            );


          const result =
            (await response.json()) as {
              success?:
                boolean;

              settings?:
                SystemSettings;
            };


          if (
            cancelled ||
            !response.ok ||
            !result.success ||
            !result.settings
          ) {
            return;
          }


          setCompanyName(
            result.settings
              .company
              .shortName ||
              result.settings
                .company
                .name ||
              "Seekers Connect 247",
          );
        } catch {
          // Keep safe fallback.
        }
      }


      loadSettings();


      return () => {
        cancelled =
          true;
      };
    },
    [],
  );


  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ===============================================
            BRAND
        =============================================== */}

        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
        >
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <Image
              src="/seekersconnect-logo.jpg"
              alt={`${companyName} logo`}
              fill
              priority
              className="object-contain p-1"
            />
          </div>


          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-[15px] font-semibold leading-tight text-slate-950">
              {
                companyName
              }
            </p>


            <p className="mt-0.5 text-xs text-slate-500">
              Errands • Delivery • Documents
            </p>
          </div>
        </Link>


        {/* ===============================================
            DESKTOP NAVIGATION
        =============================================== */}

        <nav className="hidden items-center gap-1 lg:flex">
          {navigation.map(
            (
              item,
            ) => (
              <Link
                key={
                  item.href
                }
                href={
                  item.href
                }
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                {
                  item.label
                }
              </Link>
            ),
          )}
        </nav>


        {/* ===============================================
            DESKTOP ACTIONS
        =============================================== */}

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/track"
            className={buttonVariants({
              variant:
                "outline",

              className:
                "rounded-xl bg-white",
            })}
          >
            Track Request
          </Link>


          <Link
            href="/request"
            className={buttonVariants({
              className:
                "rounded-xl bg-blue-600 px-5 text-white hover:bg-blue-700",
            })}
          >
            <Package className="mr-2 h-4 w-4" />

            Request a Service
          </Link>
        </div>


        {/* ===============================================
            MOBILE MENU
        =============================================== */}

        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl"
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>


            <SheetContent>
              <SheetHeader>
                <SheetTitle>
                  {
                    companyName
                  }
                </SheetTitle>
              </SheetHeader>


              <div className="mt-8">
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Package className="h-5 w-5" />
                  </div>


                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Need something handled?
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Errands, shopping, documents & delivery
                    </p>
                  </div>
                </div>


                <div className="flex flex-col gap-2">
                  {navigation.map(
                    (
                      item,
                    ) => (
                      <Link
                        key={
                          item.href
                        }
                        href={
                          item.href
                        }
                        className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        {
                          item.label
                        }
                      </Link>
                    ),
                  )}
                </div>


                <div className="mt-6 grid gap-3">
                  <Link
                    href="/request"
                    className={buttonVariants({
                      className:
                        "w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700",
                    })}
                  >
                    Request a Service
                  </Link>


                  <Link
                    href="/track"
                    className={buttonVariants({
                      variant:
                        "outline",

                      className:
                        "w-full rounded-xl",
                    })}
                  >
                    Track Request
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}