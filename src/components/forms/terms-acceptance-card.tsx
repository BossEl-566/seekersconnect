"use client";

import Link from "next/link";

import {
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";


type TermsApiResponse = {
  success?:
    boolean;

  page?: {
    version:
      number;

    title:
      string;

    summary:
      string | null;
  };

  message?:
    string;
};


export function TermsAcceptanceCard({
  accepted,
  acceptedVersion,
  onChange,
}: {
  accepted:
    boolean;

  acceptedVersion:
    number | null;

  onChange:
    (
      accepted:
        boolean,

      version:
        number | null,
    ) => void;
}) {
  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );


  const [
    version,
    setVersion,
  ] =
    useState<
      number | null
    >(
      null,
    );


  const [
    error,
    setError,
  ] =
    useState(
      "",
    );


  useEffect(
    () => {
      let cancelled =
        false;


      async function loadTerms() {
        setLoading(
          true,
        );

        setError(
          "",
        );


        try {
          const response =
            await fetch(
              "/api/site-pages/terms",
              {
                cache:
                  "no-store",
              },
            );


          const result =
            await response.json() as
              TermsApiResponse;


          if (
            cancelled
          ) {
            return;
          }


          if (
            !response.ok ||
            !result.success ||
            !result.page
          ) {
            setError(
              result.message ||
              "Terms and Conditions are currently unavailable.",
            );

            return;
          }


          const currentVersion =
            result.page.version;


          setVersion(
            currentVersion,
          );


          /*
           * A draft may have been saved in localStorage under
           * an older Terms version. Never silently carry that
           * acceptance into a newer version.
           */
          if (
            acceptedVersion !==
              null &&
            acceptedVersion !==
              currentVersion
          ) {
            onChange(
              false,
              currentVersion,
            );
          } else if (
            acceptedVersion ===
            null
          ) {
            onChange(
              false,
              currentVersion,
            );
          }
        } catch (
          loadError
        ) {
          console.error(
            "Terms loading failed:",
            loadError,
          );


          if (
            !cancelled
          ) {
            setError(
              "Terms and Conditions could not be loaded.",
            );
          }
        } finally {
          if (
            !cancelled
          ) {
            setLoading(
              false,
            );
          }
        }
      }


      void loadTerms();


      return () => {
        cancelled =
          true;
      };
    },
    [
      acceptedVersion,
      onChange,
    ],
  );


  if (
    loading
  ) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />

        Loading Terms and Conditions...
      </div>
    );
  }


  if (
    error ||
    version ===
      null
  ) {
    return (
      <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

        <div>
          <p className="text-sm font-semibold text-red-900">
            Terms unavailable
          </p>

          <p className="mt-1 text-sm leading-6 text-red-700">
            {
              error
            }
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
          <ShieldCheck className="h-4 w-4" />
        </div>


        <div>
          <p className="font-semibold text-blue-950">
            Terms and Conditions
          </p>

          <p className="mt-1 text-sm leading-6 text-blue-800">
            Please review and accept the current service Terms before
            submitting this request.
          </p>


          <Link
            href="/terms"
            target="_blank"
            className="mt-2 inline-flex text-sm font-semibold text-blue-700 underline underline-offset-4"
          >
            Read Terms & Conditions — Version{" "}
            {
              version
            }
          </Link>
        </div>
      </div>


      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-blue-200 bg-white p-4">
        <input
          type="checkbox"
          checked={
            accepted &&
            acceptedVersion ===
              version
          }
          onChange={(
            event,
          ) =>
            onChange(
              event.target
                .checked,

              version,
            )
          }
          className="mt-1"
        />


        <span className="text-sm leading-6 text-slate-700">
          I have reviewed and accept the{" "}

          <Link
            href="/terms"
            target="_blank"
            className="font-semibold text-blue-700 underline underline-offset-4"
          >
            Terms and Conditions
          </Link>

          {" "}Version{" "}

          <strong>
            {
              version
            }
          </strong>

          . I confirm that the information in this request is correct.
        </span>
      </label>
    </div>
  );
}