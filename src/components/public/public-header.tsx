"use client";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  Menu,
  Search,
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


const navigation = [
  {
    label: "Home",
    href: "/",
  },

  {
    label: "Services",
    href: "/services",
  },

  {
    label: "Track Request",
    href: "/track",
  },

  {
    label: "Contact",
    href: "/contact",
  },
];


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


      async function loadCompanyName() {
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
              .shortName,
          );
        } catch {
          // Keep the safe display fallback.
        }
      }


      loadCompanyName();


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

        {/* BRAND */}

        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="relative h-11 w-11 overflow-hidden rounded-xl border bg-white">
            <Image
              src="/seekersconnect-logo.jpg"
              alt={companyName}
              fill
              className="object-contain p-1"
              priority
            />
          </div>


          <div className="hidden sm:block">
            <p className="text-[15px] font-semibold leading-tight text-slate-950">
              {
                companyName
              }
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Academic Request Services
            </p>
          </div>
        </Link>


        {/* DESKTOP NAVIGATION */}

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


        {/* DESKTOP ACTIONS */}

        <div className="hidden items-center gap-2 lg:flex">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>


          <Link
            href="/track"
            className={buttonVariants({
              variant:
                "outline",

              className:
                "rounded-xl",
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
            Start a Request
          </Link>
        </div>


        {/* MOBILE */}

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


              <div className="mt-8 flex flex-col gap-2">
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
                      className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      {
                        item.label
                      }
                    </Link>
                  ),
                )}


                <Link
                  href="/request"
                  className={buttonVariants({
                    className:
                      "mt-4 rounded-xl bg-blue-600 hover:bg-blue-700",
                  })}
                >
                  Start a Request
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}