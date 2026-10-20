import type {
  Metadata,
} from "next";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  MessageSquareQuote,
  Star,
} from "lucide-react";

import {
  TestimonialSubmissionForm,
} from "@/components/public/testimonial-submission-form";

import {
  getApprovedTestimonials,
} from "@/lib/content/public-content";


// =========================================================
// METADATA
// =========================================================

export const metadata:
  Metadata =
{
  title:
    "Testimonials | Seekers Connect 247",

  description:
    "Read approved customer experiences and share your experience with Seekers Connect 247.",
};


// =========================================================
// PAGE
// =========================================================

export default async function TestimonialsPage() {
  const testimonials =
    await getApprovedTestimonials();


  const ratedTestimonials =
    testimonials
      .map(
        (
          item,
        ) =>
          item.rating,
      )
      .filter(
        (
          rating,
        ): rating is number =>
          typeof rating ===
            "number" &&
          Number.isFinite(
            rating,
          ),
      );


  const averageRating =
    ratedTestimonials.length >
    0
      ? (
          ratedTestimonials.reduce(
            (
              total,
              rating,
            ) =>
              total +
              rating,
            0,
          ) /
          ratedTestimonials.length
        ).toFixed(
          1,
        )
      : null;


  const featuredTestimonial =
    testimonials[0] ??
    null;


  const remainingTestimonials =
    featuredTestimonial
      ? testimonials.slice(
          1,
        )
      : testimonials;


  return (
    <>
      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative overflow-hidden border-b border-slate-200 bg-[#f7f8fc]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-0 h-[360px] w-[360px] rounded-full bg-blue-100 blur-[100px]" />

          <div className="absolute right-0 top-10 h-[420px] w-[420px] rounded-full bg-sky-100/70 blur-[120px]" />
        </div>


        <div className="relative mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_0.72fr] lg:items-center lg:px-8 lg:py-20">
          {/* ===============================================
              COPY
          =============================================== */}

          <div>
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              <span className="h-px w-8 bg-blue-500" />

              Customer Stories
            </div>


            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[62px]">
              Experiences shared by the people{" "}

              <span className="text-blue-600">
                we serve.
              </span>
            </h1>


            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
              Read approved feedback from customers who have used
              Seekers Connect services, and share your own experience
              with our team.
            </p>


            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#share-experience"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Share Your Experience

                <ArrowRight className="ml-2 h-4 w-4" />
              </a>


              <Link
                href="/services"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Explore Services
              </Link>
            </div>


            {/* =============================================
                REAL STATS
            ============================================= */}

            <div className="mt-9 flex flex-wrap gap-3">
              <div className="min-w-[150px] rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-2xl font-semibold tracking-tight text-slate-950">
                  {
                    testimonials.length
                  }
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Approved{" "}

                  {testimonials.length ===
                  1
                    ? "experience"
                    : "experiences"}
                </p>
              </div>


              {averageRating && (
                <div className="min-w-[150px] rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-semibold tracking-tight text-slate-950">
                      {
                        averageRating
                      }
                    </p>

                    <p className="pb-1 text-xs text-slate-400">
                      / 5
                    </p>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Average rating
                  </p>
                </div>
              )}


              <div className="min-w-[170px] rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />

                  <p className="text-sm font-semibold">
                    Moderated
                  </p>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Published after review
                </p>
              </div>
            </div>
          </div>


          {/* ===============================================
              IMAGE / BRAND PANEL
          =============================================== */}

          <div className="relative">
            <div className="relative min-h-[440px] overflow-hidden rounded-[30px] border border-white bg-slate-900 shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
              <Image
                src="/office-of-seekers.jpg"
                alt="Seekers Connect customer service"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover"
              />


              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/15 to-transparent" />


              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">
                <div className="rounded-2xl border border-white/15 bg-slate-950/55 p-5 text-white backdrop-blur-md">
                  <MessageSquareQuote className="h-5 w-5 text-blue-300" />


                  <p className="mt-4 text-xl font-semibold leading-7">
                    Good service is not only about completing a task.
                    It is about the experience along the way.
                  </p>


                  <p className="mt-3 text-xs text-slate-300">
                    Seekers Connect 247
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          FEATURED TESTIMONIAL
      =================================================== */}

      {featuredTestimonial && (
        <section className="bg-white">
          <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid overflow-hidden rounded-[32px] bg-slate-950 lg:grid-cols-[0.72fr_1.28fr]">
              {/* ===========================================
                  LABEL
              =========================================== */}

              <div className="flex flex-col justify-between border-b border-white/10 p-7 text-white sm:p-9 lg:border-b-0 lg:border-r">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
                    Featured Experience
                  </p>


                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em]">
                    A customer story worth highlighting.
                  </h2>
                </div>


                <div className="mt-8">
                  <MessageSquareQuote className="h-10 w-10 text-blue-400/70" />
                </div>
              </div>


              {/* ===========================================
                  QUOTE
              =========================================== */}

              <div className="p-7 text-white sm:p-9 lg:p-12">
                {featuredTestimonial.rating && (
                  <RatingStars
                    rating={
                      featuredTestimonial.rating
                    }
                    dark
                  />
                )}


                <blockquote className="mt-6 whitespace-pre-wrap text-xl font-medium leading-9 tracking-[-0.015em] text-slate-100 sm:text-2xl sm:leading-10">
                  “
                  {
                    featuredTestimonial.testimonial
                  }
                  ”
                </blockquote>


                <div className="mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
                  <CustomerAvatar
                    name={
                      featuredTestimonial.customerName
                    }
                    dark
                  />


                  <div>
                    <p className="font-semibold text-white">
                      {
                        featuredTestimonial.customerName
                      }
                    </p>


                    {(featuredTestimonial.customerTitle ||
                      featuredTestimonial.organization) && (
                      <p className="mt-1 text-xs text-slate-400">
                        {[
                          featuredTestimonial.customerTitle,
                          featuredTestimonial.organization,
                        ]
                          .filter(
                            Boolean,
                          )
                          .join(
                            " · ",
                          )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}


      {/* ===================================================
          TESTIMONIAL WALL + FORM
      =================================================== */}

      <section className="border-y border-slate-200 bg-[#f7f8fb]">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_420px]">
            {/* =============================================
                TESTIMONIAL WALL
            ============================================= */}

            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-600">
                    Customer Feedback
                  </p>


                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-slate-950">
                    What people are saying.
                  </h2>
                </div>


                {testimonials.length >
                  0 && (
                  <p className="text-xs text-slate-400">
                    All testimonials shown here have been approved for
                    public display.
                  </p>
                )}
              </div>


              {testimonials.length ===
              0 ? (
                <div className="mt-8 rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center sm:p-14">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <MessageSquareQuote className="h-5 w-5" />
                  </div>


                  <h3 className="mt-5 text-lg font-semibold text-slate-950">
                    No testimonials published yet.
                  </h3>


                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Be one of the first customers to share an
                    experience with Seekers Connect 247.
                  </p>


                  <a
                    href="#share-experience"
                    className="mt-6 inline-flex items-center text-sm font-semibold text-blue-600"
                  >
                    Share your experience

                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </div>
              ) : remainingTestimonials.length >
                0 ? (
                <div className="mt-8 columns-1 gap-5 md:columns-2">
                  {remainingTestimonials.map(
                    (
                      item,
                    ) => (
                      <article
                        key={
                          item.id
                        }
                        className="mb-5 break-inside-avoid rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <MessageSquareQuote className="h-6 w-6 shrink-0 text-blue-600" />


                          {item.rating && (
                            <RatingStars
                              rating={
                                item.rating
                              }
                            />
                          )}
                        </div>


                        <blockquote className="mt-5 whitespace-pre-wrap text-[15px] leading-7 text-slate-600">
                          “
                          {
                            item.testimonial
                          }
                          ”
                        </blockquote>


                        <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                          <CustomerAvatar
                            name={
                              item.customerName
                            }
                          />


                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {
                                item.customerName
                              }
                            </p>


                            {(item.customerTitle ||
                              item.organization) && (
                              <p className="mt-1 truncate text-xs text-slate-400">
                                {[
                                  item.customerTitle,
                                  item.organization,
                                ]
                                  .filter(
                                    Boolean,
                                  )
                                  .join(
                                    " · ",
                                  )}
                              </p>
                            )}
                          </div>
                        </div>
                      </article>
                    ),
                  )}
                </div>
              ) : (
                <div className="mt-8 rounded-[24px] border border-slate-200 bg-white p-6 text-sm text-slate-500">
                  More customer experiences will appear here as they
                  are approved.
                </div>
              )}
            </div>


            {/* =============================================
                SUBMISSION
            ============================================= */}

            <aside
              id="share-experience"
              className="scroll-mt-28"
            >
              <div className="xl:sticky xl:top-28">
                <div className="mb-4 rounded-[24px] bg-blue-600 p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
                    Your Experience Matters
                  </p>


                  <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                    Used Seekers Connect?
                  </h2>


                  <p className="mt-3 text-sm leading-6 text-blue-100">
                    Tell us what your experience was like. Submitted
                    feedback is reviewed before it appears publicly.
                  </p>


                  <div className="mt-5 space-y-3">
                    {[
                      "Be specific about the service you used.",
                      "Share what stood out to you.",
                      "Do not include private or sensitive information.",
                    ].map(
                      (
                        item,
                      ) => (
                        <div
                          key={
                            item
                          }
                          className="flex items-start gap-2"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-200" />

                          <p className="text-xs leading-5 text-blue-100">
                            {
                              item
                            }
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>


                <div className="rounded-[26px] border border-slate-200 bg-white p-1 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
                  <TestimonialSubmissionForm />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>


      {/* ===================================================
          TRUST / PROCESS
      =================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-5 md:grid-cols-3">
            <TrustItem
              number="01"
              title="Customers submit feedback"
              text="Customers can share their experience through the public testimonial form."
            />


            <TrustItem
              number="02"
              title="Feedback is reviewed"
              text="Submissions are moderated before being approved for public display."
            />


            <TrustItem
              number="03"
              title="Approved stories appear here"
              text="Only testimonials approved by the Seekers Connect team are shown on this page."
            />
          </div>
        </div>
      </section>


      {/* ===================================================
          FINAL CTA
      =================================================== */}

      <section className="bg-white pb-16 lg:pb-20">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[30px] bg-slate-950 px-6 py-10 text-white sm:px-10 lg:px-12 lg:py-12">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-600/20 blur-[90px]" />


            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-blue-300">
                  Need help with something?
                </p>


                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Experience the service for yourself.
                </h2>


                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Browse the available services and submit the request
                  that best matches what you need handled.
                </p>
              </div>


              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/request"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Start a Request

                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>


                <Link
                  href="/services"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-6 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  View Services
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
// RATING
// =========================================================

function RatingStars({
  rating,
  dark = false,
}: {
  rating:
    number;

  dark?:
    boolean;
}) {
  return (
    <div
      className="flex gap-1"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({
        length:
          5,
      }).map(
        (
          _,
          index,
        ) => {
          const active =
            index <
            rating;


          return (
            <Star
              key={
                index
              }
              className={`h-4 w-4 ${
                active
                  ? "fill-amber-400 text-amber-400"
                  : dark
                    ? "text-slate-700"
                    : "text-slate-200"
              }`}
            />
          );
        },
      )}
    </div>
  );
}


// =========================================================
// CUSTOMER AVATAR
// =========================================================

function CustomerAvatar({
  name,
  dark = false,
}: {
  name:
    string;

  dark?:
    boolean;
}) {
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase ${
        dark
          ? "bg-blue-500/15 text-blue-200"
          : "bg-blue-50 text-blue-700"
      }`}
    >
      {
        getInitials(
          name,
        )
      }
    </div>
  );
}


// =========================================================
// INITIALS
// =========================================================

function getInitials(
  name:
    string,
) {
  const parts =
    name
      .trim()
      .split(
        /\s+/,
      )
      .filter(
        Boolean,
      );


  if (
    parts.length ===
    0
  ) {
    return "SC";
  }


  if (
    parts.length ===
    1
  ) {
    return parts[0]
      .slice(
        0,
        2,
      )
      .toUpperCase();
  }


  return `${parts[0][0]}${parts[parts.length - 1][0]}`
    .toUpperCase();
}


// =========================================================
// TRUST ITEM
// =========================================================

function TrustItem({
  number,
  title,
  text,
}: {
  number:
    string;

  title:
    string;

  text:
    string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6">
      <p className="text-xs font-bold text-blue-600">
        {
          number
        }
      </p>


      <h3 className="mt-5 font-semibold text-slate-950">
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
  );
}