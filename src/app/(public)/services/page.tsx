import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Search,
} from "lucide-react";

import {
  buttonVariants,
} from "@/components/ui/button";

import {
  UniversityLogo,
} from "@/components/public/university-logo";

import {
  getPublicServiceCatalog,
  type PublicServiceSummary,
} from "@/lib/catalog/public-service-catalog";


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


  const generalServices =
    generalProvider
      ?.services ??
    [];


  const academicProviders =
    catalog.filter(
      (
        provider,
      ) =>
        provider.code !==
        "SC247",
    );


  // =======================================================
  // UNIQUE ACADEMIC SERVICE TYPES
  // =======================================================

  const academicServiceMap =
    new Map<
      string,
      {
        service:
          PublicServiceSummary;

        universities:
          string[];
      }
    >();


  for (
    const university of
    academicProviders
  ) {
    for (
      const service of
      university.services
    ) {
      const key =
        `${service.slug}:${service.name}`
          .trim()
          .toLowerCase();


      const existing =
        academicServiceMap.get(
          key,
        );


      if (
        existing
      ) {
        if (
          !existing.universities.includes(
            university.code,
          )
        ) {
          existing.universities.push(
            university.code,
          );
        }


        continue;
      }


      academicServiceMap.set(
        key,
        {
          service,

          universities: [
            university.code,
          ],
        },
      );
    }
  }


  const academicServiceTypes =
    Array.from(
      academicServiceMap.values(),
    );


  const totalServices =
    generalServices.length +
    academicServiceTypes.length;


  // =======================================================
  // GENERAL SERVICE GROUPS
  // =======================================================

  const groups =
    buildServiceGroups(
      generalServices,
    );


  // =======================================================
  // FEATURED / IMPORTANT SERVICES
  // =======================================================

  const priorityServices =
    [
      findService(
        generalServices,
        [
          "government-worker-loans",
          "government worker loan",
          "loan",
        ],
      ),

      findService(
        generalServices,
        [
          "study-abroad-support",
          "study abroad",
          "scholarship",
        ],
      ),

      findService(
        generalServices,
        [
          "printing",
          "printing service",
        ],
      ),

      findService(
        generalServices,
        [
          "affidavit",
        ],
      ),

      findService(
        generalServices,
        [
          "gazette",
        ],
      ),

      findService(
        generalServices,
        [
          "plagiarism-check",
          "plagiarism",
        ],
      ),

      findService(
        generalServices,
        [
          "research-guidance",
          "research guidance",
        ],
      ),

      findService(
        generalServices,
        [
          "job-seekers",
          "job seekers",
        ],
      ),
    ].filter(
      (
        service,
      ): service is
        PublicServiceSummary =>
        Boolean(
          service,
        ),
    );


  return (
    <>
      {/* ===================================================
          HERO — SERVICE DIRECTORY STYLE
      =================================================== */}

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(37,99,235,0.22),transparent_34%),radial-gradient(circle_at_8%_80%,rgba(14,165,233,0.12),transparent_30%)]" />


        <div className="relative mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          {/* ===============================================
              DIRECTORY TOP BAR
          =============================================== */}

          <div className="flex flex-col gap-5 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
                <span className="h-px w-8 bg-blue-400" />

                Service Directory
              </div>


              <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-5xl lg:text-[66px]">
                Find the service you need.

                <span className="block text-slate-400">
                  Everything is listed here.
                </span>
              </h1>
            </div>


            <div className="max-w-md">
              <p className="text-sm leading-7 text-slate-400">
                Browse every active Seekers Connect service — from
                Government Worker Loans and academic documents to
                scholarship support, printing, legal services,
                applications, errands and delivery.
              </p>


              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/request"
                  className="inline-flex h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Start a Request

                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>


                <Link
                  href="/track"
                  className="inline-flex h-11 items-center rounded-xl border border-white/15 bg-white/[0.06] px-5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Track Request
                </Link>
              </div>
            </div>
          </div>


          {/* ===============================================
              SERVICE INDEX / HERO VISUAL
          =============================================== */}

          <div className="grid gap-6 pt-8 lg:grid-cols-[0.82fr_1.18fr]">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[26px] border border-white/10 bg-white/10">
              <HeroStat
                value={
                  generalServices.length
                }
                label="General services"
              />

              <HeroStat
                value={
                  academicServiceTypes.length
                }
                label="Academic service types"
              />

              <HeroStat
                value={
                  academicProviders.length
                }
                label="Supported institutions"
              />

              <HeroStat
                value={
                  totalServices
                }
                label="Service types visible"
              />
            </div>


            <div className="grid grid-cols-3 gap-3">
              <HeroImage
                src="/printing-and-other-services.jpg"
                label="Printing & Documents"
                className="min-h-[245px]"
              />

              <HeroImage
                src="/proof-of-someone-acceptance-scholarship.jpg"
                label="Study & Scholarship"
                className="min-h-[245px]"
              />

              <HeroImage
                src="/company-official-flier.jpg"
                label="Applications & Support"
                className="min-h-[245px]"
              />
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          QUICK SERVICE INDEX
      =================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Jump to
            </span>


            {groups.map(
              (
                group,
              ) => (
                <a
                  key={
                    group.id
                  }
                  href={`#${group.id}`}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  {
                    group.name
                  }

                  <span className="ml-2 text-slate-400">
                    {
                      group.services
                        .length
                    }
                  </span>
                </a>
              ),
            )}


            {academicServiceTypes.length >
              0 && (
              <a
                href="#academic-services"
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                Academic Services

                <span className="ml-2 text-slate-400">
                  {
                    academicServiceTypes.length
                  }
                </span>
              </a>
            )}
          </div>
        </div>
      </section>


      {/* ===================================================
          IMPORTANT SERVICES
      =================================================== */}

      {priorityServices.length >
        0 && (
        <section className="bg-[#f7f8fb]">
          <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Popular & Important Services
                </p>


                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-slate-950">
                  Start with one of these.
                </h2>


                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Key services customers frequently need are highlighted
                  here, but every active service remains available below.
                </p>
              </div>


              <Link
                href="/request"
                className="inline-flex items-center text-sm font-semibold text-blue-600"
              >
                Open request form

                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>


            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {priorityServices.map(
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
                    prominent
                  />
                ),
              )}
            </div>
          </div>
        </section>
      )}


      {/* ===================================================
          ALL GENERAL SERVICES
      =================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-blue-600">
              Complete Service Directory
            </p>


            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              All general services.
            </h2>


            <p className="mt-4 text-sm leading-7 text-slate-500">
              This section is generated from the active services in
              the database. When a new general service is activated by
              the admin, it automatically appears here.
            </p>
          </div>


          {groups.length >
          0 ? (
            <div className="mt-12 space-y-16">
              {groups.map(
                (
                  group,
                ) => (
                  <section
                    key={
                      group.id
                    }
                    id={
                      group.id
                    }
                    className="scroll-mt-28"
                  >
                    <div className="grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
                      {/* ===================================
                          GROUP LABEL
                      =================================== */}

                      <div>
                        <div className="lg:sticky lg:top-28">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                            Service Category
                          </p>


                          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                            {
                              group.name
                            }
                          </h3>


                          <p className="mt-3 text-sm leading-6 text-slate-500">
                            {
                              getGroupDescription(
                                group.id,
                              )
                            }
                          </p>


                          <p className="mt-5 text-xs font-medium text-slate-400">
                            {
                              group.services
                                .length
                            }{" "}

                            {group.services
                              .length ===
                            1
                              ? "service"
                              : "services"}
                          </p>
                        </div>
                      </div>


                      {/* ===================================
                          CARDS
                      =================================== */}

                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {group.services.map(
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
                    </div>
                  </section>
                ),
              )}
            </div>
          ) : (
            <div className="mt-10 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <p className="font-semibold text-slate-800">
                General services are currently being updated.
              </p>
            </div>
          )}
        </div>
      </section>


      {/* ===================================================
          STUDY ABROAD / SCHOLARSHIP FEATURE
      =================================================== */}

      <section className="overflow-hidden bg-slate-950 text-white">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[470px]">
            <Image
              src="/proof-of-someone-acceptance-scholarship.jpg"
              alt="Study abroad and scholarship support"
              fill
              sizes="(max-width: 1024px) 100vw, 700px"
              className="object-cover"
            />


            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-950/20 to-slate-950 lg:bg-gradient-to-r" />
          </div>


          <div className="flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
            <p className="text-sm font-semibold text-blue-300">
              Study Abroad & Scholarship Support
            </p>


            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Looking for the next academic opportunity?
            </h2>


            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
              Seekers Connect can support students with institution and
              programme searches, application guidance, document
              preparation and study-abroad enquiries. Scholarship-related
              opportunities and application guidance can be discussed as
              part of the support process.
            </p>


            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "University and programme search",
                "Application guidance",
                "Document preparation support",
                "Scholarship opportunity guidance",
              ].map(
                (
                  item,
                ) => (
                  <div
                    key={
                      item
                    }
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-4"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-300" />

                    <span className="text-sm text-slate-300">
                      {
                        item
                      }
                    </span>
                  </div>
                ),
              )}
            </div>


            <Link
              href="/request"
              className="mt-8 inline-flex h-11 w-fit items-center rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Request Study Abroad Support

              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>


      {/* ===================================================
          GOVERNMENT WORKER LOANS FEATURE
      =================================================== */}

      <section className="bg-[#f4f7ff]">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid overflow-hidden rounded-[30px] border border-blue-100 bg-white shadow-[0_24px_70px_rgba(37,99,235,0.08)] lg:grid-cols-[1fr_0.82fr]">
            <div className="p-7 sm:p-10 lg:p-12">
              <p className="text-sm font-semibold text-blue-600">
                Government Worker Loans
              </p>


              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
                Structured loan application support for government workers.
              </h2>


              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600">
                Submit the information and supporting documents needed
                for direct-bank, Controller-related, payoff or refinance
                loan application workflows.
              </p>


              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  "Direct bank loan applications",
                  "Controller-related loan applications",
                  "Payoff / settlement support",
                  "Refinance applications",
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

                      <span className="text-sm leading-6 text-slate-600">
                        {
                          item
                        }
                      </span>
                    </div>
                  ),
                )}
              </div>


              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs leading-6 text-amber-900">
                  Seekers Connect will never ask you to submit your bank
                  PIN, mobile-money PIN, mandate PIN, password, OTP or
                  another authentication secret.
                </p>
              </div>


              <Link
                href="/request"
                className={buttonVariants({
                  size:
                    "lg",

                  className:
                    "mt-7 rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-700",
                })}
              >
                Start Loan Request

                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>


            <div className="relative min-h-[380px] bg-slate-100">
              <Image
                src="/office-of-seekers.jpg"
                alt="Seekers Connect Government Worker Loan support"
                fill
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover"
              />


              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/55 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          ACADEMIC SERVICES
      =================================================== */}

      <section
        id="academic-services"
        className="scroll-mt-24 bg-white"
      >
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <div className="lg:sticky lg:top-28">
                <p className="text-sm font-semibold text-blue-600">
                  Academic Services
                </p>


                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950">
                  University services in one directory.
                </h2>


                <p className="mt-4 text-sm leading-7 text-slate-500">
                  Academic services are displayed once here with the
                  institutions where each one is currently available.
                </p>


                <div className="relative mt-7 aspect-[16/9] overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
                  <Image
                    src="/universities-logos-together.png"
                    alt="Supported universities"
                    fill
                    sizes="460px"
                    className="object-contain p-5"
                  />
                </div>
              </div>
            </div>


            {academicServiceTypes.length >
            0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {academicServiceTypes.map(
                  (
                    entry,
                  ) => (
                    <article
                      key={
                        `${entry.service.slug}-${entry.service.id}`
                      }
                      className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50"
                    >
                      <div className="relative aspect-[16/8] overflow-hidden bg-slate-100">
                        <Image
                          src={
                            getServiceImage(
                              entry.service,
                            )
                          }
                          alt={
                            entry.service.name
                          }
                          fill
                          sizes="(max-width: 768px) 100vw, 420px"
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        />


                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />


                        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-700 backdrop-blur">
                          Academic Service
                        </span>
                      </div>


                      <div className="p-5">
                        <h3 className="font-semibold text-slate-950">
                          {
                            entry.service.name
                          }
                        </h3>


                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {entry.service
                            .description ||
                            "Academic document request service available through supported institutions."}
                        </p>


                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {entry.universities.map(
                            (
                              code,
                            ) => (
                              <span
                                key={
                                  code
                                }
                                className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700"
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
                          className="mt-5 inline-flex items-center text-xs font-semibold text-blue-600"
                        >
                          Start request

                          <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <p className="font-semibold text-slate-800">
                  Academic services are currently being updated.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>


      {/* ===================================================
          INSTITUTIONS
      =================================================== */}

      {academicProviders.length >
        0 && (
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  Supported Institutions
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  Choose the institution linked to your request.
                </h2>
              </div>


              <p className="max-w-lg text-sm leading-6 text-slate-500">
                The request wizard automatically shows only the
                academic services configured for the institution you
                select.
              </p>
            </div>


            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {academicProviders.map(
                (
                  university,
                ) => (
                  <div
                    key={
                      university.id
                    }
                    className="rounded-[22px] border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-center gap-4">
                      <UniversityLogo
                        code={
                          university.code
                        }
                        name={
                          university.name
                        }
                        className="h-14 w-14 shrink-0"
                      />


                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate font-semibold text-slate-950">
                            {
                              university.name
                            }
                          </h3>


                          <span className="rounded-md bg-blue-50 px-2 py-1 text-[9px] font-semibold text-blue-700">
                            {
                              university.code
                            }
                          </span>
                        </div>


                        {university.location && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                            <MapPin className="h-3.5 w-3.5" />

                            {
                              university.location
                            }
                          </div>
                        )}
                      </div>
                    </div>


                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <p className="text-xs font-medium text-slate-400">
                        {
                          university.services
                            .length
                        }{" "}

                        academic{" "}

                        {university.services
                          .length ===
                        1
                          ? "service"
                          : "services"}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
      )}


      {/* ===================================================
          CAN'T FIND SERVICE
      =================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-[30px] bg-blue-600 lg:grid-cols-[1fr_0.55fr]">
            <div className="p-7 text-white sm:p-10 lg:p-12">
              <p className="text-sm font-semibold text-blue-100">
                Still not sure which service to choose?
              </p>


              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Tell us what you need done.
              </h2>


              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">
                The directory above contains all currently active
                services. If your request overlaps several areas,
                contact us or begin a request and select the closest
                service option.
              </p>


              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/request"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                >
                  Request a Service

                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>


                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white hover:bg-white/15"
                >
                  Contact Support
                </Link>
              </div>
            </div>


            <div className="relative min-h-[290px]">
              <Image
                src="/most-services.jpg"
                alt="Seekers Connect available services"
                fill
                sizes="520px"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-600/25 to-transparent" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


// =========================================================
// HERO STAT
// =========================================================

function HeroStat({
  value,
  label,
}: {
  value:
    number;

  label:
    string;
}) {
  return (
    <div className="bg-white/[0.045] p-5 sm:p-6">
      <p className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {
          value
        }
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        {
          label
        }
      </p>
    </div>
  );
}


// =========================================================
// HERO IMAGE
// =========================================================

function HeroImage({
  src,
  label,
  className,
}: {
  src:
    string;

  label:
    string;

  className?:
    string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[22px] border border-white/10 bg-slate-900 ${className ?? ""}`}
    >
      <Image
        src={
          src
        }
        alt={
          label
        }
        fill
        sizes="420px"
        className="object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />

      <p className="absolute bottom-4 left-4 right-4 text-xs font-semibold text-white">
        {
          label
        }
      </p>
    </div>
  );
}


// =========================================================
// SERVICE CARD
// =========================================================

function ServiceCard({
  service,
  prominent = false,
}: {
  service:
    PublicServiceSummary;

  prominent?:
    boolean;
}) {
  const displayName =
    getDisplayServiceName(
      service,
    );


  return (
    <Link
      href="/request"
      className={`group overflow-hidden rounded-[22px] border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)] ${
        prominent
          ? "shadow-sm"
          : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-slate-100 ${
          prominent
            ? "aspect-[16/10]"
            : "aspect-[16/9]"
        }`}
      >
        <Image
          src={
            getServiceImage(
              service,
            )
          }
          alt={
            displayName
          }
          fill
          sizes="(max-width: 640px) 100vw, 360px"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />


        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />


        {service.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-white">
            Featured
          </span>
        )}


        <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-slate-950/55 px-2.5 py-1 text-[9px] font-semibold text-white backdrop-blur">
          {service.serviceCategoryName ||
            readableCategory(
              service.category,
            )}
        </span>
      </div>


      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold leading-6 text-slate-950">
            {
              displayName
            }
          </h3>


          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>


        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
          {service.description ||
            getFallbackDescription(
              service,
            )}
        </p>


        <p className="mt-5 text-xs font-semibold text-blue-600">
          Start request
        </p>
      </div>
    </Link>
  );
}


// =========================================================
// GENERAL SERVICE GROUPING
// =========================================================

function buildServiceGroups(
  services:
    PublicServiceSummary[],
) {
  const map =
    new Map<
      string,
      {
        id:
          string;

        name:
          string;

        order:
          number;

        services:
          PublicServiceSummary[];
      }
    >();


  for (
    const service of
    services
  ) {
    const id =
      service.serviceCategorySlug ||
      normalizeAnchor(
        service.serviceCategoryName ||
        service.category ||
        "other-services",
      );


    const name =
      service.serviceCategoryName ||
      readableCategory(
        service.category,
      );


    const existing =
      map.get(
        id,
      );


    if (
      existing
    ) {
      existing.services.push(
        service,
      );

      continue;
    }


    map.set(
      id,
      {
        id,

        name,

        order:
          service.displayOrder,

        services: [
          service,
        ],
      },
    );
  }


  return Array.from(
    map.values(),
  )
    .map(
      (
        group,
      ) => ({
        ...group,

        services:
          group.services.sort(
            (
              first,
              second,
            ) =>
              first.displayOrder -
                second.displayOrder ||
              first.name.localeCompare(
                second.name,
              ),
          ),
      }),
    )
    .sort(
      (
        first,
        second,
      ) =>
        first.order -
          second.order ||
        first.name.localeCompare(
          second.name,
        ),
    );
}


// =========================================================
// FIND SERVICE
// =========================================================

function findService(
  services:
    PublicServiceSummary[],

  terms:
    string[],
) {
  for (
    const service of
    services
  ) {
    const value =
      `${service.slug} ${service.name} ${service.shortName}`
        .toLowerCase();


    if (
      terms.some(
        (
          term,
        ) =>
          value.includes(
            term.toLowerCase(),
          ),
      )
    ) {
      return service;
    }
  }


  return null;
}


// =========================================================
// DISPLAY NAME
// =========================================================

function getDisplayServiceName(
  service:
    PublicServiceSummary,
) {
  if (
    service.slug ===
    "study-abroad-support"
  ) {
    return "Study Abroad & Scholarship Support";
  }


  if (
    service.slug ===
    "government-worker-loans"
  ) {
    return "Government Worker Loans";
  }


  if (
    service.slug ===
    "bece-wassce-results"
  ) {
    return "BECE / WASSCE Results";
  }


  if (
    service.slug ===
    "school-nursing-placement"
  ) {
    return "School & Nursing Placement";
  }


  if (
    service.slug ===
    "security-service-applications"
  ) {
    return "Security Service Applications";
  }


  if (
    service.slug ===
    "research-guidance"
  ) {
    return "Thesis & Research Guidance";
  }


  return service.name;
}


// =========================================================
// SERVICE IMAGE
// =========================================================

function getServiceImage(
  service:
    PublicServiceSummary,
) {
  if (
    service.imageUrl
  ) {
    return service.imageUrl;
  }


  const value =
    `${service.slug} ${service.name} ${service.serviceCategorySlug ?? ""}`
      .toLowerCase();


  if (
    value.includes(
      "government-worker-loans",
    ) ||
    value.includes(
      "loan",
    )
  ) {
    return "/office-of-seekers.jpg";
  }


  if (
    value.includes(
      "study-abroad",
    ) ||
    value.includes(
      "scholarship",
    )
  ) {
    return "/proof-of-someone-acceptance-scholarship.jpg";
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
      "transcript",
    ) ||
    value.includes(
      "attestation",
    ) ||
    value.includes(
      "proficiency",
    ) ||
    value.includes(
      "academic",
    )
  ) {
    return "/ceo-with-transcrip-flier.jpg";
  }


  if (
    value.includes(
      "delivery",
    )
  ) {
    return "/seekers-delivery-flier.jpg";
  }


  if (
    value.includes(
      "pickup",
    ) ||
    value.includes(
      "errand",
    ) ||
    value.includes(
      "shop-for-me",
    )
  ) {
    return "/pick-up.jpg";
  }


  if (
    value.includes(
      "job",
    ) ||
    value.includes(
      "security",
    ) ||
    value.includes(
      "application",
    ) ||
    value.includes(
      "placement",
    )
  ) {
    return "/passpost-application-flier.jpg";
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
      "world education",
    ) ||
    value.includes(
      "wes",
    )
  ) {
    return "/world-education-service.jpg";
  }


  return "/most-services.jpg";
}


// =========================================================
// GROUP DESCRIPTION
// =========================================================

function getGroupDescription(
  id:
    string,
) {
  const value =
    id.toLowerCase();


  if (
    value.includes(
      "loan",
    ) ||
    value.includes(
      "financial",
    )
  ) {
    return "Financial application and Government Worker Loan support.";
  }


  if (
    value.includes(
      "legal",
    )
  ) {
    return "Affidavit, Gazette and related documentation support.";
  }


  if (
    value.includes(
      "study",
    ) ||
    value.includes(
      "abroad",
    )
  ) {
    return "Study-abroad, institution, programme and scholarship-related guidance.";
  }


  if (
    value.includes(
      "career",
    ) ||
    value.includes(
      "job",
    )
  ) {
    return "Career, employment and job-seeker support.";
  }


  if (
    value.includes(
      "practicum",
    ) ||
    value.includes(
      "placement",
    )
  ) {
    return "Teaching practicum, placement and related application services.";
  }


  if (
    value.includes(
      "result",
    ) ||
    value.includes(
      "application",
    )
  ) {
    return "Results checking and application-support services.";
  }


  if (
    value.includes(
      "academic",
    )
  ) {
    return "Academic assistance and student-support services.";
  }


  if (
    value.includes(
      "print",
    ) ||
    value.includes(
      "document",
    )
  ) {
    return "Printing, document handling and related support.";
  }


  return "Available Seekers Connect services in this category.";
}


// =========================================================
// FALLBACK DESCRIPTION
// =========================================================

function getFallbackDescription(
  service:
    PublicServiceSummary,
) {
  const value =
    `${service.slug} ${service.name}`
      .toLowerCase();


  if (
    value.includes(
      "loan",
    )
  ) {
    return "Application support for eligible Government Worker Loan requests.";
  }


  if (
    value.includes(
      "study",
    )
  ) {
    return "Study-abroad application, programme search and scholarship guidance.";
  }


  if (
    value.includes(
      "printing",
    )
  ) {
    return "Black-and-white, colour and document printing support.";
  }


  if (
    value.includes(
      "affidavit",
    )
  ) {
    return "Support for affidavit preparation and documentation requests.";
  }


  if (
    value.includes(
      "gazette",
    )
  ) {
    return "Support for Gazette publication and related correction processes.";
  }


  if (
    value.includes(
      "plagiarism",
    )
  ) {
    return "Submit academic work for plagiarism-checking support.";
  }


  if (
    value.includes(
      "research",
    )
  ) {
    return "Research guidance, methodological support and academic consultation.";
  }


  if (
    value.includes(
      "job",
    )
  ) {
    return "Submit your programme, skills and employment interests for job-seeker support.";
  }


  if (
    value.includes(
      "practicum",
    )
  ) {
    return "Teaching practicum form and placement-related support.";
  }


  if (
    value.includes(
      "results",
    )
  ) {
    return "Support for BECE and WASSCE results-related requests.";
  }


  if (
    value.includes(
      "placement",
    )
  ) {
    return "School and nursing placement support.";
  }


  if (
    value.includes(
      "security",
    )
  ) {
    return "Application support for Police, Fire, Immigration, Prisons and related services.";
  }


  return "Request this service through Seekers Connect 247.";
}


// =========================================================
// CATEGORY
// =========================================================

function readableCategory(
  value:
    string,
) {
  return value
    .replaceAll(
      "-",
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


// =========================================================
// ANCHOR
// =========================================================

function normalizeAnchor(
  value:
    string,
) {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}