/* eslint-disable react-hooks/static-components */
import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileCheck2,
  FileText,
  GraduationCap,
  Languages,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  Badge,
} from "@/components/ui/badge";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  getPublicServiceCatalog,
} from "@/lib/catalog/public-service-catalog";

import {
  getSystemSettings,
} from "@/lib/settings/system-settings";

import {
  UniversityLogo,
} from "@/components/public/university-logo";


export default async function ServicesPage() {
  const [
    universities,
    settings,
  ] =
    await Promise.all([
      getPublicServiceCatalog(),
      getSystemSettings(),
    ]);


  const totalServices =
    universities.reduce(
      (
        total,
        university,
      ) =>
        total +
        university.services.length,
      0,
    );


  const {
    company,
  } =
    settings;


  return (
    <>
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/80 via-white to-white" />

        <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-blue-100/70 blur-3xl" />


        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-24">

          {/* HERO COPY */}

          <div>
            <Badge
              variant="outline"
              className="rounded-full border-blue-200 bg-white/80 px-3 py-1.5 text-blue-700 shadow-sm"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />

              Academic Services
            </Badge>


            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-6xl lg:leading-[1.05]">
              Academic document services,
              <span className="text-blue-600">
                {" "}
                all in one place.
              </span>
            </h1>


            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Browse the academic request services currently available
              through{" "}
              {
                company.shortName
              }.
              Choose your university, select the document you need and
              complete the request online.
            </p>


            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/request"
                className={buttonVariants({
                  size:
                    "lg",

                  className:
                    "h-12 rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-700",
                })}
              >
                Start a Request

                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>


              <Link
                href="/track"
                className={buttonVariants({
                  variant:
                    "outline",

                  size:
                    "lg",

                  className:
                    "h-12 rounded-xl bg-white px-6",
                })}
              >
                <Search className="mr-2 h-4 w-4" />

                Track Existing Request
              </Link>
            </div>


            {/* STATS */}

            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-5 border-t border-slate-200 pt-7">
              <div>
                <p className="text-3xl font-semibold tracking-tight text-slate-950">
                  {
                    universities.length
                  }
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Supported universities
                </p>
              </div>


              <div>
                <p className="text-3xl font-semibold tracking-tight text-slate-950">
                  {
                    totalServices
                  }
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Active request services
                </p>
              </div>


              <div>
                <p className="text-3xl font-semibold tracking-tight text-slate-950">
                  24/7
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Online request access
                </p>
              </div>
            </div>
          </div>


          {/* HERO VISUAL */}

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 -z-10 rounded-[40px] bg-blue-100/70 blur-2xl" />


            <div className="overflow-hidden rounded-[30px] border border-blue-100 bg-white p-4 shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
              <div className="rounded-[24px] bg-gradient-to-br from-blue-50 via-white to-slate-50 p-5 sm:p-6">

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                      Supported Institutions
                    </p>

                    <h2 className="mt-2 text-xl font-semibold text-slate-950">
                      Services across leading universities
                    </h2>
                  </div>


                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                </div>


                <div className="relative mt-6 aspect-[16/7] overflow-hidden rounded-2xl border border-slate-100 bg-white">
                  <Image
                    src="/universities-logos-together.png"
                    alt="Supported university logos"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="object-contain p-5"
                  />
                </div>


                <div className="mt-5 grid grid-cols-3 gap-3">
                  <MiniService
                    icon={
                      FileText
                    }
                    label="Transcripts"
                  />

                  <MiniService
                    icon={
                      ShieldCheck
                    }
                    label="Attestation"
                  />

                  <MiniService
                    icon={
                      Languages
                    }
                    label="Proficiency"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          INTRODUCTION
      =================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            <Feature
              icon={
                Building2
              }
              title="University-specific"
              description="Each institution has its own available request services and required information."
            />

            <Feature
              icon={
                FileCheck2
              }
              title="Guided forms"
              description="You are shown only the information required for the academic service you select."
            />

            <Feature
              icon={
                CheckCircle2
              }
              title="Trackable process"
              description="After payment verification, you receive secure tracking details for your request."
            />
          </div>
        </div>
      </section>


      {/* ===================================================
          SERVICE CATALOG
      =================================================== */}

      <section className="relative overflow-hidden">
        <div className="absolute -right-52 top-20 -z-10 h-96 w-96 rounded-full bg-blue-50 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">

          {/* CATALOG HEADING */}

          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
              Available services
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Browse services by university.
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Select an institution below to see the academic document
              requests currently available through{" "}
              {
                company.shortName
              }.
            </p>
          </div>


          {universities.length ===
          0 ? (
            <EmptyCatalog />
          ) : (
            <div className="space-y-10">
              {universities.map(
                (
                  university,
                ) => (
                  <section
                    key={
                      university.id
                    }
                    className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm"
                  >

                    {/* =====================================
                        UNIVERSITY HEADER
                    ===================================== */}

                    <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-slate-50 p-5 sm:p-7">
                      <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-blue-100/70 blur-3xl" />


                      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-4">
                          <UniversityLogo
                            code={
                              university.code
                            }
                            name={
                              university.name
                            }
                            className="h-20 w-20 shrink-0 shadow-sm transition duration-300 group-hover:scale-[1.03]"
                          />


                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">
                                {
                                  university.name
                                }
                              </h2>


                              <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                {
                                  university.code
                                }
                              </span>
                            </div>


                            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                              <MapPin className="h-4 w-4 shrink-0 text-blue-500" />

                              <span>
                                {
                                  university.location ||
                                  "Ghana"
                                }
                              </span>
                            </div>
                          </div>
                        </div>


                        <div className="flex shrink-0 items-center gap-3">
                          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
                            <p className="text-xl font-semibold text-slate-950">
                              {
                                university
                                  .services
                                  .length
                              }
                            </p>

                            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                              Service
                              {university
                                .services
                                .length ===
                              1
                                ? ""
                                : "s"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>


                    {/* =====================================
                        UNIVERSITY SERVICES
                    ===================================== */}

                    <div className="grid gap-4 p-5 sm:p-7 lg:grid-cols-2">
                      {university.services.map(
                        (
                          service,
                        ) => (
                          <ServiceCard
                            key={
                              service.id
                            }
                            service={
                              service
                            }
                          />
                        ),
                      )}
                    </div>


                    {/* =====================================
                        UNIVERSITY ACTION
                    ===================================== */}

                    <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-500">
                          Ready to request a document from{" "}
                          <span className="font-medium text-slate-700">
                            {
                              university.code
                            }
                          </span>
                          ?
                        </p>


                        <Link
                          href="/request"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                        >
                          Start a request

                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </section>
                ),
              )}
            </div>
          )}
        </div>
      </section>


      {/* ===================================================
          FINAL CTA
      =================================================== */}

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[32px] bg-slate-950">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />

            <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />


            <div className="relative grid items-center gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_0.8fr] lg:p-14">

              {/* COPY */}

              <div className="max-w-2xl">
                <p className="text-sm font-medium text-blue-300">
                  Ready to continue?
                </p>


                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Start your academic request online.
                </h2>


                <p className="mt-4 leading-7 text-slate-400">
                  Choose your university and service, provide the
                  required information, upload your payment proof and
                  follow the request through processing and delivery.
                </p>


                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/request"
                    className={buttonVariants({
                      size:
                        "lg",

                      className:
                        "h-12 rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-500",
                    })}
                  >
                    Start a Request

                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>


                  <Link
                    href="/contact"
                    className={buttonVariants({
                      variant:
                        "outline",

                      size:
                        "lg",

                      className:
                        "h-12 rounded-xl border-white/20 bg-white/10 px-6 text-white hover:bg-white/15 hover:text-white",
                    })}
                  >
                    Contact Support
                  </Link>
                </div>
              </div>


              {/* VISUAL */}

              <div className="relative">
                <div className="rounded-[26px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                  <div className="relative aspect-[16/8] overflow-hidden rounded-2xl bg-white">
                    <Image
                      src="/universities-logos-together.png"
                      alt="Universities supported by Seekers Connect"
                      fill
                      sizes="(max-width: 1024px) 100vw, 450px"
                      className="object-contain p-5"
                    />
                  </div>


                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-xl font-semibold text-white">
                        {
                          universities.length
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Universities
                      </p>
                    </div>


                    <div className="rounded-xl bg-white/10 p-3">
                      <p className="text-xl font-semibold text-white">
                        {
                          totalServices
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Active services
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


// =========================================================
// MINI HERO SERVICE
// =========================================================

function MiniService({
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
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon className="h-4 w-4" />
      </div>

      <p className="mt-2 text-[11px] font-semibold text-slate-700">
        {
          label
        }
      </p>
    </div>
  );
}


// =========================================================
// TOP FEATURE CARD
// =========================================================

function Feature({
  icon:
    Icon,

  title,

  description,
}: {
  icon:
    React.ElementType;

  title:
    string;

  description:
    string;
}) {
  return (
    <div className="flex gap-4 rounded-[22px] border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>


      <div>
        <h3 className="font-semibold text-slate-950">
          {
            title
          }
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {
            description
          }
        </p>
      </div>
    </div>
  );
}


// =========================================================
// SERVICE CARD
// =========================================================

function ServiceCard({
  service,
}: {
  service: {
    id: string;

    slug: string;

    name: string;

    shortName: string;

    description:
      | string
      | null;

    category: string;

    formType: string;
  };
}) {
  const Icon =
    getCategoryIcon(
      service.category,
    );


  return (
    <div className="group/service relative flex flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60">
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-50 opacity-0 blur-2xl transition group-hover/service:opacity-100" />


      <div className="relative flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover/service:bg-blue-600 group-hover/service:text-white">
          <Icon className="h-5 w-5" />
        </div>


        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
          {
            formatCategory(
              service.category,
            )
          }
        </span>
      </div>


      <div className="relative">
        <h3 className="mt-5 text-lg font-semibold text-slate-950">
          {
            service.name
          }
        </h3>


        {service.shortName !==
          service.name && (
          <p className="mt-1 text-xs font-semibold text-blue-600">
            {
              service.shortName
            }
          </p>
        )}


        <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">
          {service.description ||
            "Academic document request service available through this institution."}
        </p>
      </div>


      <div className="relative mt-6 border-t border-slate-100 pt-4">
        <Link
          href="/request"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:gap-3 hover:text-blue-700"
        >
          Start this request

          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}


// =========================================================
// EMPTY STATE
// =========================================================

function EmptyCatalog() {
  return (
    <div className="overflow-hidden rounded-[30px] border border-dashed border-slate-300 bg-white shadow-sm">
      <div className="grid items-center gap-8 p-8 md:grid-cols-[1fr_0.75fr] md:p-10">
        <div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Building2 className="h-6 w-6" />
          </div>


          <h2 className="mt-5 text-2xl font-semibold text-slate-950">
            No services are currently available.
          </h2>


          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">
            There are currently no active university services
            available for public requests. Please contact our support
            team if you need assistance.
          </p>


          <Link
            href="/contact"
            className={buttonVariants({
              variant:
                "outline",

              className:
                "mt-6 rounded-xl",
            })}
          >
            Contact Support
          </Link>
        </div>


        <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-50">
          <Image
            src="/universities-logos-together.png"
            alt="University logos"
            fill
            className="object-contain p-6 opacity-70"
          />
        </div>
      </div>
    </div>
  );
}


// =========================================================
// CATEGORY ICON
// =========================================================

function getCategoryIcon(
  category:
    string,
) {
  switch (
    category.toLowerCase()
  ) {
    case "transcript":
      return FileText;


    case "attestation":
      return ShieldCheck;


    case "proficiency":
      return Languages;


    default:
      return FileCheck2;
  }
}


// =========================================================
// CATEGORY LABEL
// =========================================================

function formatCategory(
  category:
    string,
) {
  return category
    .replace(
      /[_-]+/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (
        character,
      ) =>
        character.toUpperCase(),
    );
}