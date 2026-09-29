"use client";

import {
  type ChangeEvent,
  useState,
} from "react";

import {
  CheckCircle2,
  FileUp,
  Loader2,
  Upload,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  Button,
} from "@/components/ui/button";

import {
  Label,
} from "@/components/ui/label";


type DocumentType =
  | "SCANNED_TRANSCRIPT"
  | "ATTESTATION"
  | "PROFICIENCY_LETTER"
  | "OTHER";


const documentTypes: {
  value: DocumentType;
  label: string;
}[] = [
  {
    value:
      "SCANNED_TRANSCRIPT",

    label:
      "Scanned Transcript",
  },

  {
    value:
      "ATTESTATION",

    label:
      "Attestation",
  },

  {
    value:
      "PROFICIENCY_LETTER",

    label:
      "Proficiency Letter",
  },

  {
    value:
      "OTHER",

    label:
      "Other Document",
  },
];


export function RequestDocumentUpload({
  requestId,
}: {
  requestId: string;
}) {
  const router =
    useRouter();


  const [
    documentType,
    setDocumentType,
  ] =
    useState<DocumentType>(
      "SCANNED_TRANSCRIPT",
    );


  const [
    file,
    setFile,
  ] =
    useState<File | null>(
      null,
    );


  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setError("");
    setSuccess("");

    const selectedFile =
      event.target.files?.[0] ??
      null;

    setFile(
      selectedFile,
    );
  }


  async function handleUpload() {
    if (!file) {
      setError(
        "Select the scanned document first.",
      );

      return;
    }


    setError("");
    setSuccess("");
    setSubmitting(true);


    try {
      const formData =
        new FormData();


      formData.append(
        "document",
        file,
      );


      formData.append(
        "documentType",
        documentType,
      );


      const response =
        await fetch(
          `/api/admin/requests/${requestId}/documents`,
          {
            method: "POST",
            body: formData,
          },
        );


      const result =
        await response.json();


      if (!response.ok) {
        throw new Error(
          result.message ||
            "The document could not be uploaded.",
        );
      }


      setSuccess(
        "Document uploaded successfully.",
      );


      setFile(null);


      // Reload the server page so the new
      // DOCUMENT_SCANNED status is displayed.
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "The document could not be uploaded.",
      );
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <div className="rounded-[22px] border border-cyan-200 bg-cyan-50 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
          <FileUp className="h-5 w-5" />
        </div>

        <div>
          <p className="font-semibold text-cyan-950">
            Upload Completed Document
          </p>

          <p className="mt-1 text-sm leading-6 text-cyan-800">
            Upload the scanned document received from the university.
            The customer will only receive access after the upload is
            completed successfully.
          </p>
        </div>
      </div>


      <div className="mt-5 space-y-2">
        <Label
          htmlFor="documentType"
        >
          Document Type
        </Label>

        <select
          id="documentType"
          value={
            documentType
          }
          onChange={(
            event,
          ) =>
            setDocumentType(
              event.target
                .value as DocumentType,
            )
          }
          disabled={
            submitting
          }
          className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          {documentTypes.map(
            (type) => (
              <option
                key={
                  type.value
                }
                value={
                  type.value
                }
              >
                {type.label}
              </option>
            ),
          )}
        </select>
      </div>


      <div className="mt-5 space-y-2">
        <Label
          htmlFor="scannedDocument"
        >
          Scanned Document
        </Label>

        <label
          htmlFor="scannedDocument"
          className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-300 bg-white px-4 py-7 text-center transition hover:border-cyan-500 hover:bg-cyan-50/50"
        >
          <Upload className="h-5 w-5 text-cyan-700" />

          {file ? (
            <>
              <p className="mt-3 max-w-full truncate text-sm font-semibold text-slate-800">
                {file.name}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {formatFileSize(
                  file.size,
                )}
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm font-medium text-slate-700">
                Choose a file
              </p>

              <p className="mt-1 text-xs text-slate-400">
                PDF, JPG or PNG · maximum 10 MB
              </p>
            </>
          )}
        </label>

        <input
          id="scannedDocument"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="hidden"
          disabled={
            submitting
          }
          onChange={
            handleFileChange
          }
        />
      </div>


      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700">
          {error}
        </div>
      )}


      {success && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />

          {success}
        </div>
      )}


      <Button
        type="button"
        onClick={
          handleUpload
        }
        disabled={
          submitting ||
          !file
        }
        className="mt-5 w-full rounded-xl bg-cyan-700 hover:bg-cyan-800"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </>
        )}
      </Button>


      <p className="mt-3 text-xs leading-5 text-cyan-800">
        Documents are stored privately and are not available through
        a public storage URL.
      </p>
    </div>
  );
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