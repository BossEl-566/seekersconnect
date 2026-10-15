"use client";

import {
  useState,
} from "react";

import {
  CheckCircle2,
  FileText,
  Mail,
  Upload,
  X,
} from "lucide-react";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import type {
  RequestCatalogField,
} from "@/types/request-catalog";

import {
  getUploadAcceptAttribute,
  getUploadMaximumFiles,
  getUploadMaximumMb,
  validateRequestUploadFile,
  type RequestUploadFallback,
} from "@/lib/request/request-upload";


export function DynamicRequestUploadField({
  field,
  files,
  fallback,
  supportEmail,
  onFilesChange,
  onFallbackChange,
}: {
  field:
    RequestCatalogField;

  files:
    File[];

  fallback:
    RequestUploadFallback
    | undefined;

  supportEmail:
    string;

  onFilesChange:
    (
      files:
        File[],
    ) => void;

  onFallbackChange:
    (
      fallback:
        RequestUploadFallback,
    ) => void;
}) {
  const [
    error,
    setError,
  ] =
    useState(
      "",
    );


  const maximumFiles =
    getUploadMaximumFiles(
      field,
    );


  const maximumMb =
    getUploadMaximumMb(
      field,
    );


  const currentFallback =
    fallback ?? {
      sent:
        false,

      reference:
        "",
    };


  function selectFiles(
    incoming:
      File[],
  ) {
    setError(
      "",
    );


    const merged:
      File[] =
      [
        ...files,
      ];


    for (
      const file of
      incoming
    ) {
      const duplicate =
        merged.some(
          (
            existing,
          ) =>
            existing.name ===
              file.name &&
            existing.size ===
              file.size &&
            existing.lastModified ===
              file.lastModified,
        );


      if (
        !duplicate
      ) {
        merged.push(
          file,
        );
      }
    }


    if (
      merged.length >
      maximumFiles
    ) {
      setError(
        `You can upload a maximum of ${maximumFiles} file${
          maximumFiles ===
          1
            ? ""
            : "s"
        }.`,
      );

      return;
    }


    for (
      const file of
      merged
    ) {
      const fileError =
        validateRequestUploadFile(
          field,
          file,
        );


      if (
        fileError
      ) {
        setError(
          fileError,
        );

        return;
      }
    }


    onFallbackChange({
      sent:
        false,

      reference:
        "",
    });


    onFilesChange(
      merged,
    );
  }


  function removeFile(
    index:
      number,
  ) {
    setError(
      "",
    );


    onFilesChange(
      files.filter(
        (
          _,
          currentIndex,
        ) =>
          currentIndex !==
          index,
      ),
    );
  }


  return (
    <div className="space-y-3 sm:col-span-2">
      <div>
        <Label>
          {
            field.label
          }

          {field.required && (
            <span className="ml-1 text-red-500">
              *
            </span>
          )}
        </Label>


        {field.helpText && (
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {
              field.helpText
            }
          </p>
        )}
      </div>


      {!currentFallback.sent && (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-7 text-center transition hover:border-blue-300 hover:bg-blue-50/50">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <Upload className="h-5 w-5" />
          </div>


          <p className="mt-4 text-sm font-semibold text-slate-900">
            {field.type ===
            "image"
              ? "Upload image"
              : field.type ===
                  "document"
                ? "Upload document"
                : "Upload file"}
          </p>


          <p className="mt-1 text-xs leading-5 text-slate-500">
            Maximum{" "}
            {
              maximumMb
            }{" "}
            MB per file
            {" · "}
            Up to{" "}
            {
              maximumFiles
            }{" "}
            file
            {maximumFiles ===
            1
              ? ""
              : "s"}
          </p>


          <input
            type="file"
            multiple={
              maximumFiles >
              1
            }
            accept={
              getUploadAcceptAttribute(
                field,
              )
            }
            className="hidden"
            onChange={(
              event,
            ) => {
              const selected =
                Array.from(
                  event.target
                    .files ??
                    [],
                );


              selectFiles(
                selected,
              );


              event.currentTarget.value =
                "";
            }}
          />
        </label>
      )}


      {files.length >
        0 && (
        <div className="space-y-2">
          {files.map(
            (
              file,
              index,
            ) => (
              <div
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FileText className="h-4 w-4" />
                </div>


                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {
                      file.name
                    }
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {(
                      file.size /
                      1024 /
                      1024
                    ).toFixed(
                      2,
                    )}{" "}
                    MB
                  </p>
                </div>


                <button
                  type="button"
                  onClick={() =>
                    removeFile(
                      index,
                    )
                  }
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ),
          )}


          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />

            {
              files.length
            }{" "}
            file
            {files.length ===
            1
              ? ""
              : "s"}{" "}
            ready
          </div>
        </div>
      )}


      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {
            error
          }
        </div>
      )}


      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={
              currentFallback.sent
            }
            onChange={(
              event,
            ) => {
              const checked =
                event.target
                  .checked;


              setError(
                "",
              );


              if (
                checked
              ) {
                onFilesChange(
                  [],
                );


                onFallbackChange({
                  sent:
                    true,

                  reference:
                    "",
                });

                return;
              }


              onFallbackChange({
                sent:
                  false,

                reference:
                  "",
              });
            }}
            className="mt-1 h-4 w-4 rounded"
          />


          <div>
            <p className="text-sm font-medium text-slate-900">
              I sent this document by email
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Use this option when you cannot upload the file here.
            </p>
          </div>
        </label>


        {currentFallback.sent && (
          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
            <div className="flex gap-3 rounded-xl bg-blue-50 p-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

              <p className="text-xs leading-5 text-blue-800">
                Send the document to{" "}
                <strong>
                  {
                    supportEmail
                  }
                </strong>
                , then enter the email subject or another reference below.
              </p>
            </div>


            <div className="space-y-2">
              <Label>
                Email Reference / Subject

                <span className="ml-1 text-red-500">
                  *
                </span>
              </Label>


              <Input
                value={
                  currentFallback
                    .reference
                }
                onChange={(
                  event,
                ) =>
                  onFallbackChange({
                    sent:
                      true,

                    reference:
                      event.target
                        .value,
                  })
                }
                placeholder="e.g. John Mensah - Payslip - Loan Application"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}