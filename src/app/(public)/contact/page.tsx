import type {
  Metadata,
} from "next";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Clock3,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";

import {
  getSystemSettings,
} from "@/lib/settings/system-settings";


// =========================================================
// METADATA
// =========================================================

export const metadata:
  Metadata =
{
  title:
    "Contact | Seekers Connect 247",

  description:
    "Contact Seekers Connect 247 for help with services, requests, payments, tracking, documents and delivery.",
};


// =========================================================
// WHATSAPP
// =========================================================

function whatsappLink(
  value:
    string,
) {
  const cleaned =
    value.replace(
      /\D/g,
      "",
    );


  if (
    cleaned.startsWith(
      "0",
    )
  ) {
    return `https://wa.me/233${cleaned.slice(
      1,
    )}`;
  }


  return `https://wa.me/${cleaned}`;
}


// =========================================================
// PAGE
// =========================================================

export default async function ContactPage() {
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


  return (
    <>
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-[100px]" />

          <div className="absolute -bottom-32 left-1/4 h-[360px] w-[360px] rounded-full bg-sky-500/10 blur-[100px]" />
        </div>


        <div className="relative mx-auto grid max-w-[1440px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8 lg:py-16">
          {/* ===============================================
              HERO COPY
          =============================================== */}

          <div>
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
              <span className="h-px w-8 bg-blue-400" />

              Customer Support
            </div>


            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-[60px]">
              Need help?

              <span className="block text-slate-400">
                We are here to assist.
              </span>
            </h1>


            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400">
              Contact {company.shortName} for help with a service,
              payment verification, an existing request, document
              submission, tracking, quotations or delivery.
            </p>


            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={
                  whatsappLink(
                    company.whatsapp,
                  )
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                <MessageCircle className="mr-2 h-4 w-4" />

                Chat on WhatsApp
              </a>


              {primaryPhone && (
                <a
                  href={`tel:${primaryPhone}`}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-6 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <Phone className="mr-2 h-4 w-4" />

                  Call Support
                </a>
              )}
            </div>
          </div>


          {/* ===============================================
              HERO IMAGE
          =============================================== */}

          <div className="relative">
            <div className="relative min-h-[410px] overflow-hidden rounded-[30px] border border-white/10 bg-slate-900 shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
              <Image
                src="/office-of-seekers.jpg"
                alt="Seekers Connect customer support office"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 680px"
                className="object-cover"
              />


              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/15 to-transparent" />


              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">
                <div className="max-w-md rounded-2xl border border-white/15 bg-slate-950/55 p-5 backdrop-blur-md">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">
                    Real customer support
                  </p>


                  <h2 className="mt-2 text-xl font-semibold text-white">
                    Talk to our team when you need assistance.
                  </h2>


                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    We can help you understand service requirements,
                    follow up on a request or choose the right next
                    step.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          SUPPORT SUMMARY
      =================================================== */}

      <section className="relative -mt-6 z-10">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:grid-cols-3">
            <SupportSummaryRow
              label="WhatsApp"
              value={
                company.whatsapp
              }
              href={
                whatsappLink(
                  company.whatsapp,
                )
              }
            />


            <SupportSummaryRow
              label="Support Email"
              value={
                support.supportEmail
              }
              href={`mailto:${support.supportEmail}`}
            />


            {primaryPhone && (
              <SupportSummaryRow
                label="Primary Support"
                value={
                  primaryPhone
                }
                href={`tel:${primaryPhone}`}
              />
            )}
          </div>
        </div>
      </section>


      {/* ===================================================
          CONTACT OPTIONS
      =================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Contact Options
              </p>


              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
                Reach us in the way that works best for you.
              </h2>


              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
                If you are contacting us about an existing request,
                include your request number or tracking number so our
                team can assist you faster.
              </p>


              <div className="mt-7 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                <p className="text-xs leading-6 text-emerald-900">
                  Never send your bank PIN, MoMo PIN, mandate PIN,
                  password, OTP or any authentication secret to
                  Seekers Connect.
                </p>
              </div>
            </div>


            <div className="grid gap-4 md:grid-cols-2">
              <ContactMethod
                icon={
                  MessageCircle
                }
                title="WhatsApp Support"
                description="Best for quick questions, service enquiries and request assistance."
                value={
                  company.whatsapp
                }
                href={
                  whatsappLink(
                    company.whatsapp,
                  )
                }
                action="Open WhatsApp"
              />


              <ContactMethod
                icon={
                  Mail
                }
                title="Email Support"
                description="Best for detailed enquiries and information relating to an existing request."
                value={
                  support.supportEmail
                }
                href={`mailto:${support.supportEmail}`}
                action="Send Email"
              />


              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-blue-600">
                  <MapPin className="h-5 w-5" />
                </div>


                <h3 className="mt-6 text-lg font-semibold text-slate-950">
                  Location
                </h3>


                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Seekers Connect 247 Enterprise
                </p>


                <p className="mt-5 text-sm font-semibold text-slate-900">
                  University of Cape Coast, Ghana
                </p>
              </div>


              <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-6 text-white">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                  <Clock3 className="h-5 w-5" />
                </div>


                <h3 className="mt-6 text-lg font-semibold">
                  Already Submitted?
                </h3>


                <p className="mt-2 text-sm leading-6 text-slate-400">
                  You may be able to see the latest status immediately
                  without contacting support.
                </p>


                <Link
                  href="/track"
                  className="mt-5 inline-flex items-center text-sm font-semibold text-blue-300"
                >
                  Track your request

                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          SUPPORT LINES
      =================================================== */}

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white">
            <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
              <div className="border-b border-slate-200 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Headphones className="h-5 w-5" />
                </div>


                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                  Customer Support Lines
                </h2>


                <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
                  Call if you need help understanding a service,
                  completing a request, verifying payment information
                  or following up on an existing case.
                </p>
              </div>


              <div className="p-6 sm:p-8">
                <div className="grid gap-3 sm:grid-cols-2">
                  {support.phones.map(
                    (
                      phone,
                      index,
                    ) => (
                      <a
                        key={
                          phone
                        }
                        href={`tel:${phone}`}
                        className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-5 transition hover:border-blue-300 hover:bg-blue-50/40"
                      >
                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            {index ===
                            0
                              ? "Primary support"
                              : `Support line ${index + 1}`}
                          </p>


                          <p className="mt-1 font-semibold text-slate-900">
                            {
                              phone
                            }
                          </p>
                        </div>


                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-hover:bg-blue-600 group-hover:text-white">
                          <Phone className="h-4 w-4" />
                        </div>
                      </a>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          HELP ROUTES + SECOND IMAGE
      =================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr]">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Before You Contact Support
              </p>


              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950">
                You may already have what you need.
              </h2>


              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
                Use the shortcuts below for common customer actions.
                This can often be faster than waiting for a response.
              </p>


              <div className="mt-8 overflow-hidden rounded-[26px] border border-slate-200">
                <SupportRoute
                  number="01"
                  title="Looking for a service?"
                  description="Browse all available services including loans, study abroad, printing, legal services, applications, academic documents, errands and delivery."
                  href="/services"
                  action="Browse Services"
                />


                <SupportRoute
                  number="02"
                  title="Ready to submit?"
                  description="Start the request wizard and provide the details required for your selected service."
                  href="/request"
                  action="Start Request"
                />


                <SupportRoute
                  number="03"
                  title="Following an existing request?"
                  description="Use your tracking number and six-digit PIN to see the latest public update."
                  href="/track"
                  action="Track Request"
                />
              </div>
            </div>


            {/* =============================================
                SECOND IMAGE
            ============================================= */}

            <div className="relative min-h-[480px] overflow-hidden rounded-[28px] bg-slate-100">
              <Image
                src="/company-official-flier.jpg"
                alt="Seekers Connect 247 Enterprise"
                fill
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover"
              />


              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />


              <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-200">
                  Seekers Connect 247
                </p>


                <h3 className="mt-2 text-2xl font-semibold">
                  One team for many different needs.
                </h3>


                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
                  Academic services, applications, errands, document
                  support, delivery and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          GENERAL ENQUIRIES
      =================================================== */}

      <section className="bg-[#f5f8ff]">
        <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 rounded-[28px] border border-blue-100 bg-white p-6 shadow-sm sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-2xl items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Mail className="h-5 w-5" />
              </div>


              <div>
                <p className="font-semibold text-slate-950">
                  General business enquiries
                </p>


                <p className="mt-2 text-sm leading-6 text-slate-500">
                  For partnerships, business enquiries or matters not
                  connected to a specific request, use the company
                  email address.
                </p>
              </div>
            </div>


            <a
              href={`mailto:${company.email}`}
              className="inline-flex min-h-12 items-center justify-center break-all rounded-xl border border-slate-200 bg-slate-50 px-5 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
            >
              {
                company.email
              }
            </a>
          </div>
        </div>
      </section>
    </>
  );
}


// =========================================================
// SUPPORT SUMMARY
// =========================================================

function SupportSummaryRow({
  label,
  value,
  href,
}: {
  label:
    string;

  value:
    string;

  href:
    string;
}) {
  const external =
    href.startsWith(
      "http",
    );


  return (
    <a
      href={
        href
      }
      target={
        external
          ? "_blank"
          : undefined
      }
      rel={
        external
          ? "noreferrer"
          : undefined
      }
      className="group flex min-w-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
    >
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          {
            label
          }
        </p>


        <p className="mt-1 truncate text-sm font-semibold text-slate-900">
          {
            value
          }
        </p>
      </div>


      <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
    </a>
  );
}


// =========================================================
// CONTACT METHOD
// =========================================================

function ContactMethod({
  icon:
    Icon,
  title,
  description,
  value,
  href,
  action,
}: {
  icon:
    typeof Mail;

  title:
    string;

  description:
    string;

  value:
    string;

  href:
    string;

  action:
    string;
}) {
  const external =
    href.startsWith(
      "http",
    );


  return (
    <a
      href={
        href
      }
      target={
        external
          ? "_blank"
          : undefined
      }
      rel={
        external
          ? "noreferrer"
          : undefined
      }
      className="group rounded-[24px] border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>


      <h3 className="mt-6 text-lg font-semibold text-slate-950">
        {
          title
        }
      </h3>


      <p className="mt-2 text-sm leading-6 text-slate-500">
        {
          description
        }
      </p>


      <p className="mt-5 break-all text-sm font-semibold text-slate-900">
        {
          value
        }
      </p>


      <div className="mt-5 flex items-center text-xs font-semibold text-blue-600">
        {
          action
        }

        <ArrowRight className="ml-2 h-3.5 w-3.5 transition group-hover:translate-x-1" />
      </div>
    </a>
  );
}


// =========================================================
// SUPPORT ROUTE
// =========================================================

function SupportRoute({
  number,
  title,
  description,
  href,
  action,
}: {
  number:
    string;

  title:
    string;

  description:
    string;

  href:
    string;

  action:
    string;
}) {
  return (
    <div className="grid gap-5 border-b border-slate-200 p-6 last:border-b-0 sm:grid-cols-[54px_1fr_auto] sm:items-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
        {
          number
        }
      </div>


      <div>
        <h3 className="font-semibold text-slate-950">
          {
            title
          }
        </h3>


        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
          {
            description
          }
        </p>
      </div>


      <Link
        href={
          href
        }
        className="inline-flex items-center text-sm font-semibold text-blue-600"
      >
        {
          action
        }

        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </div>
  );
}