import {
  Download,
  FileText,
  ImageIcon,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  requireAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";


type RequestUploadRow = {
  id:
    string;

  field_key:
    string;

  field_label:
    string;

  source:
    "UPLOAD"
    | "EMAIL_FALLBACK";

  storage_path:
    string | null;

  original_filename:
    string | null;

  mime_type:
    string | null;

  size_bytes:
    number | null;

  email_reference:
    string | null;

  created_at:
    string;
};


type DisplayUpload =
  RequestUploadRow & {
    signedUrl:
      string | null;
  };


export async function RequestUploadReview({
  requestId,
}: {
  requestId:
    string;
}) {
  await requireAdmin();


  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "request_uploads",
      )
      .select(`
        id,
        field_key,
        field_label,
        source,
        storage_path,
        original_filename,
        mime_type,
        size_bytes,
        email_reference,
        created_at
      `)
      .eq(
        "request_id",
        requestId,
      )
      .order(
        "created_at",
        {
          ascending:
            true,
        },
      );


  if (
    error
  ) {
    console.error(
      "Request uploads query failed:",
      error,
    );


    return (
      <section className="rounded-[24px] border border-red-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="font-semibold text-red-700">
          Customer documents could not be loaded.
        </p>
      </section>
    );
  }


  const uploads =
    (
      data ??
      []
    ) as RequestUploadRow[];


  if (
    uploads.length ===
    0
  ) {
    return null;
  }


  const displayUploads:
    DisplayUpload[] =
    await Promise.all(
      uploads.map(
        async (
          upload,
        ) => {
          if (
            upload.source !==
              "UPLOAD" ||
            !upload.storage_path
          ) {
            return {
              ...upload,

              signedUrl:
                null,
            };
          }


          const {
            data:
              signedData,

            error:
              signedError,
          } =
            await supabase.storage
              .from(
                "request-uploads",
              )
              .createSignedUrl(
                upload.storage_path,
                60 * 10,
              );


          if (
            signedError
          ) {
            console.error(
              "Request upload signed URL failed:",
              signedError,
            );
          }


          return {
            ...upload,

            signedUrl:
              signedData
                ?.signedUrl ??
              null,
          };
        },
      ),
    );


  const grouped =
    new Map<
      string,
      DisplayUpload[]
    >();


  for (
    const upload of
    displayUploads
  ) {
    const current =
      grouped.get(
        upload.field_key,
      ) ??
      [];


    current.push(
      upload,
    );


    grouped.set(
      upload.field_key,
      current,
    );
  }


  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <ShieldCheck className="h-4 w-4" />
        </div>


        <div>
          <h2 className="font-semibold text-slate-950">
            Customer Documents
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Sensitive customer files are stored privately.
            Access links below expire after 10 minutes.
          </p>
        </div>
      </div>


      <div className="mt-5 space-y-5">
        {Array.from(
          grouped.entries(),
        ).map(
          ([
            fieldKey,
            fieldUploads,
          ]) => (
            <div
              key={
                fieldKey
              }
              className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <p className="text-sm font-semibold text-slate-900">
                {
                  fieldUploads[0]
                    ?.field_label
                }
              </p>


              <div className="mt-3 space-y-2">
                {fieldUploads.map(
                  (
                    upload,
                  ) => {
                    if (
                      upload.source ===
                      "EMAIL_FALLBACK"
                    ) {
                      return (
                        <div
                          key={
                            upload.id
                          }
                          className="rounded-xl border border-amber-200 bg-amber-50 p-4"
                        >
                          <div className="flex gap-3">
                            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />

                            <div>
                              <p className="text-sm font-medium text-amber-950">
                                Sent by email
                              </p>

                              <p className="mt-1 text-xs leading-5 text-amber-800">
                                Reference:{" "}
                                <strong>
                                  {
                                    upload.email_reference ??
                                    "No reference supplied"
                                  }
                                </strong>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }


                    const isImage =
                      upload.mime_type
                        ?.startsWith(
                          "image/",
                        ) ??
                      false;


                    return (
                      <div
                        key={
                          upload.id
                        }
                        className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          {isImage ? (
                            <ImageIcon className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </div>


                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {
                              upload.original_filename ??
                              "Uploaded document"
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {
                              upload.mime_type ??
                              "Unknown file type"
                            }

                            {upload.size_bytes !==
                              null && (
                              <>
                                {" · "}
                                {
                                  formatFileSize(
                                    upload.size_bytes,
                                  )
                                }
                              </>
                            )}
                          </p>
                        </div>


                        {upload.signedUrl ? (
                          <a
                            href={
                              upload.signedUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-semibold text-white transition hover:bg-slate-800"
                          >
                            <Download className="h-3.5 w-3.5" />

                            Open
                          </a>
                        ) : (
                          <span className="text-xs font-medium text-red-600">
                            File unavailable
                          </span>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}


function formatFileSize(
  bytes:
    number,
) {
  if (
    bytes <
    1024
  ) {
    return `${bytes} B`;
  }


  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes /
      1024
    ).toFixed(
      1,
    )} KB`;
  }


  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(
    2,
  )} MB`;
}