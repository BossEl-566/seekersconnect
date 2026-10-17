import Image from "next/image";

import {
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

import type {
  PublicSitePage,
} from "@/lib/content/site-pages";


export function SitePageView({
  page,
  showCeo = false,
}: {
  page:
    PublicSitePage;

  showCeo?:
    boolean;
}) {
  const ceoName =
    typeof page.metadata
      .ceo_name ===
      "string"
      ? page.metadata
          .ceo_name
      : null;


  const ceoTitle =
    typeof page.metadata
      .ceo_title ===
      "string"
      ? page.metadata
          .ceo_title
      : null;


  const ceoImage =
    typeof page.metadata
      .ceo_image_url ===
      "string"
      ? page.metadata
          .ceo_image_url
      : null;


  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-blue-50/80 to-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>


          {page.eyebrow && (
            <p className="mt-6 text-sm font-semibold text-blue-600">
              {
                page.eyebrow
              }
            </p>
          )}


          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
            {
              page.title
            }
          </h1>


          {page.summary && (
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
              {
                page.summary
              }
            </p>
          )}


          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />

              Updated{" "}

              {new Date(
                page.updatedAt,
              ).toLocaleDateString(
                "en-GH",
                {
                  day:
                    "numeric",

                  month:
                    "long",

                  year:
                    "numeric",
                },
              )}
            </span>


            {page.slug ===
              "terms" && (
              <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                Version{" "}
                {
                  page.version
                }
              </span>
            )}
          </div>
        </div>
      </section>


      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        {showCeo &&
          ceoImage &&
          ceoName && (
          <div className="mb-12 grid overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 md:grid-cols-[280px_1fr]">
            <div className="relative min-h-[320px] bg-slate-100">
              <Image
                src={
                  ceoImage
                }
                alt={
                  ceoName
                }
                fill
                sizes="280px"
                className="object-cover"
              />
            </div>


            <div className="flex flex-col justify-center p-7 sm:p-9">
              <p className="text-sm font-semibold text-blue-600">
                Leadership
              </p>


              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {
                  ceoName
                }
              </h2>


              {ceoTitle && (
                <p className="mt-2 text-sm text-slate-500">
                  {
                    ceoTitle
                  }
                </p>
              )}


              <p className="mt-5 leading-7 text-slate-600">
                Leading Seekers Connect 247 Enterprise as it builds
                practical service systems for errands, deliveries,
                documents, applications and customer support.
              </p>
            </div>
          </div>
        )}


        <div className="space-y-6">
          {splitContent(
            page.content,
          ).map(
            (
              block,
              index,
            ) =>
              isHeading(
                block,
              ) ? (
                <h2
                  key={
                    index
                  }
                  className="pt-4 text-xl font-semibold tracking-tight text-slate-950"
                >
                  {
                    block
                  }
                </h2>
              ) : (
                <p
                  key={
                    index
                  }
                  className="whitespace-pre-line text-[15px] leading-8 text-slate-600"
                >
                  {
                    block
                  }
                </p>
              ),
          )}
        </div>
      </section>
    </>
  );
}


function splitContent(
  content:
    string,
) {
  return content
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
}


function isHeading(
  value:
    string,
) {
  if (
    value.length >
    100 ||
    value.includes(
      "\n",
    )
  ) {
    return false;
  }


  if (
    /^\d+\.\s/.test(
      value,
    )
  ) {
    return true;
  }


  return [
    "Leadership",
    "Information We May Collect",
    "Sensitive Authentication Information",
    "How We Use Information",
    "Documents and File Uploads",
    "Information Sharing",
    "Data Retention",
    "Security",
    "Customer Responsibility",
    "Contact",
    "Third-Party Decisions",
    "Study Abroad",
    "Loans and Financial Services",
    "Security Service and Other Applications",
    "Academic Research Support",
  ].includes(
    value,
  );
}