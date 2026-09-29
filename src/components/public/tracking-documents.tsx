"use client";

import {
  useState,
} from "react";

import {
  Download,
  FileCheck2,
  FileText,
  Loader2,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import type {
  TrackingDocument,
} from "@/types/tracking";


export function TrackingDocuments({
  documents,
  trackingNumber,
  trackingPin,
}: {
  documents:
    TrackingDocument[];

  trackingNumber: string;

  trackingPin: string;
}) {
  const [
    openingId,
    setOpeningId,
  ] =
    useState<
      string | null
    >(
      null,
    );


  const [
    error,
    setError,
  ] =
    useState("");


  async function openDocument(
    documentId: string,
  ) {
    setError("");
    setOpeningId(
      documentId,
    );


    try {
      const response =
        await fetch(
          `/api/track/documents/${documentId}`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                trackingNumber,
                trackingPin,
              }),
          },
        );


      const result =
        await response.json();


      if (
        !response.ok
      ) {
        throw new Error(
          result.message ||
            "The document could not be opened.",
        );
      }


      window.open(
        result.url,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "The document could not be opened.",
      );
    } finally {
      setOpeningId(
        null,
      );
    }
  }


  if (
    documents.length ===
    0
  ) {
    return null;
  }


  return (
    <div className="mt-9">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <FileCheck2 className="h-5 w-5" />
        </div>

        <div>
          <p className="font-semibold text-slate-950">
            Available Documents
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Your completed document is available through secure
            temporary access.
          </p>
        </div>
      </div>


      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}


      <div className="mt-5 space-y-3">
        {documents.map(
          (document) => (
            <div
              key={
                document.id
              }
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {document.fileName ??
                      documentTypeLabel(
                        document.documentType,
                      )}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {documentTypeLabel(
                      document.documentType,
                    )}

                    {document.sizeBytes
                      ? ` · ${formatFileSize(
                          document.sizeBytes,
                        )}`
                      : ""}
                  </p>
                </div>
              </div>


              <Button
                type="button"
                variant="outline"
                disabled={
                  openingId ===
                  document.id
                }
                onClick={() =>
                  openDocument(
                    document.id,
                  )
                }
                className="shrink-0 rounded-xl"
              >
                {openingId ===
                document.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Open Document
                  </>
                )}
              </Button>
            </div>
          ),
        )}
      </div>


      <p className="mt-3 text-xs leading-5 text-slate-400">
        For security, document links expire after a short period.
        Return to this tracking page whenever you need a new secure
        link.
      </p>
    </div>
  );
}


function documentTypeLabel(
  documentType:
    TrackingDocument["documentType"],
) {
  switch (
    documentType
  ) {
    case "SCANNED_TRANSCRIPT":
      return "Scanned Transcript";

    case "ATTESTATION":
      return "Attestation";

    case "PROFICIENCY_LETTER":
      return "Proficiency Letter";

    default:
      return "Document";
  }
}


function formatFileSize(
  size: number,
) {
  if (
    size <
    1024
  ) {
    return `${size} bytes`;
  }


  if (
    size <
    1024 * 1024
  ) {
    return `${(
      size / 1024
    ).toFixed(
      1,
    )} KB`;
  }


  return `${(
    size /
    (1024 * 1024)
  ).toFixed(
    1,
  )} MB`;
}