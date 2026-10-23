import type {
  Metadata,
} from "next";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  FileText,
  GraduationCap,
  Lightbulb,
  Megaphone,
  Newspaper,
} from "lucide-react";

import {
  BlogCard,
} from "@/components/public/blog-card";

import {
  getPublishedBlogPosts,
} from "@/lib/content/public-content";


// =========================================================
// METADATA
// =========================================================

export const metadata:
  Metadata =
{
  title:
    "Blog | Seekers Connect 247",

  description:
    "News, guides, announcements and helpful information from Seekers Connect 247.",
};


// =========================================================
// PAGE
// =========================================================

export default async function BlogPage() {
  const posts =
    await getPublishedBlogPosts();


  const featuredPost =
    posts[0] ??
    null;


  const remainingPosts =
    featuredPost
      ? posts.slice(
          1,
        )
      : [];


  return (
    <>
      {/* ===================================================
          EDITORIAL MASTHEAD
      =================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-12 sm:px-6 lg:px-8 lg:pb-12 lg:pt-16">
          {/* ===============================================
              TOP LINE
          =============================================== */}

          <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Newspaper className="h-4 w-4 text-blue-600" />

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                  Seekers Connect Journal
                </p>
              </div>


              <h1 className="mt-5 max-w-5xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[78px]">
                News, guides &{" "}

                <span className="text-blue-600">
                  useful information.
                </span>
              </h1>
            </div>


            <div className="max-w-sm pb-1">
              <p className="text-sm leading-7 text-slate-500">
                Practical information about Seekers Connect services,
                applications, education opportunities, documents,
                customer processes and important updates.
              </p>
            </div>
          </div>


          {/* ===============================================
              EDITORIAL META
          =============================================== */}

          <div className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
              <span>
                {
                  posts.length
                }{" "}

                {posts.length ===
                1
                  ? "published article"
                  : "published articles"}
              </span>


              <span>
                Guides
              </span>


              <span>
                Updates
              </span>


              <span>
                Opportunities
              </span>
            </div>


            <Link
              href="/services"
              className="inline-flex items-center text-sm font-semibold text-blue-600"
            >
              Explore our services

              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>


      {/* ===================================================
          TOPIC STRIP
      =================================================== */}

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
          <div className="grid gap-px overflow-hidden rounded-[18px] border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-5">
            <TopicItem
              icon={
                BookOpen
              }
              label="Service Guides"
            />


            <TopicItem
              icon={
                GraduationCap
              }
              label="Education"
            />


            <TopicItem
              icon={
                FileText
              }
              label="Applications"
            />


            <TopicItem
              icon={
                Megaphone
              }
              label="Announcements"
            />


            <TopicItem
              icon={
                Lightbulb
              }
              label="Helpful Tips"
            />
          </div>
        </div>
      </section>


      {/* ===================================================
          FEATURED EDITION
      =================================================== */}

      {featuredPost && (
        <section className="bg-[#f7f8fb]">
          <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
            <div className="mb-7 flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                  Latest Edition
                </p>


                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  Start with our latest article.
                </h2>
              </div>


              <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
                <CalendarDays className="h-4 w-4" />

                Latest publication
              </div>
            </div>


            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
              {/* ===========================================
                  FEATURED ARTICLE
              =========================================== */}

              <div className="rounded-[28px] border border-slate-200 bg-white p-2 shadow-[0_16px_50px_rgba(15,23,42,0.07)]">
                <BlogCard
                  post={
                    featuredPost
                  }
                />
              </div>


              {/* ===========================================
                  EDITOR'S PANEL
              =========================================== */}

              <aside className="overflow-hidden rounded-[28px] bg-slate-950 text-white">
                <div className="relative min-h-[230px]">
                  <Image
                    src="/office-of-seekers.jpg"
                    alt="Seekers Connect"
                    fill
                    sizes="(max-width: 1024px) 100vw, 440px"
                    className="object-cover"
                  />


                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />


                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">
                      From Seekers Connect
                    </p>


                    <h3 className="mt-2 text-xl font-semibold">
                      Information that helps you make the next move.
                    </h3>
                  </div>
                </div>


                <div className="p-6">
                  <p className="text-sm leading-7 text-slate-400">
                    The Journal is where we explain processes, share
                    service announcements and publish practical
                    information customers may need before starting a
                    request.
                  </p>


                  <div className="mt-6 space-y-4 border-t border-white/10 pt-5">
                    <EditorialPoint
                      number="01"
                      text="Understand service requirements"
                    />

                    <EditorialPoint
                      number="02"
                      text="Follow important application updates"
                    />

                    <EditorialPoint
                      number="03"
                      text="Discover education opportunities"
                    />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}


      {/* ===================================================
          ARTICLE ARCHIVE
      =================================================== */}

      <section className="bg-white">
        <div className="mx-auto min-h-[50vh] max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                From the Journal
              </p>


              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
                Browse the latest stories.
              </h2>
            </div>


            {posts.length >
              0 && (
              <p className="max-w-md text-sm leading-6 text-slate-500">
                Guides, service information, announcements and
                opportunities published by Seekers Connect 247.
              </p>
            )}
          </div>


          {posts.length ===
          0 ? (
            <EmptyBlogState />
          ) : remainingPosts.length >
            0 ? (
            <div className="mt-9 grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
              {remainingPosts.map(
                (
                  post,
                  index,
                ) => (
                  <div
                    key={
                      post.id
                    }
                    className="relative"
                  >
                    <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Article{" "}

                        {String(
                          index +
                            2,
                        ).padStart(
                          2,
                          "0",
                        )}
                      </span>


                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    </div>


                    <BlogCard
                      post={
                        post
                      }
                    />
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="mt-9 rounded-[24px] border border-slate-200 bg-slate-50 p-8">
              <p className="text-sm text-slate-500">
                The latest article is featured above. More articles
                will appear here as they are published.
              </p>
            </div>
          )}
        </div>
      </section>


      {/* ===================================================
          INFORMATION AREAS
      =================================================== */}

      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                What We Publish
              </p>


              <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-[-0.035em] text-slate-950">
                Useful content, not just company announcements.
              </h2>


              <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
                The journal gives us a place to explain important
                processes and publish information that may help
                customers before, during or after a service request.
              </p>
            </div>


            <div className="grid gap-px overflow-hidden rounded-[26px] border border-slate-200 bg-slate-200 sm:grid-cols-2">
              <InformationArea
                number="01"
                title="Service Guides"
                text="Clear explanations about service requirements, documents and request processes."
              />


              <InformationArea
                number="02"
                title="Education Opportunities"
                text="Useful information relating to universities, study opportunities and applications."
              />


              <InformationArea
                number="03"
                title="Application Updates"
                text="Important notices about applications, placements, results and related processes."
              />


              <InformationArea
                number="04"
                title="Seekers Connect Updates"
                text="New services, important platform information and customer announcements."
              />
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          SECOND EDITORIAL IMAGE
      =================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid overflow-hidden rounded-[30px] border border-slate-200 bg-white lg:grid-cols-[0.82fr_1.18fr]">
            <div className="relative min-h-[330px]">
              <Image
                src="/proof-of-someone-acceptance-scholarship.jpg"
                alt="Education and opportunity information"
                fill
                sizes="(max-width: 1024px) 100vw, 600px"
                className="object-cover"
              />


              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-950/10" />
            </div>


            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                Opportunities & Guidance
              </p>


              <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.035em] text-slate-950">
                Looking for information about an opportunity?
              </h2>


              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
                Our articles may help you understand applications,
                study opportunities and service requirements. When you
                are ready to proceed, you can start the appropriate
                Seekers Connect request directly.
              </p>


              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/services"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Browse Services

                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>


                <Link
                  href="/contact"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Ask Our Team
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ===================================================
          FINAL CTA
      =================================================== */}

      <section className="bg-slate-950">
        <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-blue-300">
                Need more than information?
              </p>


              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Start the service you need.
              </h2>


              <p className="mt-3 text-sm leading-7 text-slate-400">
                When an article points you in the right direction,
                continue through the service directory or request
                wizard.
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
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] px-6 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


// =========================================================
// TOPIC ITEM
// =========================================================

function TopicItem({
  icon:
    Icon,
  label,
}: {
  icon:
    typeof Newspaper;

  label:
    string;
}) {
  return (
    <div className="flex items-center gap-3 bg-white px-4 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon className="h-4 w-4" />
      </div>


      <p className="text-xs font-semibold text-slate-700">
        {
          label
        }
      </p>
    </div>
  );
}


// =========================================================
// EDITORIAL POINT
// =========================================================

function EditorialPoint({
  number,
  text,
}: {
  number:
    string;

  text:
    string;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-[10px] font-bold text-blue-300">
        {
          number
        }
      </span>


      <span className="text-xs text-slate-300">
        {
          text
        }
      </span>
    </div>
  );
}


// =========================================================
// INFORMATION AREA
// =========================================================

function InformationArea({
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
    <div className="bg-white p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-blue-600">
          {
            number
          }
        </span>


        <span className="h-px w-8 bg-slate-200" />
      </div>


      <h3 className="mt-6 font-semibold text-slate-950">
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


// =========================================================
// EMPTY STATE
// =========================================================

function EmptyBlogState() {
  return (
    <div className="mt-9 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
      <div className="grid lg:grid-cols-[1fr_0.62fr]">
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Newspaper className="h-5 w-5" />
          </div>


          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
            The journal is getting ready.
          </h2>


          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
            No articles have been published yet. Guides,
            announcements and useful information will appear here
            once they are released.
          </p>


          <Link
            href="/services"
            className="mt-6 inline-flex items-center text-sm font-semibold text-blue-600"
          >
            Explore Services

            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>


        <div className="relative min-h-[280px]">
          <Image
            src="/company-official-flier.jpg"
            alt="Seekers Connect 247"
            fill
            sizes="500px"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}