import type {
  Metadata,
} from "next";

import {
  MessageSquareQuote,
  Star,
} from "lucide-react";

import {
  TestimonialSubmissionForm,
} from "@/components/public/testimonial-submission-form";

import {
  getApprovedTestimonials,
} from "@/lib/content/public-content";


export const metadata:
  Metadata =
{
  title:
    "Testimonials | Seekers Connect 247",

  description:
    "Read verified customer experiences and share your experience with Seekers Connect 247.",
};


export default async function TestimonialsPage() {
  const testimonials =
    await getApprovedTestimonials();


  return (
    <>
      <section className="border-b border-slate-200 bg-gradient-to-b from-blue-50/80 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <MessageSquareQuote className="h-5 w-5" />
          </div>


          <p className="mt-6 text-sm font-semibold text-blue-600">
            Customer Experiences
          </p>


          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
            What our customers say.
          </h1>


          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Read approved feedback from people who have used
            Seekers Connect services, or share your own experience.
          </p>
        </div>
      </section>


      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_440px]">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
              Customer Feedback
            </h2>


            {testimonials.length ===
            0 ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <MessageSquareQuote className="mx-auto h-7 w-7 text-slate-300" />

                <p className="mt-3 text-sm text-slate-500">
                  No public testimonials have been approved yet.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
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
                      <MessageSquareQuote className="h-6 w-6 text-blue-600" />


                      {item.rating && (
                        <div className="mt-5 flex gap-1 text-amber-400">
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


                      <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-600">
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
            )}
          </div>


          <div>
            <TestimonialSubmissionForm />
          </div>
        </div>
      </section>
    </>
  );
}