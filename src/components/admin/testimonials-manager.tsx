"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  Archive,
  Check,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageSquareQuote,
  Plus,
  Star,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  createAdminTestimonial,
  moderateTestimonial,
  setTestimonialFeatured,
  type TestimonialStatus,
} from "@/app/admin/(dashboard)/testimonials/actions";


export type TestimonialAdminItem = {
  id:
    string;

  customer_name:
    string;

  customer_title:
    string | null;

  organization:
    string | null;

  testimonial:
    string;

  rating:
    number | null;

  source:
    "PUBLIC"
    | "ADMIN";

  status:
    TestimonialStatus;

  featured:
    boolean;

  customer_email:
    string | null;

  customer_phone:
    string | null;

  admin_note:
    string | null;

  moderated_at:
    string | null;

  created_at:
    string;
};


export function TestimonialsManager({
  testimonials,
}: {
  testimonials:
    TestimonialAdminItem[];
}) {
  const router =
    useRouter();


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  const [
    customerName,
    setCustomerName,
  ] =
    useState(
      "",
    );


  const [
    customerTitle,
    setCustomerTitle,
  ] =
    useState(
      "",
    );


  const [
    organization,
    setOrganization,
  ] =
    useState(
      "",
    );


  const [
    testimonial,
    setTestimonial,
  ] =
    useState(
      "",
    );


  const [
    rating,
    setRating,
  ] =
    useState(
      "",
    );


  const [
    featured,
    setFeatured,
  ] =
    useState(
      false,
    );


  const [
    error,
    setError,
  ] =
    useState(
      "",
    );


  const [
    success,
    setSuccess,
  ] =
    useState(
      "",
    );


  const pendingCount =
    testimonials.filter(
      (
        item,
      ) =>
        item.status ===
        "PENDING",
    ).length;


  const approvedCount =
    testimonials.filter(
      (
        item,
      ) =>
        item.status ===
        "APPROVED",
    ).length;


  function createTestimonial() {
    setError(
      "",
    );

    setSuccess(
      "",
    );


    startTransition(
      async () => {
        const result =
          await createAdminTestimonial(
            {
              customerName,

              customerTitle,

              organization,

              testimonial,

              rating:
                rating
                  ? Number(
                      rating,
                    )
                  : null,

              featured,
            },
          );


        if (
          !result.success
        ) {
          setError(
            result.error,
          );

          return;
        }


        setCustomerName(
          "",
        );

        setCustomerTitle(
          "",
        );

        setOrganization(
          "",
        );

        setTestimonial(
          "",
        );

        setRating(
          "",
        );

        setFeatured(
          false,
        );

        setSuccess(
          "Testimonial created.",
        );


        router.refresh();
      },
    );
  }


  function changeStatus(
    id:
      string,

    status:
      TestimonialStatus,
  ) {
    let note =
      "";


    if (
      status ===
        "REJECTED" ||
      status ===
        "ARCHIVED"
    ) {
      note =
        window.prompt(
          "Optional internal note:",
        ) ??
        "";
    }


    startTransition(
      async () => {
        const result =
          await moderateTestimonial(
            id,
            status,
            note,
          );


        if (
          !result.success
        ) {
          setError(
            result.error,
          );

          return;
        }


        router.refresh();
      },
    );
  }


  function toggleFeatured(
    item:
      TestimonialAdminItem,
  ) {
    startTransition(
      async () => {
        const result =
          await setTestimonialFeatured(
            item.id,
            !item.featured,
          );


        if (
          !result.success
        ) {
          setError(
            result.error,
          );

          return;
        }


        router.refresh();
      },
    );
  }


  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Summary
          icon={
            MessageSquareQuote
          }
          label="Total"
          value={
            testimonials.length
          }
        />

        <Summary
          icon={
            Clock3
          }
          label="Pending"
          value={
            pendingCount
          }
        />

        <Summary
          icon={
            CheckCircle2
          }
          label="Approved"
          value={
            approvedCount
          }
        />
      </div>


      <div className="mt-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        {/* ===============================================
            CREATE
        =============================================== */}

        <section className="h-fit rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Plus className="h-4 w-4" />
            </div>

            <div>
              <p className="font-semibold text-slate-950">
                Add Testimonial
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Add a verified testimonial manually.
              </p>
            </div>
          </div>


          <div className="mt-5 space-y-4">
            <input
              value={
                customerName
              }
              onChange={(
                event,
              ) =>
                setCustomerName(
                  event.target
                    .value,
                )
              }
              placeholder="Customer name"
              className="testimonial-input"
            />


            <input
              value={
                customerTitle
              }
              onChange={(
                event,
              ) =>
                setCustomerTitle(
                  event.target
                    .value,
                )
              }
              placeholder="Title / role"
              className="testimonial-input"
            />


            <input
              value={
                organization
              }
              onChange={(
                event,
              ) =>
                setOrganization(
                  event.target
                    .value,
                )
              }
              placeholder="Organization"
              className="testimonial-input"
            />


            <textarea
              value={
                testimonial
              }
              onChange={(
                event,
              ) =>
                setTestimonial(
                  event.target
                    .value,
                )
              }
              rows={
                7
              }
              placeholder="Testimonial..."
              className="testimonial-textarea"
            />


            <select
              value={
                rating
              }
              onChange={(
                event,
              ) =>
                setRating(
                  event.target
                    .value,
                )
              }
              className="testimonial-input"
            >
              <option value="">
                No rating
              </option>

              <option value="5">
                5 stars
              </option>

              <option value="4">
                4 stars
              </option>

              <option value="3">
                3 stars
              </option>

              <option value="2">
                2 stars
              </option>

              <option value="1">
                1 star
              </option>
            </select>


            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
              <input
                type="checkbox"
                checked={
                  featured
                }
                onChange={(
                  event,
                ) =>
                  setFeatured(
                    event.target
                      .checked,
                  )
                }
              />

              <span className="text-sm text-slate-700">
                Feature testimonial
              </span>
            </label>


            {error && (
              <p className="text-sm text-red-600">
                {
                  error
                }
              </p>
            )}


            {success && (
              <p className="text-sm text-emerald-600">
                {
                  success
                }
              </p>
            )}


            <button
              type="button"
              disabled={
                pending
              }
              onClick={
                createTestimonial
              }
              className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}

              Add Testimonial
            </button>
          </div>
        </section>


        {/* ===============================================
            MODERATION
        =============================================== */}

        <section className="space-y-4">
          {testimonials.length ===
          0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-400">
              No testimonials yet.
            </div>
          ) : (
            testimonials.map(
              (
                item,
              ) => (
                <article
                  key={
                    item.id
                  }
                  className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950">
                          {
                            item.customer_name
                          }
                        </p>

                        <TestimonialStatusBadge
                          status={
                            item.status
                          }
                        />

                        {item.featured && (
                          <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-semibold uppercase text-blue-700">
                            Featured
                          </span>
                        )}
                      </div>


                      {(item.customer_title ||
                        item.organization) && (
                        <p className="mt-1 text-xs text-slate-400">
                          {[
                            item.customer_title,
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


                    {item.rating && (
                      <div className="flex items-center gap-1 text-amber-500">
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
                              className="h-3.5 w-3.5 fill-current"
                            />
                          ),
                        )}
                      </div>
                    )}
                  </div>


                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    {
                      item.testimonial
                    }
                  </p>


                  {item.source ===
                    "PUBLIC" && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Private verification details
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {item.customer_email ||
                          "No email"}
                        {" · "}
                        {item.customer_phone ||
                          "No phone"}
                      </p>
                    </div>
                  )}


                  {item.admin_note && (
                    <div className="mt-4 rounded-xl bg-amber-50 p-3">
                      <p className="text-[10px] font-semibold uppercase text-amber-700">
                        Internal Note
                      </p>

                      <p className="mt-1 text-xs text-amber-900">
                        {
                          item.admin_note
                        }
                      </p>
                    </div>
                  )}


                  <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    {item.status !==
                      "APPROVED" && (
                      <ActionButton
                        label="Approve"
                        icon={
                          Check
                        }
                        onClick={() =>
                          changeStatus(
                            item.id,
                            "APPROVED",
                          )
                        }
                      />
                    )}


                    {item.status !==
                      "REJECTED" && (
                      <ActionButton
                        label="Reject"
                        icon={
                          X
                        }
                        danger
                        onClick={() =>
                          changeStatus(
                            item.id,
                            "REJECTED",
                          )
                        }
                      />
                    )}


                    {item.status ===
                      "APPROVED" && (
                      <ActionButton
                        label={
                          item.featured
                            ? "Unfeature"
                            : "Feature"
                        }
                        icon={
                          Star
                        }
                        onClick={() =>
                          toggleFeatured(
                            item,
                          )
                        }
                      />
                    )}


                    {item.status !==
                      "ARCHIVED" && (
                      <ActionButton
                        label="Archive"
                        icon={
                          Archive
                        }
                        onClick={() =>
                          changeStatus(
                            item.id,
                            "ARCHIVED",
                          )
                        }
                      />
                    )}


                    {(item.status ===
                      "REJECTED" ||
                      item.status ===
                        "ARCHIVED") && (
                      <ActionButton
                        label="Return to Pending"
                        icon={
                          Clock3
                        }
                        onClick={() =>
                          changeStatus(
                            item.id,
                            "PENDING",
                          )
                        }
                      />
                    )}
                  </div>
                </article>
              ),
            )
          )}
        </section>
      </div>


      <style jsx global>{`
        .testimonial-input {
          height: 42px;
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgb(226 232 240);
          padding: 0 12px;
          font-size: 14px;
          outline: none;
        }

        .testimonial-textarea {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgb(226 232 240);
          padding: 12px;
          font-size: 14px;
          outline: none;
          resize: vertical;
        }

        .testimonial-input:focus,
        .testimonial-textarea:focus {
          border-color: rgb(96 165 250);
          box-shadow: 0 0 0 2px rgb(219 234 254);
        }
      `}</style>
    </>
  );
}


function ActionButton({
  label,
  icon:
    Icon,
  danger = false,
  onClick,
}: {
  label:
    string;

  icon:
    React.ElementType;

  danger?:
    boolean;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`inline-flex h-9 items-center rounded-xl border px-3 text-xs font-medium ${
        danger
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-slate-200 text-slate-600 hover:bg-slate-50"
      }`}
    >
      <Icon className="mr-2 h-3.5 w-3.5" />

      {
        label
      }
    </button>
  );
}


function Summary({
  icon:
    Icon,
  label,
  value,
}: {
  icon:
    React.ElementType;

  label:
    string;

  value:
    number;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">
            {
              label
            }
          </p>

          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {
              value
            }
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}


function TestimonialStatusBadge({
  status,
}: {
  status:
    TestimonialStatus;
}) {
  const classes =
    status ===
    "APPROVED"
      ? "bg-emerald-50 text-emerald-700"
      : status ===
          "REJECTED"
        ? "bg-red-50 text-red-700"
        : status ===
            "ARCHIVED"
          ? "bg-slate-100 text-slate-500"
          : "bg-amber-50 text-amber-700";


  return (
    <span
      className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase ${classes}`}
    >
      {
        status
      }
    </span>
  );
}