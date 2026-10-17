import Link from "next/link";

import {
  ArrowRight,
  MessageSquareQuote,
  Newspaper,
  Star,
} from "lucide-react";

import {
  BlogCard,
} from "@/components/public/blog-card";

import {
  getHomepageTestimonials,
  getPublishedBlogPosts,
} from "@/lib/content/public-content";


export async function FeaturedPublicContent() {
  const [
    posts,
    testimonials,
  ] =
    await Promise.all([
      getPublishedBlogPosts(
        3,
      ),

      getHomepageTestimonials(),
    ]);


  if (
    posts.length ===
      0 &&
    testimonials.length ===
      0
  ) {
    return null;
  }


  return (
    <>
      {/* =================================================
          BLOG
      ================================================= */}

      {posts.length >
        0 && (
        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                  <Newspaper className="h-4 w-4" />

                  Latest Insights
                </div>


                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  News and useful information.
                </h2>


                <p className="mt-4 leading-7 text-slate-600">
                  Updates, guides and information to help you make
                  better use of our services.
                </p>
              </div>


              <Link
                href="/blog"
                className="inline-flex items-center text-sm font-semibold text-blue-600"
              >
                View All Articles

                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>


            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          </div>
        </section>
      )}


      {/* =================================================
          TESTIMONIALS
      ================================================= */}

      {testimonials.length >
        0 && (
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                <MessageSquareQuote className="h-4 w-4" />

                Customer Experiences
              </div>


              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Trusted by the people we serve.
              </h2>


              <p className="mt-4 leading-7 text-slate-600">
                Feedback from customers who have used Seekers Connect.
              </p>
            </div>


            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {testimonials.map(
                (
                  item,
                ) => (
                  <article
                    key={
                      item.id
                    }
                    className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    {item.rating && (
                      <div className="flex gap-1 text-amber-400">
                        {Array.from({
                          length:
                            item.rating,
                        }).map(
                          (
                            _,
                            index,
                          ) => (
                            <Star
                              key={
                                index
                              }
                              className="h-4 w-4 fill-current"
                            />
                          ),
                        )}
                      </div>
                    )}


                    <p className="mt-5 line-clamp-6 text-sm leading-7 text-slate-600">
                      “
                      {
                        item.testimonial
                      }
                      ”
                    </p>


                    <div className="mt-6 border-t border-slate-100 pt-4">
                      <p className="font-semibold text-slate-900">
                        {
                          item.customerName
                        }
                      </p>


                      {(item.customerTitle ||
                        item.organization) && (
                        <p className="mt-1 text-xs text-slate-400">
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
                  </article>
                ),
              )}
            </div>


            <div className="mt-8 text-center">
              <Link
                href="/testimonials"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Read & Share Testimonials

                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}