"use client";

import {
  type FormEvent,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FileText,
  ImageIcon,
  Images,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";


export type ServiceMediaItem = {
  id:
    string;

  service_id:
    string;

  media_kind:
    "HERO_IMAGE"
    | "GALLERY_IMAGE"
    | "DOWNLOAD";

  title:
    string;

  description:
    string | null;

  alt_text:
    string | null;

  storage_bucket:
    string;

  storage_path:
    string;

  original_filename:
    string;

  mime_type:
    string;

  size_bytes:
    number;

  display_order:
    number;

  active:
    boolean;

  created_at:
    string;

  updated_at:
    string;

  publicUrl:
    string;
};


type MediaKind =
  ServiceMediaItem[
    "media_kind"
  ];


// =========================================================
// COMPONENT
// =========================================================

export function ServiceMediaManager({
  serviceId,
  serviceName,
  media,
}: {
  serviceId:
    string;

  serviceName:
    string;

  media:
    ServiceMediaItem[];
}) {
  const router =
    useRouter();


  const formRef =
    useRef<HTMLFormElement>(
      null,
    );


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  const [
    mediaKind,
    setMediaKind,
  ] =
    useState<MediaKind>(
      "HERO_IMAGE",
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


  const hero =
    useMemo(
      () =>
        media.find(
          (
            item,
          ) =>
            item.media_kind ===
            "HERO_IMAGE",
        ) ??
        null,

      [
        media,
      ],
    );


  const gallery =
    useMemo(
      () =>
        media.filter(
          (
            item,
          ) =>
            item.media_kind ===
            "GALLERY_IMAGE",
        ),

      [
        media,
      ],
    );


  const downloads =
    useMemo(
      () =>
        media.filter(
          (
            item,
          ) =>
            item.media_kind ===
            "DOWNLOAD",
        ),

      [
        media,
      ],
    );


  // =======================================================
  // UPLOAD
  // =======================================================

  function handleSubmit(
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


    const form =
      event.currentTarget;


    const formData =
      new FormData(
        form,
      );


    formData.set(
      "mediaKind",
      mediaKind,
    );


    startTransition(
      async () => {
        try {
          const response =
            await fetch(
              `/api/admin/services/${serviceId}/media`,
              {
                method:
                  "POST",

                body:
                  formData,
              },
            );


          const result =
            await readJson(
              response,
            );


          if (
            !response.ok ||
            !result.success
          ) {
            setError(
              result.message ||
              "The media item could not be uploaded.",
            );

            return;
          }


          setSuccess(
            result.message ||
            "Media uploaded successfully.",
          );


          formRef.current
            ?.reset();


          setMediaKind(
            "HERO_IMAGE",
          );


          router.refresh();
        } catch (
          uploadError
        ) {
          console.error(
            "Service media upload request failed:",
            uploadError,
          );


          setError(
            "The media item could not be uploaded. Please try again.",
          );
        }
      },
    );
  }


  // =======================================================
  // ENABLE / DISABLE
  // =======================================================

  function toggleMedia(
    item:
      ServiceMediaItem,
  ) {
    setError(
      "",
    );

    setSuccess(
      "",
    );


    startTransition(
      async () => {
        try {
          const response =
            await fetch(
              `/api/admin/services/${serviceId}/media`,
              {
                method:
                  "PATCH",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body:
                  JSON.stringify({
                    mediaId:
                      item.id,

                    active:
                      !item.active,
                  }),
              },
            );


          const result =
            await readJson(
              response,
            );


          if (
            !response.ok ||
            !result.success
          ) {
            setError(
              result.message ||
              "The media status could not be changed.",
            );

            return;
          }


          setSuccess(
            result.message ||
            "Media status updated.",
          );


          router.refresh();
        } catch (
          updateError
        ) {
          console.error(
            "Service media update request failed:",
            updateError,
          );


          setError(
            "The media status could not be changed.",
          );
        }
      },
    );
  }


  // =======================================================
  // DELETE
  // =======================================================

  function deleteMedia(
    item:
      ServiceMediaItem,
  ) {
    const confirmed =
      window.confirm(
        `Delete "${item.title}" permanently?`,
      );


    if (
      !confirmed
    ) {
      return;
    }


    setError(
      "",
    );

    setSuccess(
      "",
    );


    startTransition(
      async () => {
        try {
          const response =
            await fetch(
              `/api/admin/services/${serviceId}/media?mediaId=${encodeURIComponent(
                item.id,
              )}`,
              {
                method:
                  "DELETE",
              },
            );


          const result =
            await readJson(
              response,
            );


          if (
            !response.ok ||
            !result.success
          ) {
            setError(
              result.message ||
              "The media item could not be deleted.",
            );

            return;
          }


          setSuccess(
            result.message ||
            "Media item deleted.",
          );


          router.refresh();
        } catch (
          deleteError
        ) {
          console.error(
            "Service media deletion request failed:",
            deleteError,
          );


          setError(
            "The media item could not be deleted.",
          );
        }
      },
    );
  }


  // =======================================================
  // UI
  // =======================================================

  return (
    <div className="space-y-6">
      {/* =================================================
          UPLOAD
      ================================================= */}

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Upload className="h-5 w-5" />
          </div>


          <div>
            <h2 className="font-semibold text-slate-950">
              Add Service Media
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Upload public images or downloadable resources for{" "}
              <strong className="font-medium text-slate-700">
                {
                  serviceName
                }
              </strong>
              .
            </p>
          </div>
        </div>


        <form
          ref={
            formRef
          }
          onSubmit={
            handleSubmit
          }
          className="mt-6 space-y-5"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Media Type
              </label>


              <select
                value={
                  mediaKind
                }
                onChange={(
                  event,
                ) =>
                  setMediaKind(
                    event.target
                      .value as
                      MediaKind,
                  )
                }
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="HERO_IMAGE">
                  Hero / Cover Image
                </option>

                <option value="GALLERY_IMAGE">
                  Gallery Image
                </option>

                <option value="DOWNLOAD">
                  Downloadable File
                </option>
              </select>


              {mediaKind ===
                "HERO_IMAGE" && (
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  A service can have only one hero image.
                  Uploading another will replace the existing hero.
                </p>
              )}
            </div>


            <div>
              <label className="text-sm font-medium text-slate-700">
                Display Order
              </label>

              <input
                name="displayOrder"
                type="number"
                min="0"
                max="100000"
                defaultValue="0"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Lower values appear first.
              </p>
            </div>
          </div>


          <div>
            <label className="text-sm font-medium text-slate-700">
              Title
            </label>

            <input
              name="title"
              type="text"
              maxLength={
                200
              }
              required
              placeholder={
                mediaKind ===
                "DOWNLOAD"
                  ? "e.g. Teaching Practicum Form"
                  : "e.g. Printing Services"
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>


          <div>
            <label className="text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              name="description"
              maxLength={
                2000
              }
              rows={
                4
              }
              placeholder="Optional description..."
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>


          {mediaKind !==
            "DOWNLOAD" && (
            <div>
              <label className="text-sm font-medium text-slate-700">
                Alternative Text
              </label>

              <input
                name="altText"
                type="text"
                maxLength={
                  300
                }
                placeholder="Describe the image for accessibility."
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          )}


          <div>
            <label className="text-sm font-medium text-slate-700">
              File
            </label>


            <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50/50">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                {mediaKind ===
                "DOWNLOAD" ? (
                  <FileText className="h-5 w-5" />
                ) : (
                  <ImageIcon className="h-5 w-5" />
                )}
              </div>


              <p className="mt-4 text-sm font-semibold text-slate-900">
                Choose file
              </p>


              <p className="mt-1 text-xs leading-5 text-slate-500">
                {mediaKind ===
                "DOWNLOAD"
                  ? "PDF, Word, Excel, JPG, PNG or WEBP"
                  : "JPG, PNG or WEBP"}
                {" · "}
                Maximum 10 MB
              </p>


              <input
                name="file"
                type="file"
                required
                accept={
                  mediaKind ===
                  "DOWNLOAD"
                    ? ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                    : ".jpg,.jpeg,.png,.webp"
                }
                className="hidden"
              />
            </label>
          </div>


          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {
                error
              }
            </div>
          )}


          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />

              {
                success
              }
            </div>
          )}


          <button
            type="submit"
            disabled={
              pending
            }
            className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                Saving...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />

                Upload Media
              </>
            )}
          </button>
        </form>
      </section>


      {/* =================================================
          HERO
      ================================================= */}

      <MediaSection
        icon={
          ImageIcon
        }
        title="Hero Image"
        description="The primary image used to represent this service."
      >
        {!hero ? (
          <EmptyState text="No hero image has been uploaded." />
        ) : (
          <MediaCard
            item={
              hero
            }
            pending={
              pending
            }
            onToggle={() =>
              toggleMedia(
                hero,
              )
            }
            onDelete={() =>
              deleteMedia(
                hero,
              )
            }
          />
        )}
      </MediaSection>


      {/* =================================================
          GALLERY
      ================================================= */}

      <MediaSection
        icon={
          Images
        }
        title="Gallery"
        description="Additional public images associated with this service."
      >
        {gallery.length ===
        0 ? (
          <EmptyState text="No gallery images have been uploaded." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {gallery.map(
              (
                item,
              ) => (
                <MediaCard
                  key={
                    item.id
                  }
                  item={
                    item
                  }
                  pending={
                    pending
                  }
                  onToggle={() =>
                    toggleMedia(
                      item,
                    )
                  }
                  onDelete={() =>
                    deleteMedia(
                      item,
                    )
                  }
                />
              ),
            )}
          </div>
        )}
      </MediaSection>


      {/* =================================================
          DOWNLOADS
      ================================================= */}

      <MediaSection
        icon={
          Download
        }
        title="Public Downloads"
        description="Forms, templates and other files customers can download."
      >
        {downloads.length ===
        0 ? (
          <EmptyState text="No downloadable files have been uploaded." />
        ) : (
          <div className="space-y-3">
            {downloads.map(
              (
                item,
              ) => (
                <DownloadCard
                  key={
                    item.id
                  }
                  item={
                    item
                  }
                  pending={
                    pending
                  }
                  onToggle={() =>
                    toggleMedia(
                      item,
                    )
                  }
                  onDelete={() =>
                    deleteMedia(
                      item,
                    )
                  }
                />
              ),
            )}
          </div>
        )}
      </MediaSection>
    </div>
  );
}


// =========================================================
// MEDIA SECTION
// =========================================================

function MediaSection({
  icon:
    Icon,

  title,

  description,

  children,
}: {
  icon:
    React.ElementType;

  title:
    string;

  description:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon className="h-4 w-4" />
        </div>


        <div>
          <h2 className="font-semibold text-slate-950">
            {
              title
            }
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {
              description
            }
          </p>
        </div>
      </div>


      <div className="pt-5">
        {
          children
        }
      </div>
    </section>
  );
}


// =========================================================
// MEDIA IMAGE CARD
// =========================================================

function MediaCard({
  item,
  pending,
  onToggle,
  onDelete,
}: {
  item:
    ServiceMediaItem;

  pending:
    boolean;

  onToggle:
    () => void;

  onDelete:
    () => void;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border ${
        item.active
          ? "border-slate-200 bg-white"
          : "border-slate-200 bg-slate-50 opacity-70"
      }`}
    >
      <div className="flex min-h-[190px] items-center justify-center bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}

        <img
          src={
            item.publicUrl
          }
          alt={
            item.alt_text ||
            item.title
          }
          className="max-h-[300px] w-full object-cover"
        />
      </div>


      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {
                item.title
              }
            </p>


            <p className="mt-1 text-xs text-slate-400">
              {
                readableMediaKind(
                  item.media_kind,
                )
              }

              {" · "}

              {
                formatFileSize(
                  item.size_bytes,
                )
              }

              {" · "}

              Order{" "}

              {
                item.display_order
              }
            </p>
          </div>


          <StatusBadge
            active={
              item.active
            }
          />
        </div>


        {item.description && (
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {
              item.description
            }
          </p>
        )}


        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={
              item.publicUrl
            }
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Eye className="mr-2 h-3.5 w-3.5" />

            View
          </a>


          <button
            type="button"
            disabled={
              pending
            }
            onClick={
              onToggle
            }
            className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {item.active ? (
              <EyeOff className="mr-2 h-3.5 w-3.5" />
            ) : (
              <Eye className="mr-2 h-3.5 w-3.5" />
            )}

            {item.active
              ? "Disable"
              : "Enable"}
          </button>


          <button
            type="button"
            disabled={
              pending
            }
            onClick={
              onDelete
            }
            className="inline-flex h-9 items-center justify-center rounded-xl border border-red-200 px-3 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />

            Delete
          </button>
        </div>
      </div>
    </div>
  );
}


// =========================================================
// DOWNLOAD CARD
// =========================================================

function DownloadCard({
  item,
  pending,
  onToggle,
  onDelete,
}: {
  item:
    ServiceMediaItem;

  pending:
    boolean;

  onToggle:
    () => void;

  onDelete:
    () => void;
}) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center ${
        item.active
          ? "border-slate-200 bg-white"
          : "border-slate-200 bg-slate-50 opacity-70"
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <FileText className="h-5 w-5" />
      </div>


      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-slate-900">
            {
              item.title
            }
          </p>

          <StatusBadge
            active={
              item.active
            }
          />
        </div>


        <p className="mt-1 truncate text-xs text-slate-400">
          {
            item.original_filename
          }

          {" · "}

          {
            formatFileSize(
              item.size_bytes,
            )
          }

          {" · "}

          Order{" "}

          {
            item.display_order
          }
        </p>


        {item.description && (
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {
              item.description
            }
          </p>
        )}
      </div>


      <div className="flex flex-wrap gap-2">
        <a
          href={
            item.publicUrl
          }
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center justify-center rounded-xl bg-slate-950 px-3 text-xs font-semibold text-white transition hover:bg-slate-800"
        >
          <Download className="mr-2 h-3.5 w-3.5" />

          Open
        </a>


        <button
          type="button"
          disabled={
            pending
          }
          onClick={
            onToggle
          }
          className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          {item.active ? (
            <EyeOff className="mr-2 h-3.5 w-3.5" />
          ) : (
            <Eye className="mr-2 h-3.5 w-3.5" />
          )}

          {item.active
            ? "Disable"
            : "Enable"}
        </button>


        <button
          type="button"
          disabled={
            pending
          }
          onClick={
            onDelete
          }
          className="inline-flex h-9 items-center justify-center rounded-xl border border-red-200 px-3 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />

          Delete
        </button>
      </div>
    </div>
  );
}


// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState({
  text,
}: {
  text:
    string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
      <ImageIcon className="mx-auto h-6 w-6 text-slate-300" />

      <p className="mt-3 text-sm text-slate-400">
        {
          text
        }
      </p>
    </div>
  );
}


// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({
  active,
}: {
  active:
    boolean;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {active
        ? "Active"
        : "Disabled"}
    </span>
  );
}


// =========================================================
// HELPERS
// =========================================================

function readableMediaKind(
  value:
    ServiceMediaItem[
      "media_kind"
    ],
) {
  switch (
    value
  ) {
    case "HERO_IMAGE":
      return "Hero Image";

    case "GALLERY_IMAGE":
      return "Gallery Image";

    case "DOWNLOAD":
      return "Download";
  }
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


async function readJson(
  response:
    Response,
): Promise<{
  success:
    boolean;

  message:
    string;
}> {
  try {
    const data =
      await response.json();


    return {
      success:
        data?.success ===
        true,

      message:
        typeof data?.message ===
        "string"
          ? data.message
          : "",
    };
  } catch {
    return {
      success:
        false,

      message:
        "The server returned an invalid response.",
    };
  }
}