import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  Building2,
  FileText,
  MapPin,
  Package,
  PackageCheck,
  Search,
  ShoppingBasket,
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
  getPublicServiceCatalog,
} from "@/lib/catalog/public-service-catalog";


// =========================================================
// GENERAL SERVICE ICONS
// =========================================================

function getGeneralServiceIcon(
  slug:
    string,
) {
  switch (
    slug
  ) {
    case "run-an-errand":
      return Package;

    case "pickup-delivery":
      return PackageCheck;

    case "document-errands":
      return FileText;

    case "shop-for-me":
      return ShoppingBasket;

    default:
      return Package;
  }
}


// =========================================================
// GENERAL SERVICE LABELS
// =========================================================

function getGeneralServiceFeatures(
  slug:
    string,
) {
  switch (
    slug
  ) {
    case "run-an-errand":
      return [
        "Pickup & drop-off",
        "Queue on your behalf",
        "Submit or collect items",
      ];

    case "pickup-delivery":
      return [
        "Documents",
        "Books",
        "Packages",
      ];

    case "document-errands":
      return [
        "Submit documents",
        "Collect documents",
        "Document enquiries",
      ];

    case "shop-for-me":
      return [
        "Groceries",
        "Books",
        "Stationery",
      ];

    default:
      return [];
  }
}


// =========================================================
// PAGE
// =========================================================

export default async function ServicesPage() {
  const catalog =
    await getPublicServiceCatalog();


  const generalProvider =
    catalog.find(
      (
        provider,
      ) =>
        provider.code ===
        "SC247",
    );


  const academicProviders =
    catalog.filter(
      (
        provider,
      ) =>
        provider.code !==
        "SC247",
    );


  const generalServices =
    generalProvider
      ?.services ??
    [];


  const academicServiceCount =
    academicProviders.reduce(
      (
        total,
        provider,
      ) =>
        total +
        provider.services.length,
      0,
    );


  return (
    <>
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-blue-100/60 blur-3xl" />

          <div className="absolute -right-32 top-28 h-72 w-72 rounded-full bg-sky-100/70 blur-3xl" />
        </div>


        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-24">
          {/* COPY */}

          <div>
            <Badge
              variant="outline"
              className="rounded-full border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700"
            >
              Our Services
            </Badge>


            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
              What do you need us to
              <span className="text-blue-600">
                {" "}
                handle for you?
              </span>
            </h1>


            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Seekers Connect 247 helps with everyday errands,
              pickups and deliveries, shopping requests and document
              services — including supported university document
              requests.
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


            <div className="mt-9 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-2xl font-semibold text-slate-950">
                  {
                    generalServices.length
                  }
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  General services
                </p>
              </div>


              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-2xl font-semibold text-slate-950">
                  {
                    academicProviders.length
                  }
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Supported institutions
                </p>
              </div>


              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-2xl font-semibold text-slate-950">
                  {
                    academicServiceCount
                  }
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Academic services
                </p>
              </div>
            </div>
          </div>


          {/* IMAGE */}

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-6 -z-10 rounded-[44px] bg-blue-100/70 blur-2xl" />


            <div className="overflow-hidden rounded-[32px] border border-white/80 bg-slate-950 shadow-[0_25px_80px_rgba(15,23,42,0.16)]">
              <div className="relative aspect-[5/4]">
                <Image
                  src="/delivery.png"
                  alt="Seekers Connect delivery service"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover"
                />


                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />


                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
                    More than document requests
                  </p>


                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    Errands, shopping, pickup and delivery.
                  </h2>


                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-200">
                    One request flow for the everyday tasks you need
                    handled.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          GENERAL SERVICES
      =================================================== */}

      <section className="bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
              Errands & Delivery
            </p>


            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Start with what you need done.
            </h2>


            <p className="mt-4 leading-7 text-slate-600">
              Choose one of our general services. The request form
              will automatically ask for the information required for
              that specific task.
            </p>
          </div>


          {generalServices.length >
          0 ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {generalServices.map(
                (
                  service,
                ) => {
                  const Icon =
                    getGeneralServiceIcon(
                      service.slug,
                    );


                  const features =
                    getGeneralServiceFeatures(
                      service.slug,
                    );


                  return (
                    <Link
                      key={
                        service.id
                      }
                      href="/request"
                      className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60 sm:p-7"
                    >
                      <div className="flex items-start justify-between gap-5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                          <Icon className="h-5 w-5" />
                        </div>


                        <ArrowRight className="mt-2 h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                      </div>


                      <h3 className="mt-6 text-xl font-semibold text-slate-950">
                        {
                          service.name
                        }
                      </h3>


                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {service.description ||
                          "Request this service from Seekers Connect 247."}
                      </p>


                      {features.length >
                        0 && (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {features.map(
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
                      )}


                      <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                        Start request

                        <ArrowRight className="h-4 w-4" />
                      </p>
                    </Link>
                  );
                },
              )}
            </div>
          ) : (
            <div className="mt-10 rounded-[26px] border border-dashed border-slate-300 bg-white p-10 text-center">
              <Package className="mx-auto h-8 w-8 text-slate-400" />

              <p className="mt-4 font-semibold text-slate-800">
                General services are temporarily unavailable.
              </p>
            </div>
          )}
        </div>
      </section>


      {/* ===================================================
          SHOP FOR ME FEATURE
      =================================================== */}

      <section className="overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          {/* IMAGE */}

          <div className="relative">
            <div className="absolute -left-10 -top-8 h-48 w-48 rounded-full bg-blue-100 blur-3xl" />


            <div className="relative overflow-hidden rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="relative aspect-[5/4]">
                <Image
                  src="/pick-up.jpg"
                  alt="Seekers Connect pickup and shopping assistance"
                  fill
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover"
                />


                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />


                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-slate-950/60 p-4 text-white backdrop-blur">
                  <p className="text-sm font-semibold">
                    Need us to get something for you?
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-300">
                    Send the shopping list, quantity, preferences and
                    destination.
                  </p>
                </div>
              </div>
            </div>
          </div>


          {/* SHOPPING COPY */}

          <div>
            <Badge
              variant="outline"
              className="rounded-full border-blue-200 bg-blue-50 text-blue-700"
            >
              Shop For Me
            </Badge>


            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Tell us what to buy. We will handle the errand.
            </h2>


            <p className="mt-4 max-w-xl leading-7 text-slate-600">
              Shopping requests are handled as errands. Add your list,
              useful preferences and estimated budget, then provide
              the delivery information.
            </p>


            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[22px] border border-slate-200 bg-white p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShoppingBasket className="h-5 w-5" />
                </div>

                <h3 className="mt-4 font-semibold text-slate-950">
                  Groceries
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Food, household items and everyday essentials.
                </p>
              </div>


              <div className="rounded-[22px] border border-slate-200 bg-white p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <BookOpen className="h-5 w-5" />
                </div>

                <h3 className="mt-4 font-semibold text-slate-950">
                  Books
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Textbooks, novels and other requested titles.
                </p>
              </div>


              <div className="rounded-[22px] border border-slate-200 bg-white p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText className="h-5 w-5" />
                </div>

                <h3 className="mt-4 font-semibold text-slate-950">
                  Stationery
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Pens, notebooks, paper and school or office supplies.
                </p>
              </div>
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
              Start Shopping Request

              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>


      {/* ===================================================
          DOCUMENT SERVICES
      =================================================== */}

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <Badge className="rounded-full bg-blue-500/15 text-blue-300 hover:bg-blue-500/15">
                Document Services
              </Badge>


              <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                Documents are one part of what we handle.
              </h2>


              <p className="mt-4 max-w-xl leading-7 text-slate-400">
                Ask us to submit, collect, pick up or deliver a
                document. Academic document processing is available
                for supported universities.
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
                Request Document Service

                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>


            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title:
                    "Submit a Document",

                  description:
                    "Let our team submit a document to an office, institution or organization.",
                },

                {
                  title:
                    "Collect a Document",

                  description:
                    "Provide the collection details and contact information required for pickup.",
                },

                {
                  title:
                    "Document Delivery",

                  description:
                    "Request delivery of documents to a specified recipient or destination.",
                },

                {
                  title:
                    "Academic Documents",

                  description:
                    "Request transcripts, attestations, proficiency letters and other supported documents.",
                },
              ].map(
                (
                  item,
                ) => (
                  <div
                    key={
                      item.title
                    }
                    className="rounded-[24px] border border-white/10 bg-white/[0.05] p-6"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                      <FileText className="h-5 w-5" />
                    </div>

                    <h3 className="mt-5 font-semibold">
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
                ),
              )}
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          ACADEMIC CATALOG
      =================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
              Academic Document Services
            </p>


            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Services available by institution.
            </h2>


            <p className="mt-4 leading-7 text-slate-600">
              Select your university when starting the request. The
              form will show only the services and information
              configured for that institution.
            </p>
          </div>


          {academicProviders.length >
          0 ? (
            <div className="mt-12 space-y-6">
              {academicProviders.map(
                (
                  university,
                ) => (
                  <div
                    key={
                      university.id
                    }
                    className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="flex flex-col gap-5 border-b border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                      <div className="flex items-center gap-4">
                        <UniversityLogo
                          code={
                            university.code
                          }
                          name={
                            university.name
                          }
                          className="h-16 w-16 shrink-0"
                        />


                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-950">
                              {
                                university.name
                              }
                            </h3>


                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                              {
                                university.code
                              }
                            </span>
                          </div>


                          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="h-3.5 w-3.5" />

                            {
                              university.location ||
                              "Ghana"
                            }
                          </div>
                        </div>
                      </div>


                      <p className="text-xs font-medium text-slate-400">
                        {
                          university.services.length
                        }{" "}
                        service
                        {university.services.length ===
                        1
                          ? ""
                          : "s"}
                      </p>
                    </div>


                    <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
                      {university.services.map(
                        (
                          service,
                        ) => (
                          <Link
                            key={
                              service.id
                            }
                            href="/request"
                            className="group rounded-[22px] border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              <FileText className="h-4 w-4" />
                            </div>


                            <h4 className="mt-4 font-semibold text-slate-950">
                              {
                                service.name
                              }
                            </h4>


                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {service.description ||
                                "Academic document request service."}
                            </p>


                            <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-blue-600">
                              Start request

                              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                            </div>
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="mt-10 rounded-[26px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <Building2 className="mx-auto h-8 w-8 text-slate-400" />

              <p className="mt-4 font-semibold text-slate-800">
                No academic services are currently available.
              </p>
            </div>
          )}
        </div>
      </section>


      {/* ===================================================
          FINAL CTA
      =================================================== */}

      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[32px] bg-blue-600 p-7 text-white sm:p-10 lg:p-12">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-blue-200">
                  Ready when you are
                </p>


                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Tell us what you need handled.
                </h2>


                <p className="mt-3 leading-7 text-blue-100">
                  Start an errand, shopping, delivery or document
                  request without creating an account.
                </p>
              </div>


              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/request"
                  className={buttonVariants({
                    size:
                      "lg",

                    className:
                      "rounded-xl bg-white text-blue-700 hover:bg-blue-50",
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
                      "rounded-xl border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
                  })}
                >
                  Track Request
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}