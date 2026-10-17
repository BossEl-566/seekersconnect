import Link from "next/link";

import {
  ArrowLeft,
  BadgeDollarSign,
  FileText,
  Images,
  ListChecks,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  requireSuperAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  ServiceMediaManager,
  type ServiceMediaItem,
} from "@/components/admin/service-media-manager";


type PageProps = {
  params:
    Promise<{
      id:
        string;
    }>;
};


type ServiceRecord = {
  id:
    string;

  name:
    string;

  short_name:
    string;

  slug:
    string;

  service_scope:
    "general"
    | "academic";

  active:
    boolean;

  universities:
    | {
        code:
          string;

        name:
          string;
      }
    | {
        code:
          string;

        name:
          string;
      }[]
    | null;

  service_categories:
    | {
        name:
          string;
      }
    | {
        name:
          string;
      }[]
    | null;
};


type DatabaseMediaItem = {
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
};


// =========================================================
// PAGE
// =========================================================

export default async function ServiceMediaPage({
  params,
}: PageProps) {
  await requireSuperAdmin();


  const {
    id,
  } =
    await params;


  const supabase =
    createAdminClient();


  const [
    serviceResult,
    mediaResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "services",
        )
        .select(`
          id,
          name,
          short_name,
          slug,
          service_scope,
          active,

          universities (
            code,
            name
          ),

          service_categories (
            name
          )
        `)
        .eq(
          "id",
          id,
        )
        .maybeSingle(),


      supabase
        .from(
          "service_media",
        )
        .select(`
          id,
          service_id,
          media_kind,
          title,
          description,
          alt_text,
          storage_bucket,
          storage_path,
          original_filename,
          mime_type,
          size_bytes,
          display_order,
          active,
          created_at,
          updated_at
        `)
        .eq(
          "service_id",
          id,
        )
        .order(
          "display_order",
          {
            ascending:
              true,
          },
        )
        .order(
          "created_at",
          {
            ascending:
              true,
          },
        ),
    ]);


  if (
    serviceResult.error
  ) {
    console.error(
      "Service media page service query failed:",
      serviceResult.error,
    );
  }


  if (
    mediaResult.error
  ) {
    console.error(
      "Service media query failed:",
      mediaResult.error,
    );
  }


  if (
    !serviceResult.data
  ) {
    notFound();
  }


  const service =
    serviceResult.data as unknown as
      ServiceRecord;


  const university =
    firstRelation(
      service.universities,
    );


  const category =
    firstRelation(
      service.service_categories,
    );


  const databaseMedia =
    (
      mediaResult.data ??
      []
    ) as DatabaseMediaItem[];


  // =======================================================
  // BUILD PUBLIC URLS
  // =======================================================

  const media:
    ServiceMediaItem[] =
    databaseMedia.map(
      (
        item,
      ) => {
        const {
          data,
        } =
          supabase.storage
            .from(
              item.storage_bucket,
            )
            .getPublicUrl(
              item.storage_path,
            );


        return {
          ...item,

          publicUrl:
            data.publicUrl,
        };
      },
    );


  const heroCount =
    media.filter(
      (
        item,
      ) =>
        item.media_kind ===
        "HERO_IMAGE",
    ).length;


  const galleryCount =
    media.filter(
      (
        item,
      ) =>
        item.media_kind ===
        "GALLERY_IMAGE",
    ).length;


  const downloadCount =
    media.filter(
      (
        item,
      ) =>
        item.media_kind ===
        "DOWNLOAD",
    ).length;


  return (
    <>
      {/* =================================================
          BACK
      ================================================= */}

      <Link
        href="/admin/services"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />

        Back to services
      </Link>


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Service Media
          </p>


          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
            {
              service.name
            }
          </h1>


          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage public cover images, gallery images,
            downloadable forms and other customer-facing
            resources for this service.
          </p>


          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {service.service_scope ===
              "general"
                ? "General Service"
                : university?.name ??
                  "Academic Service"}
            </span>


            {category?.name && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {
                  category.name
                }
              </span>
            )}


            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                service.active
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {service.active
                ? "Active"
                : "Disabled"}
            </span>
          </div>
        </div>


        {/* ===============================================
            RELATED ADMIN TOOLS
        =============================================== */}

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/services/${service.id}/fields`}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ListChecks className="mr-2 h-4 w-4" />

            Fields
          </Link>


          <Link
            href={`/admin/services/${service.id}/pricing`}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <BadgeDollarSign className="mr-2 h-4 w-4" />

            Pricing
          </Link>
        </div>
      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={
            Images
          }
          label="Hero Image"
          value={
            heroCount
          }
        />


        <SummaryCard
          icon={
            Images
          }
          label="Gallery Images"
          value={
            galleryCount
          }
        />


        <SummaryCard
          icon={
            FileText
          }
          label="Downloads"
          value={
            downloadCount
          }
        />
      </div>


      {/* =================================================
          MANAGER
      ================================================= */}

      <div className="mt-6">
        <ServiceMediaManager
          serviceId={
            service.id
          }
          serviceName={
            service.name
          }
          media={
            media
          }
        />
      </div>
    </>
  );
}


// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
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
          <p className="text-xs font-medium text-slate-400">
            {
              label
            }
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
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


// =========================================================
// RELATION HELPER
// =========================================================

function firstRelation<T>(
  relation:
    T
    | T[]
    | null
    | undefined,
):
  T | null {
  if (
    !relation
  ) {
    return null;
  }


  if (
    Array.isArray(
      relation,
    )
  ) {
    return relation[0] ??
      null;
  }


  return relation;
}