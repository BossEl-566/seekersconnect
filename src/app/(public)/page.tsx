import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Headphones,
  MapPin,
  MessageCircle,
  PackageCheck,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  Badge,
} from "@/components/ui/badge";

import {
  getSystemSettings,
} from "@/lib/settings/system-settings";

import {
  getPublicUniversities,
} from "@/lib/catalog/public-universities";

import {
  UniversityLogo,
} from "@/components/public/university-logo";


const steps = [
  {
    number:
      "01",

    title:
      "Choose your university",

    description:
      "Select your institution and the academic document you want us to process.",

    icon:
      Building2,
  },

  {
    number:
      "02",

    title:
      "Complete your request",

    description:
      "Provide the required academic, applicant and delivery information.",

    icon:
      FileText,
  },

  {
    number:
      "03",

    title:
      "Submit payment proof",

    description:
      "Follow the payment instructions and securely upload your proof of payment.",

    icon:
      Upload,
  },

  {
    number:
      "04",

    title:
      "We process it",

    description:
      "Our team verifies your request and handles the university processing.",

    icon:
      FileCheck2,
  },

  {
    number:
      "05",

    title:
      "Track & receive",

    description:
      "Follow every stage and receive your scanned or physically delivered document.",

    icon:
      PackageCheck,
  },
];


const services = [
  {
    title:
      "Academic Transcripts",

    description:
      "Request official academic transcripts from supported universities.",

    icon:
      FileText,
  },

  {
    title:
      "Attestation Letters",

    description:
      "Submit and track requests for official attestation documents.",

    icon:
      ShieldCheck,
  },

  {
    title:
      "English Proficiency",

    description:
      "Request English proficiency letters where supported by your institution.",

    icon:
      Send,
  },
];


const trackingPreview = [
  {
    label:
      "Payment confirmed",

    status:
      "Completed",

    state:
      "complete",
  },

  {
    label:
      "University processing",

    status:
      "In progress",

    state:
      "active",
  },

  {
    label:
      "Document ready",

    status:
      "Pending",

    state:
      "pending",
  },

  {
    label:
      "EMS delivery",

    status:
      "Pending",

    state:
      "pending",
  },
] as const;


export default async function HomePage() {
  const [
    settings,
    universities,
  ] =
    await Promise.all([
      getSystemSettings(),
      getPublicUniversities(),
    ]);


  const {
    company,
    support,
  } =
    settings;


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


  const universityCodes =
    universities
      .map(
        (
          university,
        ) =>
          university.code,
      )
      .join(
        ", ",
      );


  return (
    <>
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-blue-100/70 blur-3xl" />

          <div className="absolute -left-40 top-72 h-72 w-72 rounded-full bg-indigo-100/60 blur-3xl" />

          <div className="absolute -right-40 top-40 h-80 w-80 rounded-full bg-sky-100/60 blur-3xl" />
        </div>


        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-28">

          {/* HERO COPY */}

          <div>
            <Badge
              variant="outline"
              className="rounded-full border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />

              Academic document requests made simpler
            </Badge>


            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl lg:leading-[1.05]">
              Your academic documents,
              <span className="text-blue-600">
                {" "}
                handled for you.
              </span>
            </h1>


            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Request transcripts, attestation letters, English
              proficiency letters and other supported academic
              documents without unnecessary travel or uncertainty.
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


            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                No account required
              </div>


              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                Request tracking
              </div>


              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                Customer support
              </div>
            </div>


            {/* SMALL TRUST PANEL */}

            <div className="mt-10 max-w-xl rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {universities
                    .slice(
                      0,
                      4,
                    )
                    .map(
                      (
                        university,
                      ) => (
                        <UniversityLogo
                          key={
                            university.id
                          }
                          code={
                            university.code
                          }
                          name={
                            university.name
                          }
                          className="h-10 w-10 rounded-full shadow-sm"
                          imageClassName="p-1.5"
                        />
                      ),
                    )}
                </div>


                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {
                      universities.length
                    }{" "}
                    supported universit
                    {universities.length ===
                    1
                      ? "y"
                      : "ies"}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Request services depend on the selected institution.
                  </p>
                </div>
              </div>
            </div>
          </div>


          {/* ===================================================
              VISUAL / REQUEST PREVIEW
          =================================================== */}

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-6 -z-10 rounded-[44px] bg-blue-100/70 blur-2xl" />


            {/* UNIVERSITY LOGO IMAGE */}

            <div className="mb-5 overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-5 shadow-lg shadow-slate-200/40">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                    Supported Institutions
                  </p>

                  <h2 className="mt-2 text-lg font-semibold text-slate-950">
                    Academic requests across leading universities
                  </h2>
                </div>


                <div className="hidden rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white sm:block">
                  Ghana
                </div>
              </div>


              <div className="relative mt-5 aspect-[16/6] overflow-hidden rounded-2xl border border-slate-100 bg-white">
                <Image
                  src="/universities-logos-together.png"
                  alt="Supported university logos"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 520px"
                  className="object-contain p-4"
                />
              </div>
            </div>


            {/* REQUEST PREVIEW */}

            <div className="rounded-[28px] border border-white/80 bg-white p-3 shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
              <div className="rounded-[22px] border border-slate-200 bg-[#f8fafc] p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-600">
                      Request overview
                    </p>

                    <h2 className="mt-2 text-xl font-semibold text-slate-950">
                      Start your document request
                    </h2>
                  </div>


                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>


                <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">
                    UNIVERSITY
                  </p>


                  <div className="mt-3 flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      {universities[0] ? (
                        <UniversityLogo
                          code={
                            universities[0]
                              .code
                          }
                          name={
                            universities[0]
                              .name
                          }
                          className="h-11 w-11 shrink-0 rounded-xl"
                          imageClassName="p-1.5"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Building2 className="h-5 w-5" />
                        </div>
                      )}


                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          Select institution
                        </p>

                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                          {universityCodes ||
                            "Supported universities"}
                        </p>
                      </div>
                    </div>


                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </div>
                </div>


                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">
                    POPULAR SERVICES
                  </p>


                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {[
                      "Transcript",
                      "Attestation",
                      "Proficiency",
                    ].map(
                      (
                        service,
                      ) => (
                        <div
                          key={
                            service
                          }
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-xs font-medium text-slate-700"
                        >
                          {
                            service
                          }
                        </div>
                      ),
                    )}
                  </div>
                </div>


                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-blue-600 p-4 text-white">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <Clock3 className="h-5 w-5" />
                  </div>


                  <div>
                    <p className="text-sm font-semibold">
                      Track every important stage
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-blue-100">
                      From payment verification through university
                      processing and delivery.
                    </p>
                  </div>
                </div>


                <div className="mt-5 flex items-center justify-between">
                  {[
                    {
                      label:
                        "Submitted",

                      completed:
                        true,
                    },

                    {
                      label:
                        "Payment",

                      completed:
                        true,
                    },

                    {
                      label:
                        "University",

                      completed:
                        false,
                    },

                    {
                      label:
                        "Delivery",

                      completed:
                        false,
                    },
                  ].map(
                    (
                      item,
                      index,
                    ) => (
                      <div
                        key={
                          item.label
                        }
                        className="flex flex-1 items-center"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-full ${
                              item.completed
                                ? "bg-blue-600 text-white"
                                : "border border-slate-300 bg-white text-slate-400"
                            }`}
                          >
                            {item.completed ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <span className="text-[10px]">
                                {
                                  index +
                                  1
                                }
                              </span>
                            )}
                          </div>


                          <span className="hidden text-[10px] text-slate-500 sm:block">
                            {
                              item.label
                            }
                          </span>
                        </div>


                        {index <
                          3 && (
                          <div
                            className={`mb-5 h-px flex-1 ${
                              index ===
                              0
                                ? "bg-blue-500"
                                : "bg-slate-200"
                            }`}
                          />
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          UNIVERSITIES
      =================================================== */}

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
              Supported Universities
            </p>


            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Choose the institution that holds your academic record.
            </h2>


            <p className="mt-4 text-sm leading-7 text-slate-500">
              The institutions shown here are actively available for
              request processing through{" "}
              {
                company.shortName
              }.
            </p>
          </div>


          {universities.length >
          0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {universities.map(
                (
                  university,
                ) => (
                  <div
                    key={
                      university.id
                    }
                    className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
                  >
                    <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50">
                      <div className="absolute right-3 top-3 rounded-full border border-blue-100 bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                        Supported
                      </div>


                      <UniversityLogo
                        code={
                          university.code
                        }
                        name={
                          university.name
                        }
                        className="h-20 w-20 shadow-sm transition duration-300 group-hover:scale-105"
                      />
                    </div>


                    <div className="border-t border-slate-100 p-5">
                      <p className="text-lg font-semibold text-slate-950">
                        {
                          university.code
                        }
                      </p>


                      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                        {
                          university.name
                        }
                      </p>


                      <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />

                        <span className="line-clamp-1">
                          {
                            university.location ||
                            "Ghana"
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="mt-10 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <Building2 className="mx-auto h-8 w-8 text-slate-400" />


              <p className="mt-4 font-semibold text-slate-800">
                No universities are currently available.
              </p>


              <p className="mt-2 text-sm text-slate-500">
                Please check again later or contact our support team.
              </p>
            </div>
          )}
        </div>
      </section>


      {/* ===================================================
          SERVICES
      =================================================== */}

      <section className="relative overflow-hidden">
        <div className="absolute right-0 top-0 -z-10 h-96 w-96 rounded-full bg-blue-50 blur-3xl" />


        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">

            {/* SERVICE INTRO */}

            <div className="lg:sticky lg:top-28">
              <Badge
                variant="outline"
                className="rounded-full border-blue-200 bg-blue-50 text-blue-700"
              >
                Our Services
              </Badge>


              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                One place for your academic document requests.
              </h2>


              <p className="mt-4 max-w-xl leading-7 text-slate-600">
                Available services depend on your institution and
                programme. The request process guides you through the
                exact information needed.
              </p>


              <div className="mt-8 overflow-hidden rounded-[26px] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5">
                <div className="relative aspect-[16/7] overflow-hidden rounded-2xl bg-white">
                  <Image
                    src="/universities-logos-together.png"
                    alt="Universities supported by Seekers Connect"
                    fill
                    sizes="(max-width: 1024px) 100vw, 420px"
                    className="object-contain p-4"
                  />
                </div>


                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Request services are configured individually for each
                  supported university.
                </p>
              </div>


              <Link
                href="/services"
                className={buttonVariants({
                  variant:
                    "outline",

                  className:
                    "mt-6 rounded-xl bg-white",
                })}
              >
                View All Services

                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>


            {/* SERVICE CARDS */}

            <div className="grid gap-4 md:grid-cols-2">
              {services.map(
                (
                  service,
                  index,
                ) => {
                  const Icon =
                    service.icon;


                  return (
                    <div
                      key={
                        service.title
                      }
                      className={`group rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50 ${
                        index ===
                        2
                          ? "md:col-span-2"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                          <Icon className="h-5 w-5" />
                        </div>


                        <span className="text-xs font-medium text-slate-300">
                          0
                          {
                            index +
                            1
                          }
                        </span>
                      </div>


                      <h3 className="mt-6 text-lg font-semibold text-slate-950">
                        {
                          service.title
                        }
                      </h3>


                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {
                          service.description
                        }
                      </p>


                      <Link
                        href="/request"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
                      >
                        Start request

                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          HOW IT WORKS
      =================================================== */}

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl" />


        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <Badge className="rounded-full bg-blue-500/15 text-blue-300 hover:bg-blue-500/15">
              How it works
            </Badge>


            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              From request to delivery, without the guesswork.
            </h2>


            <p className="mt-4 leading-7 text-slate-400">
              We keep the process clear so you know what has happened,
              what is happening now and what comes next.
            </p>
          </div>


          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {steps.map(
              (
                step,
              ) => {
                const Icon =
                  step.icon;


                return (
                  <div
                    key={
                      step.number
                    }
                    className="group rounded-[22px] border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-blue-500/30 hover:bg-white/[0.07]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                        <Icon className="h-5 w-5" />
                      </div>


                      <span className="text-xs font-medium text-slate-600">
                        {
                          step.number
                        }
                      </span>
                    </div>


                    <h3 className="mt-5 font-semibold">
                      {
                        step.title
                      }
                    </h3>


                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      {
                        step.description
                      }
                    </p>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>


      {/* ===================================================
          TRACKING CTA
      =================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="relative overflow-hidden rounded-[32px] bg-blue-600">
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

          <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-indigo-900/20 blur-3xl" />


          <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_0.75fr] lg:p-14">
            <div>
              <Badge className="bg-white/15 text-white hover:bg-white/15">
                Request Tracking
              </Badge>


              <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Already submitted a request?
              </h2>


              <p className="mt-4 max-w-xl leading-7 text-blue-100">
                Use your secure tracking details to see the latest
                progress of your request, from payment verification to
                document processing and delivery.
              </p>


              <Link
                href="/track"
                className={buttonVariants({
                  size:
                    "lg",

                  className:
                    "mt-7 rounded-xl bg-white text-blue-700 hover:bg-blue-50",
                })}
              >
                Track My Request

                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>


            <div className="flex items-center">
              <div className="w-full rounded-[24px] border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur">
                <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-blue-200">
                      Request Status
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      Processing timeline
                    </p>
                  </div>


                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Clock3 className="h-5 w-5 text-white" />
                  </div>
                </div>


                {trackingPreview.map(
                  (
                    item,
                    index,
                  ) => (
                    <div
                      key={
                        item.label
                      }
                      className={`flex items-center justify-between py-3 ${
                        index !==
                        trackingPreview.length -
                          1
                          ? "border-b border-white/10"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            item.state ===
                            "complete"
                              ? "bg-emerald-300"
                              : item.state ===
                                  "active"
                                ? "bg-yellow-300"
                                : "bg-white/30"
                          }`}
                        />


                        <span className="text-sm text-white">
                          {
                            item.label
                          }
                        </span>
                      </div>


                      <span className="text-xs text-blue-100">
                        {
                          item.status
                        }
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          SUPPORT
      =================================================== */}

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-semibold text-blue-600">
              Need assistance?
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Our support team is here to help.
            </h2>
          </div>


          <div className="grid gap-6 md:grid-cols-2">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden rounded-[26px] border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-white p-6 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-100/70 blur-2xl" />


              <div className="relative flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <MessageCircle className="h-5 w-5" />
                </div>


                <div>
                  <h3 className="font-semibold text-slate-950">
                    WhatsApp Support
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Need help completing a request? Reach our support
                    team directly on WhatsApp.
                  </p>

                  <p className="mt-4 text-sm font-semibold text-emerald-700">
                    {
                      company.whatsapp
                    }
                  </p>
                </div>
              </div>
            </a>


            <a
              href={
                support.phones[0]
                  ? `tel:${support.phones[0]}`
                  : "/contact"
              }
              className="group relative overflow-hidden rounded-[26px] border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-100/70 blur-2xl" />


              <div className="relative flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <Headphones className="h-5 w-5" />
                </div>


                <div>
                  <h3 className="font-semibold text-slate-950">
                    Customer Support
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Our team can assist with request information,
                    payment verification and delivery enquiries.
                  </p>


                  {support.phones[0] && (
                    <p className="mt-4 text-sm font-semibold text-blue-700">
                      {
                        support.phones[0]
                      }
                    </p>
                  )}
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}