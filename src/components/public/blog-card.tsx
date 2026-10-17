import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
} from "lucide-react";

import type {
  PublicBlogPost,
} from "@/lib/content/public-content";


export function BlogCard({
  post,
}: {
  post:
    PublicBlogPost;
}) {
  const cover =
    post.media.find(
      (
        item,
      ) =>
        item.kind ===
        "COVER_IMAGE",
    ) ??
    null;


  return (
    <article className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
      {cover ? (
        <Link
          href={`/blog/${post.slug}`}
          className="block aspect-[16/10] overflow-hidden bg-slate-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}

          <img
            src={
              cover.url
            }
            alt={
              cover.altText ||
              cover.title ||
              post.title
            }
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        </Link>
      ) : (
        <Link
          href={`/blog/${post.slug}`}
          className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100"
        >
          <span className="text-sm font-medium text-blue-600">
            Seekers Connect 247
          </span>
        </Link>
      )}


      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />

            {formatBlogDate(
              post.publishedAt ??
              post.createdAt,
            )}
          </span>


          {post.featured && (
            <span className="rounded-full bg-blue-50 px-2 py-1 font-semibold text-blue-700">
              Featured
            </span>
          )}
        </div>


        <h2 className="mt-4 text-xl font-semibold leading-7 tracking-tight text-slate-950">
          <Link
            href={`/blog/${post.slug}`}
            className="transition hover:text-blue-600"
          >
            {
              post.title
            }
          </Link>
        </h2>


        {post.excerpt && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
            {
              post.excerpt
            }
          </p>
        )}


        <Link
          href={`/blog/${post.slug}`}
          className="mt-5 inline-flex items-center text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Read Article

          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}


export function formatBlogDate(
  value:
    string,
) {
  return new Date(
    value,
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
  );
}