import type {
  Metadata,
} from "next";

import {
  Newspaper,
} from "lucide-react";

import {
  BlogCard,
} from "@/components/public/blog-card";

import {
  getPublishedBlogPosts,
} from "@/lib/content/public-content";


export const metadata:
  Metadata =
{
  title:
    "Blog | Seekers Connect 247",

  description:
    "News, guides, announcements and helpful information from Seekers Connect 247.",
};


export default async function BlogPage() {
  const posts =
    await getPublishedBlogPosts();


  return (
    <>
      {/* =================================================
          HEADER
      ================================================= */}

      <section className="border-b border-slate-200 bg-gradient-to-b from-blue-50/80 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Newspaper className="h-5 w-5" />
          </div>


          <p className="mt-6 text-sm font-semibold text-blue-600">
            Seekers Connect Insights
          </p>


          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
            News, guides and useful information.
          </h1>


          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Stay informed about our services, applications,
            education opportunities and important customer updates.
          </p>
        </div>
      </section>


      {/* =================================================
          POSTS
      ================================================= */}

      <section className="mx-auto min-h-[50vh] max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        {posts.length ===
        0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
            <Newspaper className="mx-auto h-8 w-8 text-slate-300" />

            <h2 className="mt-4 font-semibold text-slate-800">
              No published articles yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              New articles and updates will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map(
              (
                post,
              ) => (
                <BlogCard
                  key={
                    post.id
                  }
                  post={
                    post
                  }
                />
              ),
            )}
          </div>
        )}
      </section>
    </>
  );
}