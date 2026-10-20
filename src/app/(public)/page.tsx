import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  MessageCircle,
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
  HomeTrackingCard,
} from "@/components/public/home-tracking-card";

import {
  FeaturedPublicContent,
} from "@/components/public/featured-public-content";

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
// HOMEPAGE
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


  // =======================================================
  // UNIVERSITIES
  // =======================================================

  const universities =
    loadedUniversities.filter(
      (
        university,
      ) =>
        university.code !==
        "SC247",
    );


  // =======================================================
  // SERVICES
  //
  // We combine all providers/institutions, then remove
  // duplicate service types so the homepage becomes a
  // complete discovery surface instead of repeating the
  // same transcript service five times.
  // =======================================================

  const serviceMap =
    new Map<
      string,
      {
        id:
          string;

        slug:
          string;

        name:
          string;

        shortName:
          string;

        description:
          string | null;

        category:
          string;

        providerCodes:
          string[];
      }
    >();


  for (
    const provider of
    serviceCatalog
  ) {
    for (
      const service of
      provider.services
    ) {
      const key =
        (
          service.slug ||
          service.name
        )
          .trim()
          .toLowerCase();


      const existing =
        serviceMap.get(
          key,
        );


      if (
        existing
      ) {
        if (
          provider.code !==
            "SC247" &&
          !existing
            .providerCodes
            .includes(
              provider.code,
            )
        ) {
          existing
            .providerCodes
            .push(
              provider.code,
            );
        }


        continue;
      }


      serviceMap.set(
        key,
        {
          id:
            service.id,

          slug:
            service.slug,

          name:
            service.name,

          shortName:
            service.shortName,

          description:
            service.description,

          category:
            service.category,

          providerCodes:
            provider.code ===
            "SC247"
              ? []
              : [
                  provider.code,
                ],
        },
      );
    }
  }


  const allServices =
    Array.from(
      serviceMap.values(),
    ).sort(
      (
        first,
        second,
      ) =>
        servicePriority(
          first.slug,
          first.name,
        ) -
          servicePriority(
            second.slug,
            second.name,
          ) ||
        first.name.localeCompare(
          second.name,
        ),
    );


  // =======================================================
  // CONTACT
  // =======================================================

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


  const supportPhone =
    support.phones[0] ||
    "0550414552";


  return (
    <>
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative overflow-hidden border-b border-slate-200 bg-[#f7faff]">
        <div className="absolute inset-0">
          <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-blue-200/35 blur-[90px]" />

          <div className="absolute right-0 top-0 h-[520px] w-[520px] rounded-full bg-sky-200/40 blur-[120px]" />
        </div>


        <div className="relative mx-auto grid max-w-[1440px] gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-[0.84fr_1.16fr] lg:items-center lg:px-8 lg:pb-16 lg:pt-14">
          {/* ===============================================
              HERO COPY
          =============================================== */}

          <div className="relative z-10">
            <Badge
              variant="outline"
              className="rounded-full border-blue-200 bg-white/90 px-3 py-1.5 text-blue-700 shadow-sm"
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />

              Services built around your everyday needs
            </Badge>


            <h1 className="mt-6 max-w-3xl text-[42px] font-semibold leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[64px]">
              Errands, documents and delivery{" "}

              <span className="text-blue-600">
                made simple.
              </span>
            </h1>


            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 lg:text-[17px]">
              Seekers Connect 247 helps you handle academic documents,
              errands, pickup and delivery, printing, applications,
              loans, legal documentation, study abroad support and
              other important services from one place.
            </p>


            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/request"
                className={buttonVariants({
                  size:
                    "lg",

                  className:
                    "h-12 rounded-xl bg-blue-600 px-6 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700",
                })}
              >
                Request a Service

                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>


              <Link
                href="#track-request"
                className={buttonVariants({
                  variant:
                    "outline",

                  size:
                    "lg",

                  className:
                    "h-12 rounded-xl border-blue-200 bg-white px-6 text-blue-700",
                })}
              >
                Track Request
              </Link>
            </div>


            <div className="mt-8 grid max-w-xl grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
              <div className="px-3 first:pl-0">
                <p className="text-xl font-semibold text-slate-950">
                  {
                    allServices.length
                  }
                </p>

                <p className="mt-1 text-[11px] leading-4 text-slate-500">
                  Available services
                </p>
              </div>


              <div className="px-3">
                <p className="text-xl font-semibold text-slate-950">
                  {
                    universities.length
                  }
                </p>

                <p className="mt-1 text-[11px] leading-4 text-slate-500">
                  Supported institutions
                </p>
              </div>


              <div className="px-3">
                <p className="text-xl font-semibold text-slate-950">
                  No
                </p>

                <p className="mt-1 text-[11px] leading-4 text-slate-500">
                  Account required
                </p>
              </div>
            </div>
          </div>


          {/* ===============================================
              HERO IMAGE COLLAGE
          =============================================== */}

          <div className="relative min-h-[520px] lg:min-h-[560px]">
            <div className="absolute left-[5%] top-[7%] h-[78%] w-[49%] overflow-hidden rounded-[34px] border-[6px] border-white bg-slate-200 shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
              <Image
                src="/office-of-seekers.jpg"
                alt="Seekers Connect office"
                fill
                priority
                sizes="(max-width: 1024px) 50vw, 420px"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />


              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-slate-950/55 p-4 text-white backdrop-blur">
                <p className="text-xs font-medium text-blue-200">
                  One place for your requests
                </p>

                <p className="mt-1 text-lg font-semibold">
                  Real support. Clear processes.
                </p>
              </div>
            </div>


            <div className="absolute right-[2%] top-[2%] h-[31%] w-[43%] rotate-[2deg] overflow-hidden rounded-[24px] border-[6px] border-white bg-slate-100 shadow-xl">
              <Image
                src="/ceo-with-transcrip-flier.jpg"
                alt="Seekers Connect transcript service"
                fill
                sizes="360px"
                className="object-cover"
              />
            </div>


            <div className="absolute right-[1%] top-[35%] h-[27%] w-[37%] -rotate-[2deg] overflow-hidden rounded-[24px] border-[6px] border-white bg-slate-100 shadow-xl">
              <Image
                src="/printing-and-other-services.jpg"
                alt="Seekers Connect printing services"
                fill
                sizes="320px"
                className="object-cover"
              />
            </div>


            <div className="absolute bottom-[4%] right-[5%] h-[31%] w-[45%] rotate-[1deg] overflow-hidden rounded-[24px] border-[6px] border-white bg-slate-100 shadow-xl">
              <Image
                src="/seekers-delivery-flier.jpg"
                alt="Seekers Connect delivery service"
                fill
                sizes="360px"
                className="object-cover"
              />
            </div>


            <div className="absolute bottom-[1%] left-[0%] w-[42%] rounded-[22px] border border-slate-200 bg-white p-4 shadow-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-600">
                Seekers Connect 247
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                From academic documents to everyday errands.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white">
                  <Image
                    src="/seekersconnect-logo.jpg"
                    alt=""
                    fill
                    className="object-contain"
                  />
                </div>

                <p className="text-xs text-slate-500">
                  Your needs. Our support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          ALL SERVICES
      =================================================== */}

      <section
        id="services"
        className="border-b border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Explore Our Services
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
                Everything we can help you with.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                No hidden tabs. Browse the services available on the
                platform and start the one you need.
              </p>
            </div>


            <Link
              href="/request"
              className="inline-flex items-center text-sm font-semibold text-blue-600"
            >
              Start a request

              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>


          {allServices.length >
          0 ? (
            <div className="mt-9 grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {allServices.map(
                (
                  service,
                ) => (
                  <Link
                    key={
                      service.id
                    }
                    href="/request"
                    className="group overflow-hidden rounded-[22px] border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_50px_rgba(15,23,42,0.10)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <Image
                        src={
                          getServiceImage(
                            service.slug,
                            service.name,
                            service.category,
                          )
                        }
                        alt={
                          service.name
                        }
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 260px"
                        className="object-cover transition duration-500 group-hover:scale-[1.04]"
                      />


                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />


                      <span className="absolute bottom-3 left-3 rounded-full border border-white/30 bg-slate-950/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                        {service.providerCodes.length >
                        0
                          ? "Academic"
                          : "General"}
                      </span>
                    </div>


                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-[15px] font-semibold leading-5 text-slate-950">
                          {
                            service.name
                          }
                        </h3>


                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>


                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                        {service.description ||
                          getFallbackServiceDescription(
                            service.slug,
                            service.name,
                          )}
                      </p>


                      {service
                        .providerCodes
                        .length >
                        0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {service
                            .providerCodes
                            .slice(
                              0,
                              4,
                            )
                            .map(
                              (
                                code,
                              ) => (
                                <span
                                  key={
                                    code
                                  }
                                  className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-500"
                                >
                                  {
                                    code
                                  }
                                </span>
                              ),
                            )}


                          {service
                            .providerCodes
                            .length >
                            4 && (
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-semibold text-slate-500">
                              +
                              {service
                                .providerCodes
                                .length -
                                4}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                ),
              )}
            </div>
          ) : (
            <div className="mt-9 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <p className="font-semibold text-slate-800">
                Services are being updated.
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Contact Seekers Connect for current service availability.
              </p>
            </div>
          )}
        </div>
      </section>


      {/* ===================================================
          EXPERIENCE / IMAGE STORY
      =================================================== */}

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-[1440px] gap-5 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-20">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative min-h-[470px] overflow-hidden rounded-[30px] bg-slate-200 sm:row-span-2">
              <Image
                src="/most-services.jpg"
                alt="Seekers Connect services"
                fill
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/5 to-transparent" />


              <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-200">
                  More than one kind of service
                </p>

                <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-tight">
                  One platform for the things that usually take too much time.
                </h2>
              </div>
            </div>


            <div className="relative min-h-[225px] overflow-hidden rounded-[26px] bg-slate-200">
              <Image
                src="/passpost-application-flier.jpg"
                alt="Application support"
                fill
                sizes="420px"
                className="object-cover"
              />
            </div>


            <div className="relative min-h-[225px] overflow-hidden rounded-[26px] bg-slate-200">
              <Image
                src="/proof-of-someone-acceptance-scholarship.jpg"
                alt="Study abroad and scholarship support"
                fill
                sizes="420px"
                className="object-cover"
              />
            </div>
          </div>


          <div className="flex flex-col justify-center rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
            <p className="text-sm font-semibold text-blue-600">
              Making complicated tasks easier
            </p>


            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              You tell us what needs to happen. We help move it forward.
            </h2>


            <p className="mt-5 text-sm leading-7 text-slate-600">
              Some requests involve a university. Others involve
              documents, delivery, applications, printing, errands,
              shopping or third-party institutions. The platform gives
              each service a structured request process instead of
              forcing every customer through the same form.
            </p>


            <div className="mt-8 grid gap-3">
              {[
                "Choose the exact service you need.",
                "Provide only the information required for that service.",
                "Upload supporting documents securely when required.",
                "Follow the request through tracking after credentials are issued.",
              ].map(
                (
                  item,
                ) => (
                  <div
                    key={
                      item
                    }
                    className="flex items-start gap-3 rounded-xl bg-slate-50 p-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                    <p className="text-sm leading-6 text-slate-600">
                      {
                        item
                      }
                    </p>
                  </div>
                ),
              )}
            </div>


            <Link
              href="/request"
              className={buttonVariants({
                size:
                  "lg",

                className:
                  "mt-8 w-fit rounded-xl bg-slate-950 px-6 text-white hover:bg-slate-800",
              })}
            >
              Start Your Request

              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>


      {/* ===================================================
          TRACKING
      =================================================== */}

      <section className="bg-white py-16 lg:py-20">
        <HomeTrackingCard />
      </section>


      {/* ===================================================
          HOW IT WORKS
      =================================================== */}

      <section className="border-y border-slate-200 bg-[#f7faff]">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                How Seekers Connect Works
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Clear from the first step.
              </h2>
            </div>


            <p className="max-w-xl text-sm leading-6 text-slate-500">
              Different services may ask for different information,
              but the overall request process remains simple.
            </p>
          </div>


          <div className="mt-9 grid gap-3 lg:grid-cols-4">
            {[
              {
                number:
                  "01",

                title:
                  "Choose a service",

                description:
                  "Browse the full service list and choose exactly what you need.",
              },

              {
                number:
                  "02",

                title:
                  "Submit the details",

                description:
                  "Complete the service-specific form and attach documents where necessary.",
              },

              {
                number:
                  "03",

                title:
                  "Payment or quotation",

                description:
                  "Follow the applicable payment or quotation process for the selected service.",
              },

              {
                number:
                  "04",

                title:
                  "Track progress",

                description:
                  "Use your tracking details to follow the request through completion.",
              },
            ].map(
              (
                step,
              ) => (
                <div
                  key={
                    step.number
                  }
                  className="relative overflow-hidden rounded-[22px] border border-slate-200 bg-white p-6"
                >
                  <span className="text-[44px] font-semibold leading-none tracking-[-0.06em] text-blue-100">
                    {
                      step.number
                    }
                  </span>


                  <h3 className="mt-6 font-semibold text-slate-950">
                    {
                      step.title
                    }
                  </h3>


                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {
                      step.description
                    }
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>


      {/* ===================================================
          INSTITUTIONS
      =================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Supported Institutions
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950">
                Academic support across multiple universities.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-500">
                Academic services are linked to the institutions that
                currently support them, so customers only see
                combinations that are actually available.
              </p>


              <div className="mt-7 relative aspect-[16/8] overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
                <Image
                  src="/universities-logos-together.png"
                  alt="Universities supported by Seekers Connect"
                  fill
                  sizes="520px"
                  className="object-contain p-5"
                />
              </div>
            </div>


            {universities.length >
            0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {universities.map(
                  (
                    university,
                  ) => (
                    <div
                      key={
                        university.id
                      }
                      className="flex min-h-[150px] flex-col items-center justify-center rounded-[22px] border border-slate-200 bg-white p-5 text-center transition hover:border-blue-200 hover:shadow-md"
                    >
                      <UniversityLogo
                        code={
                          university.code
                        }
                        name={
                          university.name
                        }
                        className="h-16 w-16"
                      />


                      <p className="mt-4 text-sm font-semibold text-slate-900">
                        {
                          university.code
                        }
                      </p>


                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-400">
                        {
                          university.name
                        }
                      </p>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
                Institution information is currently being updated.
              </div>
            )}
          </div>
        </div>
      </section>


      {/* ===================================================
          MORE REAL IMAGES
      =================================================== */}

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <ImageStoryCard
              image="/pick-up.jpg"
              title="Pickup & Errands"
              text="Send us the task, location and instructions."
            />


            <ImageStoryCard
              image="/delivery.png"
              title="Delivery"
              text="Move documents, books and permitted items."
            />


            <ImageStoryCard
              image="/world-education-service.jpg"
              title="Education Support"
              text="Support for education and document-related processes."
            />


            <ImageStoryCard
              image="/company-official-flier.jpg"
              title="More Services"
              text="Explore the full range of services managed by the platform."
            />
          </div>
        </div>
      </section>


      {/* ===================================================
          BLOG + TESTIMONIALS
      =================================================== */}

      <FeaturedPublicContent />


      {/* ===================================================
          SUPPORT
      =================================================== */}

      <section className="bg-slate-950">
        <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.72fr] lg:px-8 lg:py-20">
          <div className="relative min-h-[420px] overflow-hidden rounded-[30px]">
            <Image
              src="/office-of-seekers.jpg"
              alt="Seekers Connect customer support"
              fill
              sizes="(max-width: 1024px) 100vw, 760px"
              className="object-cover"
            />


            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/15" />


            <div className="relative flex min-h-[420px] max-w-xl flex-col justify-end p-7 text-white sm:p-10">
              <p className="text-sm font-semibold text-blue-300">
                Need help?
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Talk to a real support person.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                Ask about service requirements, an existing request,
                payment verification, document submission or delivery.
              </p>


              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />

                  WhatsApp Us
                </a>


                <a
                  href={`tel:${supportPhone}`}
                  className="inline-flex h-11 items-center rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur hover:bg-white/15"
                >
                  Call{" "}

                  {
                    supportPhone
                  }
                </a>
              </div>
            </div>
          </div>


          <div className="grid gap-4">
            <div className="relative min-h-[200px] overflow-hidden rounded-[26px]">
              <Image
                src="/5927016763990150890_121.jpg"
                alt="Seekers Connect service information"
                fill
                sizes="500px"
                className="object-cover"
              />
            </div>


            <div className="rounded-[26px] border border-white/10 bg-white/[0.06] p-7 text-white">
              <FileCheck2 className="h-5 w-5 text-blue-300" />

              <h3 className="mt-5 text-xl font-semibold">
                Ready to get something handled?
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Start with the service you need and the request wizard
                will guide you through the required information.
              </p>


              <Link
                href="/request"
                className="mt-6 inline-flex items-center text-sm font-semibold text-blue-300"
              >
                Start a Request

                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


// =========================================================
// IMAGE STORY CARD
// =========================================================

function ImageStoryCard({
  image,
  title,
  text,
}: {
  image:
    string;

  title:
    string;

  text:
    string;
}) {
  return (
    <div className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={
            image
          }
          alt={
            title
          }
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
      </div>


      <div className="p-5">
        <h3 className="font-semibold text-slate-950">
          {
            title
          }
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {
            text
          }
        </p>
      </div>
    </div>
  );
}


// =========================================================
// SERVICE PRIORITY
//
// Keeps the most recognisable customer-facing services near
// the beginning without hiding any service.
// =========================================================

function servicePriority(
  slug:
    string,

  name:
    string,
) {
  const value =
    `${slug} ${name}`.toLowerCase();


  const priorities = [
    [
      "transcript",
      1,
    ],

    [
      "delivery",
      2,
    ],

    [
      "errand",
      3,
    ],

    [
      "printing",
      4,
    ],

    [
      "loan",
      5,
    ],

    [
      "study-abroad",
      6,
    ],

    [
      "affidavit",
      7,
    ],

    [
      "gazette",
      8,
    ],

    [
      "plagiarism",
      9,
    ],

    [
      "research",
      10,
    ],

    [
      "job",
      11,
    ],

    [
      "practicum",
      12,
    ],

    [
      "result",
      13,
    ],

    [
      "placement",
      14,
    ],

    [
      "security",
      15,
    ],
  ] as const;


  for (
    const [
      keyword,
      priority,
    ] of
    priorities
  ) {
    if (
      value.includes(
        keyword,
      )
    ) {
      return priority;
    }
  }


  return 100;
}


// =========================================================
// SERVICE IMAGE
// =========================================================

function getServiceImage(
  slug:
    string,

  name:
    string,

  category:
    string,
) {
  const value =
    `${slug} ${name} ${category}`
      .toLowerCase();


  if (
    value.includes(
      "transcript",
    ) ||
    value.includes(
      "attestation",
    ) ||
    value.includes(
      "proficiency",
    )
  ) {
    return "/ceo-with-transcrip-flier.jpg";
  }


  if (
    value.includes(
      "delivery",
    ) ||
    value.includes(
      "pickup",
    )
  ) {
    return "/seekers-delivery-flier.jpg";
  }


  if (
    value.includes(
      "errand",
    ) ||
    value.includes(
      "shop",
    )
  ) {
    return "/pick-up.jpg";
  }


  if (
    value.includes(
      "print",
    )
  ) {
    return "/printing-and-other-services.jpg";
  }


  if (
    value.includes(
      "study",
    ) ||
    value.includes(
      "scholar",
    )
  ) {
    return "/proof-of-someone-acceptance-scholarship.jpg";
  }


  if (
    value.includes(
      "passport",
    ) ||
    value.includes(
      "application",
    ) ||
    value.includes(
      "security",
    ) ||
    value.includes(
      "job",
    )
  ) {
    return "/passpost-application-flier.jpg";
  }


  if (
    value.includes(
      "wes",
    ) ||
    value.includes(
      "world education",
    )
  ) {
    return "/world-education-service.jpg";
  }


  if (
    value.includes(
      "loan",
    )
  ) {
    return "/office-of-seekers.jpg";
  }


  if (
    value.includes(
      "affidavit",
    ) ||
    value.includes(
      "gazette",
    ) ||
    value.includes(
      "legal",
    )
  ) {
    return "/company-official-flier.jpg";
  }


  if (
    value.includes(
      "plagiarism",
    ) ||
    value.includes(
      "research",
    ) ||
    value.includes(
      "practicum",
    )
  ) {
    return "/5927016763990150890_121.jpg";
  }


  return "/most-services.jpg";
}


// =========================================================
// FALLBACK DESCRIPTION
// =========================================================

function getFallbackServiceDescription(
  slug:
    string,

  name:
    string,
) {
  const value =
    `${slug} ${name}`
      .toLowerCase();


  if (
    value.includes(
      "delivery",
    )
  ) {
    return "Pickup and delivery support for documents, books and permitted items.";
  }


  if (
    value.includes(
      "print",
    )
  ) {
    return "Printing and document support based on your selected requirements.";
  }


  if (
    value.includes(
      "loan",
    )
  ) {
    return "Structured application support for eligible government workers.";
  }


  if (
    value.includes(
      "study",
    )
  ) {
    return "Application and document guidance for study-abroad opportunities.";
  }


  if (
    value.includes(
      "research",
    )
  ) {
    return "Academic research guidance, review and methodological support.";
  }


  return "Submit your request and follow the service-specific process provided by Seekers Connect 247.";
}