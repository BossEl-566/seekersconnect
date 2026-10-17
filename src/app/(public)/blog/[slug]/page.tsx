import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  ImageIcon,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  formatBlogDate,
} from "@/components/public/blog-card";

import {
  getPublishedBlogPost,
} from "@/lib/content/public-content";


type PageProps = {
  params:
    Promise<{
      slug:
        string;
    }>;
};


// =========================================================
// METADATA
// =========================================================

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    slug,
  } =
    await params;


  const post =
    await getPublishedBlogPost(
      slug,
    );


  if (
    !post
  ) {
    return {
      title:
        "Article Not Found | Seekers Connect 247",
    };
  }


  const cover =
    post.media.find(
      (
        item,
      ) =>
        item.kind ===
        "COVER_IMAGE",
    );


  return {
    title:
      post.seoTitle ||
      `${post.title} | Seekers Connect 247`,

    description:
      post.seoDescription ||
      post.excerpt ||
      undefined,

    openGraph: {
      title:
        post.seoTitle ||
        post.title,

      description:
        post.seoDescription ||
        post.excerpt ||
        undefined,

      images:
        cover
          ? [
              {
                url:
                  cover.url,

                alt:
                  cover.altText ||
                  post.title,
              },
            ]
          : undefined,
    },
  };
}


// =========================================================
// PAGE
// =========================================================

export default async function BlogArticlePage({
  params,
}: PageProps) {
  const {
    slug,
  } =
    await params;


  const post =
    await getPublishedBlogPost(
      slug,
    );


  if (
    !post
  ) {
    notFound();
  }


  const cover =
    post.media.find(
      (
        item,
      ) =>
        item.kind ===
        "COVER_IMAGE",
    ) ??
    null;


  const contentImages =
    post.media.filter(
      (
        item,
      ) =>
        item.kind ===
        "CONTENT_IMAGE",
    );


  return (
    <article>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to Blog
        </Link>


        <div className="mt-8">
          {post.featured && (
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              Featured Article
            </span>
          )}


          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl sm:leading-[1.08]">
            {
              post.title
            }
          </h1>


          {post.excerpt && (
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              {
                post.excerpt
              }
            </p>
          )}


          <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
            <CalendarDays className="h-4 w-4" />

            {formatBlogDate(
              post.publishedAt ??
              post.createdAt,
            )}
          </div>
        </div>


        {cover && (
          <div className="mt-10 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100">
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
              className="max-h-[620px] w-full object-cover"
            />
          </div>
        )}


        {/* ===============================================
            ARTICLE CONTENT

            Content is intentionally rendered as plain text.
            We do not inject unsanitized HTML.
        =============================================== */}

        <div className="mt-10 space-y-6">
          {splitArticleContent(
            post.content,
          ).map(
            (
              paragraph,
              index,
            ) => (
              <p
                key={
                  index
                }
                className="whitespace-pre-line text-base leading-8 text-slate-700"
              >
                {
                  paragraph
                }
              </p>
            ),
          )}
        </div>


        {contentImages.length >
          0 && (
          <section className="mt-12 border-t border-slate-200 pt-10">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-blue-600" />

              <h2 className="font-semibold text-slate-900">
                Article Images
              </h2>
            </div>


            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {contentImages.map(
                (
                  item,
                ) => (
                  <figure
                    key={
                      item.id
                    }
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}

                    <img
                      src={
                        item.url
                      }
                      alt={
                        item.altText ||
                        item.title ||
                        post.title
                      }
                      className="w-full object-cover"
                    />


                    {item.title && (
                      <figcaption className="bg-white px-4 py-3 text-xs text-slate-500">
                        {
                          item.title
                        }
                      </figcaption>
                    )}
                  </figure>
                ),
              )}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}


// =========================================================
// CONTENT PARAGRAPHS
// =========================================================

function splitArticleContent(
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
        paragraph,
      ) =>
        paragraph.trim(),
    )
    .filter(
      Boolean,
    );
}