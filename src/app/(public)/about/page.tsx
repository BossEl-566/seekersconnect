import type {
  Metadata,
} from "next";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  getPublishedSitePage,
} from "@/lib/content/site-pages";

import {
  buttonVariants,
} from "@/components/ui/button";


// =========================================================
// METADATA
// =========================================================

export async function generateMetadata():
  Promise<Metadata> {
  const page =
    await getPublishedSitePage(
      "about",
    );


  return {
    title:
      page?.seoTitle ||
      "About | Seekers Connect 247",

    description:
      page?.seoDescription ||
      page?.summary ||
      undefined,
  };
}


// =========================================================
// PAGE
// =========================================================

export default async function AboutPage() {
  const page =
    await getPublishedSitePage(
      "about",
    );


  if (
    !page
  ) {
    notFound();
  }


  const ceoName =
    typeof page.metadata
      .ceo_name ===
      "string"
      ? page.metadata
          .ceo_name
      : "Hon. Djangmah Peter Nubuor";


  const ceoTitle =
    typeof page.metadata
      .ceo_title ===
      "string"
      ? page.metadata
          .ceo_title
      : "Chief Executive Officer";


  const ceoImage =
    typeof page.metadata
      .ceo_image_url ===
      "string"
      ? page.metadata
          .ceo_image_url
      : "/ceo-image.jpg";


  const contentBlocks =
    getAboutContentBlocks(
      page.content,
    );


  return (
    <>
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative overflow-hidden border-b border-slate-200 bg-[#f7faff]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-blue-200/40 blur-[110px]" />

          <div className="absolute right-0 top-0 h-[520px] w-[520px] rounded-full bg-sky-200/35 blur-[120px]" />
        </div>


        <div className="relative mx-auto grid max-w-[1440px] gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-8 lg:py-20">
          {/* ===============================================
              COPY
          =============================================== */}

          <div>
            <p className="text-sm font-semibold text-blue-600">
              {page.eyebrow ||
                "About Seekers Connect 247"}
            </p>


            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[62px] lg:leading-[1.05]">
              Making important tasks{" "}

              <span className="text-blue-600">
                easier to get done.
              </span>
            </h1>


            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              {page.summary ||
                "Seekers Connect 247 helps customers handle errands, deliveries, document services and other important requests through one structured platform."}
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
                href="/services"
                className={buttonVariants({
                  variant:
                    "outline",

                  size:
                    "lg",

                  className:
                    "h-12 rounded-xl border-slate-200 bg-white px-6",
                })}
              >
                Explore Services
              </Link>
            </div>


            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {[
                "No account required",
                "Multiple service areas",
                "Request tracking",
              ].map(
                (
                  item,
                ) => (
                  <div
                    key={
                      item
                    }
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-3 text-xs font-medium text-slate-600 shadow-sm backdrop-blur"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />

                    {
                      item
                    }
                  </div>
                ),
              )}
            </div>
          </div>


          {/* ===============================================
              IMAGE COLLAGE
          =============================================== */}

          <div className="relative min-h-[520px]">
            <div className="absolute left-[2%] top-[4%] h-[78%] w-[58%] overflow-hidden rounded-[34px] border-[6px] border-white bg-slate-200 shadow-[0_30px_80px_rgba(15,23,42,0.16)]">
              <Image
                src="/office-of-seekers.jpg"
                alt="Seekers Connect office"
                fill
                priority
                sizes="(max-width: 1024px) 60vw, 500px"
                className="object-cover"
              />


              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />


              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-200">
                  Seekers Connect 247
                </p>

                <p className="mt-2 text-xl font-semibold">
                  Built around real customer needs.
                </p>
              </div>
            </div>


            <div className="absolute right-[1%] top-[2%] h-[34%] w-[39%] rotate-[2deg] overflow-hidden rounded-[24px] border-[6px] border-white bg-slate-100 shadow-xl">
              <Image
                src="/company-official-flier.jpg"
                alt="Seekers Connect company information"
                fill
                sizes="360px"
                className="object-cover"
              />
            </div>


            <div className="absolute bottom-[7%] right-[1%] h-[39%] w-[43%] -rotate-[2deg] overflow-hidden rounded-[24px] border-[6px] border-white bg-slate-100 shadow-xl">
              <Image
                src="/seekers-delivery-flier.jpg"
                alt="Seekers Connect delivery service"
                fill
                sizes="380px"
                className="object-cover"
              />
            </div>


            <div className="absolute bottom-[1%] left-[7%] rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xl">
              <p className="text-xs text-slate-400">
                Our purpose
              </p>

              <p className="mt-1 max-w-[220px] text-sm font-semibold leading-5 text-slate-900">
                Reduce the time and stress involved in important tasks.
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          WHO WE ARE
      =================================================== */}

      <section className="bg-white">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.76fr_1.24fr] lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Who We Are
            </p>


            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              More than a document service.
            </h2>


            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
              Seekers Connect has grown into a platform that supports
              customers across academic services, errands, delivery,
              printing, applications, legal documentation and other
              practical needs.
            </p>
          </div>


          <div className="grid gap-4 sm:grid-cols-3">
            <AboutImageCard
              image="/ceo-with-transcrip-flier.jpg"
              title="Academic Services"
              description="Structured support for transcripts and other institution-based document requests."
            />


            <AboutImageCard
              image="/pick-up.jpg"
              title="Errands & Pickup"
              description="Helping customers handle tasks they may not have the time or ability to complete themselves."
            />


            <AboutImageCard
              image="/printing-and-other-services.jpg"
              title="More Everyday Services"
              description="Printing, applications, delivery and other services managed through one platform."
            />
          </div>
        </div>
      </section>


      {/* ===================================================
          STORY / ADMIN CONTENT
      =================================================== */}

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <div className="sticky top-28">
                <p className="text-sm font-semibold text-blue-600">
                  Our Story
                </p>


                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950">
                  Why Seekers Connect exists.
                </h2>


                <p className="mt-4 text-sm leading-7 text-slate-500">
                  The business is built around a simple idea: important
                  tasks should be easier to request, understand and
                  follow.
                </p>


                <div className="mt-7 relative aspect-[4/3] overflow-hidden rounded-[26px] border border-slate-200 bg-white">
                  <Image
                    src="/most-services.jpg"
                    alt="Seekers Connect services"
                    fill
                    sizes="420px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>


            <div className="space-y-6">
              {contentBlocks.length >
              0 ? (
                contentBlocks.map(
                  (
                    block,
                    index,
                  ) =>
                    block.type ===
                    "heading" ? (
                      <h3
                        key={
                          `${block.text}-${index}`
                        }
                        className="pt-3 text-xl font-semibold tracking-tight text-slate-950"
                      >
                        {
                          block.text
                        }
                      </h3>
                    ) : (
                      <div
                        key={
                          `${block.text.slice(
                            0,
                            30,
                          )}-${index}`
                        }
                        className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
                      >
                        <p className="whitespace-pre-line text-[15px] leading-8 text-slate-600">
                          {
                            block.text
                          }
                        </p>
                      </div>
                    ),
                )
              ) : (
                <div className="rounded-[22px] border border-slate-200 bg-white p-7">
                  <p className="text-sm leading-7 text-slate-600">
                    Seekers Connect 247 is committed to making service
                    requests easier to submit, manage and track.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          CEO
      =================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="overflow-hidden rounded-[34px] border border-slate-200 bg-slate-950">
            <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
              <div className="relative min-h-[480px] bg-slate-900">
                <Image
                  src={
                    ceoImage
                  }
                  alt={
                    ceoName
                  }
                  fill
                  sizes="(max-width: 1024px) 100vw, 520px"
                  className="object-cover object-top"
                />


                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-slate-950/30" />
              </div>


              <div className="flex flex-col justify-center p-7 text-white sm:p-10 lg:p-14">
                <p className="text-sm font-semibold text-blue-300">
                  Leadership
                </p>


                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                  {
                    ceoName
                  }
                </h2>


                <p className="mt-2 text-sm font-medium text-slate-400">
                  {
                    ceoTitle
                  }
                </p>


                <div className="mt-7 h-px w-full bg-white/10" />


                <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300">
                  Seekers Connect 247 continues to develop practical
                  systems that help students, workers, families and
                  other customers complete important academic,
                  administrative and everyday tasks with greater
                  convenience and visibility.
                </p>


                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">
                  The focus remains on creating dependable service
                  processes, clear communication and a platform that
                  can continue expanding as customer needs evolve.
                </p>


                <Link
                  href="/request"
                  className="mt-8 inline-flex w-fit items-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  Start a Request

                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          WHAT WE SUPPORT
      =================================================== */}

      <section className="border-y border-slate-200 bg-[#f7faff]">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-blue-600">
              What We Support
            </p>


            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              A growing range of practical services.
            </h2>


            <p className="mt-4 text-sm leading-7 text-slate-500">
              Seekers Connect is designed to support different types
              of requests instead of forcing every customer into the
              same workflow.
            </p>
          </div>


          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ServiceStory
              image="/ceo-with-transcrip-flier.jpg"
              title="Academic Documents"
              text="Transcripts, attestation, proficiency and other supported academic services."
            />


            <ServiceStory
              image="/seekers-delivery-flier.jpg"
              title="Pickup & Delivery"
              text="Document, book and item pickup and delivery support."
            />


            <ServiceStory
              image="/proof-of-someone-acceptance-scholarship.jpg"
              title="Study & Applications"
              text="Support for study opportunities, applications and related documentation."
            />


            <ServiceStory
              image="/company-official-flier.jpg"
              title="General Services"
              text="Legal support, applications, printing, errands and other expanding services."
            />
          </div>
        </div>
      </section>


      {/* ===================================================
          UNIVERSITIES
      =================================================== */}

      <section className="bg-white">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Academic Network
            </p>


            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Supporting requests across multiple institutions.
            </h2>


            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
              Academic services are configured according to the
              institutions where they are available, helping customers
              choose the right combination from the start.
            </p>


            <Link
              href="/services"
              className="mt-6 inline-flex items-center text-sm font-semibold text-blue-600"
            >
              Browse Academic Services

              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>


          <div className="relative aspect-[16/8] overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <Image
              src="/universities-logos-together.png"
              alt="Universities supported by Seekers Connect"
              fill
              sizes="(max-width: 1024px) 100vw, 680px"
              className="object-contain p-6"
            />
          </div>
        </div>
      </section>


      {/* ===================================================
          MISSION
      =================================================== */}

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="flex flex-col justify-center rounded-[30px] border border-white/10 bg-white/[0.05] p-7 sm:p-10">
              <p className="text-sm font-semibold text-blue-300">
                Our Direction
              </p>


              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Build a service platform people can depend on.
              </h2>


              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400">
                We want customers to spend less time wondering who to
                contact, what information is required or what stage a
                request has reached. Seekers Connect brings those
                processes into one clearer experience.
              </p>


              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Clear service requirements",
                  "Structured request processes",
                  "Secure document handling",
                  "Visible request progress",
                ].map(
                  (
                    item,
                  ) => (
                    <div
                      key={
                        item
                      }
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4"
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
            </div>


            <div className="relative min-h-[420px] overflow-hidden rounded-[30px]">
              <Image
                src="/5927016763990150890_121.jpg"
                alt="Seekers Connect services"
                fill
                sizes="(max-width: 1024px) 100vw, 580px"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          CTA
      =================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="relative overflow-hidden rounded-[30px] bg-blue-600 px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

            <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-indigo-950/20 blur-3xl" />


            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-blue-100">
                  Ready when you are.
                </p>


                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Tell us what you need handled.
                </h2>


                <p className="mt-4 text-sm leading-7 text-blue-100">
                  Choose the service, provide the required information
                  and let the platform guide you through the rest.
                </p>
              </div>


              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/request"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  Start a Request

                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>


                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />

                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


// =========================================================
// ABOUT IMAGE CARD
// =========================================================

function AboutImageCard({
  image,
  title,
  description,
}: {
  image:
    string;

  title:
    string;

  description:
    string;
}) {
  return (
    <article className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50">
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
      </div>


      <div className="p-5">
        <h3 className="font-semibold text-slate-950">
          {
            title
          }
        </h3>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          {
            description
          }
        </p>
      </div>
    </article>
  );
}


// =========================================================
// SERVICE STORY
// =========================================================

function ServiceStory({
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
    <article className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
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

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
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
    </article>
  );
}


// =========================================================
// ADMIN-MANAGED ABOUT CONTENT
// =========================================================

type AboutContentBlock = {
  type:
    | "heading"
    | "paragraph";

  text:
    string;
};


function getAboutContentBlocks(
  content:
    string,
): AboutContentBlock[] {
  const rawBlocks =
    content
      .replace(
        /\r\n/g,
        "\n",
      )
      .split(
        /\n{2,}/,
      )
      .map(
        (
          item,
        ) =>
          item.trim(),
      )
      .filter(
        Boolean,
      );


  const blocks:
    AboutContentBlock[] =
    [];


  for (
    const block of
    rawBlocks
  ) {
    /*
     * Leadership has its own dedicated visual section below,
     * so we avoid displaying the single-word heading twice.
     */
    if (
      block.toLowerCase() ===
      "leadership"
    ) {
      continue;
    }


    const heading =
      block.length <=
        80 &&
      !block.includes(
        ".",
      ) &&
      !block.includes(
        "\n",
      );


    blocks.push({
      type:
        heading
          ? "heading"
          : "paragraph",

      text:
        block,
    });
  }


  return blocks;
}