import Image from "next/image";
import Link from "next/link";

import {
  BookOpen,
  FileText,
  Mail,
  MessageCircle,
  Package,
  PackageCheck,
  Phone,
  ShoppingBasket,
} from "lucide-react";

import {
  getSystemSettings,
} from "@/lib/settings/system-settings";


// =========================================================
// FOOTER
// =========================================================

export async function PublicFooter() {
  const settings =
    await getSystemSettings();


  const {
    company,
    support,
  } =
    settings;


  const primaryPhone =
    support.phones[0] ??
    "";


  const email =
    support.supportEmail ||
    company.email;


  const whatsappDigits =
    company.whatsapp.replace(
      /\D/g,
      "",
    );


  const whatsappNumber =
    whatsappDigits.startsWith(
      "0",
    )
      ? `233${whatsappDigits.slice(
          1,
        )}`
      : whatsappDigits;


  return (
    <footer className="border-t border-slate-200 bg-white">
      {/* =================================================
          MAIN FOOTER
      ================================================= */}

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1fr_1fr]">
          {/* =============================================
              BRAND
          ============================================= */}

          <div>
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <Image
                  src="/seekersconnect-logo.jpg"
                  alt={`${company.shortName} logo`}
                  fill
                  className="object-contain p-1"
                />
              </div>


              <div>
                <p className="font-semibold text-slate-950">
                  {
                    company.shortName
                  }
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Errands • Delivery • Documents
                </p>
              </div>
            </div>


            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">
              Helping customers handle everyday errands, pickups,
              deliveries, shopping requests and document services
              from one convenient platform.
            </p>


            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "Errands",
                "Delivery",
                "Shopping",
                "Documents",
              ].map(
                (
                  item,
                ) => (
                  <span
                    key={
                      item
                    }
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-600"
                  >
                    {
                      item
                    }
                  </span>
                ),
              )}
            </div>
          </div>


          {/* =============================================
              QUICK LINKS
          ============================================= */}

          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Quick Links
            </h3>


            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
              <Link
                href="/"
                className="transition hover:text-blue-600"
              >
                Home
              </Link>


              <Link
                href="/services"
                className="transition hover:text-blue-600"
              >
                Services
              </Link>


              <Link
                href="/request"
                className="transition hover:text-blue-600"
              >
                Request a Service
              </Link>


              <Link
                href="/track"
                className="transition hover:text-blue-600"
              >
                Track Request
              </Link>


              <Link
                href="/contact"
                className="transition hover:text-blue-600"
              >
                Contact Us
              </Link>
            </div>
          </div>


          {/* =============================================
              SERVICES
          ============================================= */}

          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Services
            </h3>


            <div className="mt-4 space-y-3">
              <FooterService
                icon={
                  Package
                }
                label="Run an Errand"
              />

              <FooterService
                icon={
                  PackageCheck
                }
                label="Pickup & Delivery"
              />

              <FooterService
                icon={
                  ShoppingBasket
                }
                label="Shop For Me"
              />

              <FooterService
                icon={
                  FileText
                }
                label="Document Services"
              />

              <FooterService
                icon={
                  BookOpen
                }
                label="Academic Documents"
              />
            </div>
          </div>


          {/* =============================================
              CONTACT
          ============================================= */}

          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Contact
            </h3>


            <div className="mt-4 space-y-4 text-sm text-slate-500">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex gap-3 transition hover:text-blue-600"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                  <span className="break-all">
                    {
                      email
                    }
                  </span>
                </a>
              )}


              {primaryPhone && (
                <a
                  href={`tel:${primaryPhone}`}
                  className="flex gap-3 transition hover:text-blue-600"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                  <span>
                    {
                      primaryPhone
                    }
                  </span>
                </a>
              )}


              {company.whatsapp && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex gap-3 transition hover:text-emerald-600"
                >
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                  <div>
                    <span>
                      {
                        company.whatsapp
                      }
                    </span>

                    <p className="mt-0.5 text-xs text-slate-400">
                      WhatsApp support
                    </p>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>


        {/* =================================================
            BOTTOM
        ================================================= */}

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            ©{" "}
            {new Date().getFullYear()}{" "}
            {
              company.name
            }. All rights reserved.
          </p>


          <p>
            Errands, delivery, shopping and document services.
          </p>
        </div>
      </div>
    </footer>
  );
}


// =========================================================
// FOOTER SERVICE
// =========================================================

function FooterService({
  icon:
    Icon,

  label,
}: {
  icon:
    React.ElementType;

  label:
    string;
}) {
  return (
    <Link
      href="/services"
      className="flex items-center gap-3 text-sm text-slate-500 transition hover:text-blue-600"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon className="h-3.5 w-3.5" />
      </div>

      {
        label
      }
    </Link>
  );
}