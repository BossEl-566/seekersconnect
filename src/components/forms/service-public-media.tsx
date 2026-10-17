import {
  Download,
  FileText,
  Images,
} from "lucide-react";

import type {
  RequestCatalogService,
} from "@/types/request-catalog";


export function ServicePublicMedia({
  service,
}: {
  service:
    RequestCatalogService
    | undefined;
}) {
  if (
    !service
  ) {
    return null;
  }


  const media =
    service.media ??
    [];


  const hero =
    media.find(
      (
        item,
      ) =>
        item.kind ===
        "HERO_IMAGE",
    ) ??
    null;


  const gallery =
    media.filter(
      (
        item,
      ) =>
        item.kind ===
        "GALLERY_IMAGE",
    );


  const downloads =
    media.filter(
      (
        item,
      ) =>
        item.kind ===
        "DOWNLOAD",
    );


  const heroUrl =
    hero?.url ??
    service.imageUrl;


  if (
    !heroUrl &&
    gallery.length ===
      0 &&
    downloads.length ===
      0
  ) {
    return null;
  }


  return (
    <div className="mt-8 space-y-5">
      {/* =================================================
          HERO IMAGE
      ================================================= */}

      {heroUrl && (
        <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}

          <img
            src={
              heroUrl
            }
            alt={
              hero?.altText ||
              hero?.title ||
              service.name
            }
            className="max-h-[420px] w-full object-cover"
          />

          {(hero?.title ||
            hero?.description) && (
            <div className="border-t border-slate-200 bg-white p-4">
              {hero.title && (
                <p className="font-semibold text-slate-900">
                  {
                    hero.title
                  }
                </p>
              )}


              {hero.description && (
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {
                    hero.description
                  }
                </p>
              )}
            </div>
          )}
        </div>
      )}


      {/* =================================================
          DOWNLOADABLE RESOURCES
      ================================================= */}

      {downloads.length >
        0 && (
        <section className="rounded-[22px] border border-blue-100 bg-blue-50/60 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Download className="h-4 w-4" />
            </div>


            <div>
              <p className="font-semibold text-blue-950">
                Downloadable Resources
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Download any applicable forms or instructions before
                completing your request.
              </p>
            </div>
          </div>


          <div className="mt-4 space-y-3">
            {downloads.map(
              (
                item,
              ) => (
                <div
                  key={
                    item.id
                  }
                  className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText className="h-4 w-4" />
                  </div>


                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">
                      {
                        item.title
                      }
                    </p>


                    {item.description && (
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {
                          item.description
                        }
                      </p>
                    )}


                    <p className="mt-1 text-[11px] text-slate-400">
                      {
                        item.originalFilename
                      }

                      {" · "}

                      {
                        formatFileSize(
                          item.sizeBytes,
                        )
                      }
                    </p>
                  </div>


                  <a
                    href={
                      item.url
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    <Download className="mr-2 h-4 w-4" />

                    Download
                  </a>
                </div>
              ),
            )}
          </div>
        </section>
      )}


      {/* =================================================
          GALLERY
      ================================================= */}

      {gallery.length >
        0 && (
        <section className="rounded-[22px] border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Images className="h-4 w-4" />
            </div>

            <div>
              <p className="font-semibold text-slate-900">
                Service Gallery
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Additional information and examples for this service.
              </p>
            </div>
          </div>


          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {gallery.map(
              (
                item,
              ) => (
                <a
                  key={
                    item.id
                  }
                  href={
                    item.url
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                >
                  <div className="aspect-[16/10] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}

                    <img
                      src={
                        item.url
                      }
                      alt={
                        item.altText ||
                        item.title
                      }
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  </div>


                  <div className="bg-white p-3">
                    <p className="text-sm font-medium text-slate-900">
                      {
                        item.title
                      }
                    </p>


                    {item.description && (
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {
                          item.description
                        }
                      </p>
                    )}
                  </div>
                </a>
              ),
            )}
          </div>
        </section>
      )}
    </div>
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