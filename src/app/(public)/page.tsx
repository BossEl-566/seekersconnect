import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Headphones,
  Languages,
  MapPin,
  MessageCircle,
  Package,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Upload,
} from "lucide-react";

import {
  Badge,
} from "@/components/ui/badge";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  UniversityLogo,
} from "@/components/public/university-logo";

import {
  getSystemSettings,
} from "@/lib/settings/system-settings";

import {
  getPublicUniversities,
} from "@/lib/catalog/public-universities";

import {
  getPublicServiceCatalog,
} from "@/lib/catalog/public-service-catalog";


// =========================================================
// PRIMARY SERVICES
// =========================================================

const primaryServices = [
  {
    title:
      "Run an Errand",

    description:
      "Need something handled on your behalf? Give us the task, location and instructions and our team will take care of it.",

    icon:
      Package,

    features: [
      "Pickup & drop-off",
      "Queue on your behalf",
      "Submit or collect items",
    ],
  },

  {
    title:
      "Pickup & Delivery",

    description:
      "Send documents, books, packages and other permitted items from one location to another.",

    icon:
      PackageCheck,

    features: [
      "Document delivery",
      "Book & parcel delivery",
      "Recipient delivery",
    ],
  },

  {
    title:
      "Document Services",

    description:
      "Let us submit, collect, process or deliver documents from universities, offices and organizations.",

    icon:
      FileText,

    features: [
      "Academic documents",
      "Document collection",
      "Document submission",
    ],
  },

  {
    title:
      "Shop For Me",

    description:
      "Send us your shopping list and let us purchase and deliver the items you need.",

    icon:
      ShoppingBasket,

    features: [
      "Groceries",
      "Books",
      "Stationery",
    ],
  },
];


// =========================================================
// HOW IT WORKS
// =========================================================

const steps = [
  {
    number:
      "01",

    title:
      "Choose what you need",

    description:
      "Select an errand, delivery, shopping or document service and tell us what you need.",

    icon:
      Package,
  },

  {
    number:
      "02",

    title:
      "Provide the details",

    description:
      "Add locations, contacts, shopping lists, document information and any special instructions.",

    icon:
      FileText,
  },

  {
    number:
      "03",

    title:
      "Confirm payment",

    description:
      "Follow the payment instructions and securely upload your proof of payment.",

    icon:
      Upload,
  },

  {
    number:
      "04",

    title:
      "We handle it",

    description:
      "Our team reviews the request and carries out the errand, shopping, document or delivery workflow.",

    icon:
      FileCheck2,
  },

  {
    number:
      "05",

    title:
      "Track & receive",

    description:
      "Use your secure tracking details to follow progress until your request is completed.",

    icon:
      PackageCheck,
  },
];


// =========================================================
// TRACKING PREVIEW
// =========================================================

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
      "Request processing",

    status:
      "In progress",

    state:
      "active",
  },

  {
    label:
      "Pickup / service",

    status:
      "Pending",

    state:
      "pending",
  },

  {
    label:
      "Delivery / completion",

    status:
      "Pending",

    state:
      "pending",
  },
] as const;


// =========================================================
// HOME PAGE
// =========================================================

export default async function HomePage() {
  const [
    settings,
    loadedUniversities,
    serviceCatalog,
  ] =
    await Promise.all([
      getSystemSettings(),
      getPublicUniversities(),
      getPublicServiceCatalog(),
    ]);


  const {
    company,
    support,
  } =
    settings;


  // Safety filter:
  // SC247 is our internal general-services provider,
  // not a university that should be displayed publicly.
  const universities =
    loadedUniversities.filter(
      (
        university,
      ) =>
        university.code !==
        "SC247",
    );


  const generalProvider =
    serviceCatalog.find(
      (
        provider,
      ) =>
        provider.code ===
        "SC247",
    );


  const academicCatalog =
    serviceCatalog.filter(
      (
        provider,
      ) =>
        provider.code !==
        "SC247",
    );


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


  // =======================================================
  // DYNAMIC ACADEMIC SERVICE HIGHLIGHTS
  // =======================================================

  const allAcademicServices =
    academicCatalog.flatMap(
      (
        university,
      ) =>
        university.services.map(
          (
            service,
          ) => ({
            ...service,

            universityCode:
              university.code,
          }),
        ),
    );


  const serviceGroups =
    new Map<
      string,
      {
        name:
          string;

        category:
          string;

        description:
          string;

        universityCodes:
          string[];
      }
    >();


  for (
    const service of
      allAcademicServices
  ) {
    const key =
      `${service.category}:${service.name}`
        .trim()
        .toLowerCase();


    const existing =
      serviceGroups.get(
        key,
      );


    if (
      existing
    ) {
      if (
        !existing.universityCodes.includes(
          service.universityCode,
        )
      ) {
        existing.universityCodes.push(
          service.universityCode,
        );
      }

      continue;
    }


    serviceGroups.set(
      key,
      {
        name:
          service.name,

        category:
          service.category,

        description:
          service.description ||
          "Academic document service available from supported institutions.",

        universityCodes: [
          service.universityCode,
        ],
      },
    );
  }


  const serviceHighlights =
    Array.from(
      serviceGroups.values(),
    ).slice(
      0,
      4,
    );


  return (
    <>
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[560px] w-[960px] -translate-x-1/2 rounded-full bg-blue-100/60 blur-3xl" />

          <div className="absolute -left-48 top-72 h-80 w-80 rounded-full bg-indigo-100/60 blur-3xl" />

          <div className="absolute -right-48 top-40 h-96 w-96 rounded-full bg-sky-100/70 blur-3xl" />
        </div>


        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[0.96fr_1.04fr] lg:px-8 lg:py-28">
          {/* COPY */}

          <div>
            <Badge
              variant="outline"
              className="rounded-full border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />

              Errands, deliveries & document services
            </Badge>


            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl lg:leading-[1.04]">
              Your errands and deliveries,

              <span className="text-blue-600">
                {" "}
                handled for you.
              </span>
            </h1>


            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Request errands, pickups, deliveries, document services
              and shopping assistance from one place. From groceries
              and books to stationery and academic documents, tell us
              what you need and we will help you handle it.
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
                Request a Service

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

                Secure request tracking
              </div>


              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                Customer support
              </div>
            </div>


            <div className="mt-10 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
                <p className="text-xl font-semibold text-slate-950">
                  {
                    generalProvider
                      ?.services
                      .length ??
                    4
                  }
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  General service types
                </p>
              </div>


              <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
                <p className="text-xl font-semibold text-slate-950">
                  {
                    universities.length
                  }
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Supported universities
                </p>
              </div>


              <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
                <p className="text-xl font-semibold text-slate-950">
                  1
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Place to manage it all
                </p>
              </div>
            </div>
          </div>


          {/* =================================================
              HERO IMAGE
          ================================================= */}

          <div className="relative mx-auto w-full max-w-2xl">
            <div className="absolute -inset-6 -z-10 rounded-[48px] bg-blue-100/80 blur-3xl" />


            <div className="relative overflow-hidden rounded-[34px] border border-white/80 bg-slate-950 shadow-[0_30px_90px_rgba(15,23,42,0.18)]">
              <div className="relative aspect-[4/3] sm:aspect-[5/4]">
                <Image
                  src="/pick-up.jpg"
                  alt="Seekers Connect pickup and errand service"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-cover"
                />


                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />


                <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                  <div className="rounded-full border border-white/20 bg-slate-950/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                    Seekers Connect 247
                  </div>


                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur">
                    <Package className="h-4 w-4" />
                  </div>
                </div>


                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
                    On-demand assistance
                  </p>


                  <h2 className="mt-2 max-w-md text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    Tell us what needs to be done.
                  </h2>


                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-200">
                    From a quick pickup to shopping, documents or
                    delivery, submit the request and let our team
                    handle the rest.
                  </p>
                </div>
              </div>
            </div>


            {/* FLOATING SERVICES */}

            <div className="relative -mt-7 mx-4 grid grid-cols-2 gap-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-xl sm:mx-8 sm:grid-cols-4">
              {[
                {
                  label:
                    "Errands",

                  icon:
                    Package,
                },

                {
                  label:
                    "Delivery",

                  icon:
                    PackageCheck,
                },

                {
                  label:
                    "Documents",

                  icon:
                    FileText,
                },

                {
                  label:
                    "Shopping",

                  icon:
                    ShoppingBasket,
                },
              ].map(
                (
                  item,
                ) => {
                  const Icon =
                    item.icon;


                  return (
                    <div
                      key={
                        item.label
                      }
                      className="rounded-2xl bg-slate-50 px-3 py-4 text-center"
                    >
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon className="h-4 w-4" />
                      </div>

                      <p className="mt-2 text-xs font-semibold text-slate-800">
                        {
                          item.label
                        }
                      </p>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          PRIMARY SERVICES
      =================================================== */}

      <section className="border-y border-slate-200 bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Badge
                variant="outline"
                className="rounded-full border-blue-200 bg-white text-blue-700"
              >
                What We Do
              </Badge>


              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Everyday tasks should not take over your day.
              </h2>


              <p className="mt-4 leading-7 text-slate-600">
                Tell us what needs to be handled. Our service flow is
                designed for errands, pickups, deliveries, shopping
                and document requests.
              </p>
            </div>


            <Link
              href="/request"
              className={buttonVariants({
                variant:
                  "outline",

                size:
                  "lg",

                className:
                  "rounded-xl bg-white",
              })}
            >
              Start a Request

              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>


          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {primaryServices.map(
              (
                service,
              ) => {
                const Icon =
                  service.icon;


                return (
                  <Link
                    key={
                      service.title
                    }
                    href="/request"
                    className="group rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60 sm:p-7"
                  >
                    <div className="flex items-start justify-between gap-5">
                      <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>


                      <ArrowRight className="mt-2 h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                    </div>


                    <h3 className="mt-6 text-xl font-semibold text-slate-950">
                      {
                        service.title
                      }
                    </h3>


                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                      {
                        service.description
                      }
                    </p>


                    <div className="mt-5 flex flex-wrap gap-2">
                      {service.features.map(
                        (
                          feature,
                        ) => (
                          <span
                            key={
                              feature
                            }
                            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                          >
                            {
                              feature
                            }
                          </span>
                        ),
                      )}
                    </div>
                  </Link>
                );
              },
            )}
          </div>
        </div>
      </section>


      {/* ===================================================
          DELIVERY FEATURE WITH SECOND IMAGE
      =================================================== */}

      <section className="overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
          {/* IMAGE */}

          <div className="relative">
            <div className="absolute -left-8 -top-8 h-48 w-48 rounded-full bg-blue-100 blur-3xl" />


            <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50 shadow-xl shadow-slate-200/50">
              <div className="relative aspect-[5/4]">
                <Image
                  src="/delivery.png"
                  alt="Seekers Connect delivery service"
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover"
                />


                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />


                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-slate-950/65 p-4 text-white backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                      <PackageCheck className="h-5 w-5" />
                    </div>


                    <div>
                      <p className="text-sm font-semibold">
                        Pickup to destination
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-300">
                        One request. Clear delivery details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* COPY */}

          <div>
            <Badge
              variant="outline"
              className="rounded-full border-blue-200 bg-blue-50 text-blue-700"
            >
              Errands & Delivery
            </Badge>


            <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              From the pickup point to where it needs to go.
            </h2>


            <p className="mt-5 max-w-xl leading-7 text-slate-600">
              Whether you need someone to collect a document, purchase
              a book, deliver a parcel or handle a local errand,
              Seekers Connect gives you one structured way to submit
              the details and follow the request.
            </p>


            <div className="mt-8 space-y-4">
              {[
                {
                  title:
                    "Give us the location",

                  description:
                    "Provide the pickup point, office, shop, institution or landmark.",

                  icon:
                    MapPin,
                },

                {
                  title:
                    "Tell us what to collect or do",

                  description:
                    "Add item information, shopping lists, document details or special instructions.",

                  icon:
                    FileText,
                },

                {
                  title:
                    "Track what happens next",

                  description:
                    "After payment verification, use your secure tracking details to follow progress.",

                  icon:
                    Search,
                },
              ].map(
                (
                  item,
                ) => {
                  const Icon =
                    item.icon;


                  return (
                    <div
                      key={
                        item.title
                      }
                      className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon className="h-5 w-5" />
                      </div>


                      <div>
                        <p className="font-semibold text-slate-900">
                          {
                            item.title
                          }
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {
                            item.description
                          }
                        </p>
                      </div>
                    </div>
                  );
                },
              )}
            </div>


            <Link
              href="/request"
              className={buttonVariants({
                size:
                  "lg",

                className:
                  "mt-8 rounded-xl bg-blue-600 text-white hover:bg-blue-700",
              })}
            >
              Send Us a Request

              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>


      {/* ===================================================
          SHOP FOR ME
      =================================================== */}

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <Badge className="rounded-full bg-blue-500/15 text-blue-300 hover:bg-blue-500/15">
                Shop For Me
              </Badge>


              <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                Groceries, books and stationery — add them to the list.
              </h2>


              <p className="mt-4 max-w-xl leading-7 text-slate-400">
                You do not need to browse a complicated online store.
                Tell us what you need, add quantities and preferences,
                and provide the delivery information.
              </p>


              <Link
                href="/request"
                className={buttonVariants({
                  size:
                    "lg",

                  className:
                    "mt-7 rounded-xl bg-white text-slate-950 hover:bg-slate-100",
                })}
              >
                Create Shopping Request

                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>


            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title:
                    "Groceries",

                  description:
                    "Food, household products and everyday essentials.",

                  icon:
                    ShoppingBasket,
                },

                {
                  title:
                    "Books",

                  description:
                    "Textbooks, novels, study materials and requested titles.",

                  icon:
                    BookOpen,
                },

                {
                  title:
                    "Stationery",

                  description:
                    "Notebooks, pens, paper and school or office supplies.",

                  icon:
                    FileText,
                },
              ].map(
                (
                  item,
                ) => {
                  const Icon =
                    item.icon;


                  return (
                    <div
                      key={
                        item.title
                      }
                      className="rounded-[24px] border border-white/10 bg-white/[0.05] p-6"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                        <Icon className="h-5 w-5" />
                      </div>


                      <h3 className="mt-5 text-lg font-semibold">
                        {
                          item.title
                        }
                      </h3>


                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {
                          item.description
                        }
                      </p>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          ACADEMIC UNIVERSITIES
      =================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
              Academic Document Services
            </p>


            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              We also handle requests from supported universities.
            </h2>


            <p className="mt-4 text-sm leading-7 text-slate-500">
              Need a transcript, attestation, proficiency letter or
              another supported academic document? Select your
              institution when starting a request.
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
            </div>
          )}


          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Currently supported:{" "}
              {
                universityCodes ||
                "Contact us for current availability."
              }
            </p>
          </div>
        </div>
      </section>


      {/* ===================================================
          ACADEMIC SERVICES
      =================================================== */}

      <section className="relative overflow-hidden bg-slate-50/60">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl" />


        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            {/* INTRO */}

            <div className="lg:sticky lg:top-28">
              <Badge
                variant="outline"
                className="rounded-full border-blue-200 bg-white text-blue-700"
              >
                Academic Services
              </Badge>


              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Academic services when you need them.
              </h2>


              <p className="mt-4 max-w-xl leading-7 text-slate-600">
                Academic document services remain available for
                supported universities alongside our broader errand
                and delivery services.
              </p>


              <div className="mt-8 overflow-hidden rounded-[26px] border border-blue-100 bg-white p-5 shadow-sm">
                <div className="relative aspect-[16/7] overflow-hidden rounded-2xl bg-slate-50">
                  <Image
                    src="/universities-logos-together.png"
                    alt="Universities supported by Seekers Connect"
                    fill
                    sizes="(max-width: 1024px) 100vw, 420px"
                    className="object-contain p-4"
                  />
                </div>


                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Services are configured individually for each
                  supported institution.
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


            {/* CARDS */}

            {serviceHighlights.length >
            0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {serviceHighlights.map(
                  (
                    service,
                  ) => {
                    const Icon =
                      getServiceIcon(
                        service.category,
                      );


                    return (
                      <div
                        key={`${service.category}-${service.name}`}
                        className="group rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                            <Icon className="h-5 w-5" />
                          </div>


                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            {
                              service.category
                            }
                          </span>
                        </div>


                        <h3 className="mt-6 text-lg font-semibold text-slate-950">
                          {
                            service.name
                          }
                        </h3>


                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {
                            service.description
                          }
                        </p>


                        <div className="mt-5 flex flex-wrap gap-2">
                          {service
                            .universityCodes
                            .slice(
                              0,
                              5,
                            )
                            .map(
                              (
                                code,
                              ) => (
                                <span
                                  key={
                                    code
                                  }
                                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600"
                                >
                                  {
                                    code
                                  }
                                </span>
                              ),
                            )}
                        </div>


                        <Link
                          href="/request"
                          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:gap-3 hover:text-blue-700"
                        >
                          Start request

                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    );
                  },
                )}
              </div>
            ) : (
              <div className="rounded-[26px] border border-dashed border-slate-300 bg-white p-8 text-center">
                <FileText className="mx-auto h-7 w-7 text-slate-400" />

                <p className="mt-4 font-semibold text-slate-800">
                  No academic services are currently available.
                </p>
              </div>
            )}
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
              From request to completion, without the guesswork.
            </h2>


            <p className="mt-4 leading-7 text-slate-400">
              Whether it is an errand, a shopping request, document
              processing or delivery, the process stays clear.
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
        <div className="relative overflow-hidden rounded-[34px] bg-blue-600">
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
                Use your secure tracking details to follow your
                request from payment verification through processing,
                pickup, delivery or completion.
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


            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Ask about a new request, payment verification, an errand,
              delivery, academic document or an existing tracking issue.
            </p>
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
                    Need help before submitting a request? Talk to our
                    support team directly.
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
                    payment verification, shopping, document and
                    delivery enquiries.
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


// =========================================================
// ACADEMIC SERVICE ICON
// =========================================================

function getServiceIcon(
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