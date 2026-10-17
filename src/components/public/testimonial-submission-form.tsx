"use client";

import {
  type FormEvent,
  useState,
} from "react";

import {
  CheckCircle2,
  Loader2,
  Send,
  Star,
} from "lucide-react";


export function TestimonialSubmissionForm() {
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
    email,
    setEmail,
  ] =
    useState(
      "",
    );


  const [
    phone,
    setPhone,
  ] =
    useState(
      "",
    );


  const [
    rating,
    setRating,
  ] =
    useState<
      number | null
    >(
      5,
    );


  const [
    consent,
    setConsent,
  ] =
    useState(
      false,
    );


  const [
    pending,
    setPending,
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


  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();


    setError(
      "",
    );

    setSuccess(
      "",
    );

    setPending(
      true,
    );


    const formData =
      new FormData(
        event.currentTarget,
      );


    const website =
      String(
        formData.get(
          "website",
        ) ??
        "",
      );


    try {
      const response =
        await fetch(
          "/api/testimonials",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                customerName,

                customerTitle,

                organization,

                testimonial,

                rating,

                email,

                phone,

                consent,

                website,
              }),
          },
        );


      const result =
        await response.json();


      if (
        !response.ok ||
        !result.success
      ) {
        setError(
          result.message ||
          "Your testimonial could not be submitted.",
        );

        return;
      }


      setSuccess(
        result.message,
      );


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

      setEmail(
        "",
      );

      setPhone(
        "",
      );

      setRating(
        5,
      );

      setConsent(
        false,
      );
    } catch (
      submitError
    ) {
      console.error(
        "Testimonial submission failed:",
        submitError,
      );


      setError(
        "Your testimonial could not be submitted. Please try again.",
      );
    } finally {
      setPending(
        false,
      );
    }
  }


  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div>
        <p className="text-sm font-semibold text-blue-600">
          Share Your Experience
        </p>

        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Tell us how we did.
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Testimonials are reviewed before publication. Your email
          address and phone number are used only for verification
          and are never displayed publicly.
        </p>
      </div>


      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <PublicField
          label="Name"
          required
        >
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
            required
            maxLength={
              200
            }
            className="public-testimonial-input"
          />
        </PublicField>


        <PublicField label="Title / Role">
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
            maxLength={
              200
            }
            placeholder="e.g. Student, Graduate"
            className="public-testimonial-input"
          />
        </PublicField>


        <PublicField label="Organization / Institution">
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
            maxLength={
              250
            }
            className="public-testimonial-input"
          />
        </PublicField>


        <PublicField
          label="Email"
          required
        >
          <input
            type="email"
            value={
              email
            }
            onChange={(
              event,
            ) =>
              setEmail(
                event.target
                  .value,
              )
            }
            required
            maxLength={
              250
            }
            className="public-testimonial-input"
          />
        </PublicField>


        <PublicField label="Phone Number">
          <input
            type="tel"
            value={
              phone
            }
            onChange={(
              event,
            ) =>
              setPhone(
                event.target
                  .value,
              )
            }
            maxLength={
              40
            }
            className="public-testimonial-input"
          />
        </PublicField>


        <PublicField label="Rating">
          <div className="flex h-11 items-center gap-1 rounded-xl border border-slate-200 px-3">
            {[
              1,
              2,
              3,
              4,
              5,
            ].map(
              (
                value,
              ) => (
                <button
                  key={
                    value
                  }
                  type="button"
                  onClick={() =>
                    setRating(
                      value,
                    )
                  }
                  aria-label={`${value} star rating`}
                  className="p-1"
                >
                  <Star
                    className={`h-5 w-5 ${
                      rating &&
                      value <=
                        rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                </button>
              ),
            )}
          </div>
        </PublicField>
      </div>


      <div className="mt-5">
        <PublicField
          label="Your Experience"
          required
        >
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
            required
            minLength={
              10
            }
            maxLength={
              3000
            }
            rows={
              7
            }
            placeholder="Tell us about your experience with Seekers Connect..."
            className="public-testimonial-textarea"
          />
        </PublicField>
      </div>


      {/* =================================================
          HONEYPOT
      ================================================= */}

      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label>
          Website

          <input
            name="website"
            type="text"
            tabIndex={
              -1
            }
            autoComplete="off"
          />
        </label>
      </div>


      <label className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
        <input
          type="checkbox"
          checked={
            consent
          }
          onChange={(
            event,
          ) =>
            setConsent(
              event.target
                .checked,
            )
          }
          required
          className="mt-1"
        />

        <span className="text-xs leading-5 text-slate-600">
          I confirm that this reflects my experience and understand
          that Seekers Connect may review and publish the testimonial.
          My private contact information will not be displayed publicly.
        </span>
      </label>


      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {
            error
          }
        </div>
      )}


      {success && (
        <div className="mt-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

          <span>
            {
              success
            }
          </span>
        </div>
      )}


      <button
        type="submit"
        disabled={
          pending
        }
        className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />

            Submitting...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />

            Submit Testimonial
          </>
        )}
      </button>


      <style jsx>{`
        .public-testimonial-input {
          height: 44px;
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgb(226 232 240);
          padding: 0 12px;
          font-size: 14px;
          outline: none;
        }

        .public-testimonial-textarea {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgb(226 232 240);
          padding: 12px;
          font-size: 14px;
          outline: none;
          resize: vertical;
        }

        .public-testimonial-input:focus,
        .public-testimonial-textarea:focus {
          border-color: rgb(96 165 250);
          box-shadow: 0 0 0 2px rgb(219 234 254);
        }
      `}</style>
    </form>
  );
}


function PublicField({
  label,
  required,
  children,
}: {
  label:
    string;

  required?:
    boolean;

  children:
    React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {
          label
        }

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>


      <div className="mt-2">
        {
          children
        }
      </div>
    </label>
  );
}