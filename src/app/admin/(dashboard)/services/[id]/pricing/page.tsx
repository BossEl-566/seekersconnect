import Link from "next/link";

import {
  ArrowLeft,
  BadgeDollarSign,
  BookOpen,
  Shapes,
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
  ServicePricingForm,
  type ServicePricingRecord,
} from "@/components/admin/service-pricing-form";


type PageProps = {
  params: Promise<{
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


// =========================================================
// PAGE
// =========================================================

export default async function ServicePricingPage({
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
    pricingResult,
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
          "service_pricing",
        )
        .select(`
          id,
          service_id,
          pricing_mode,
          currency,
          amount,
          unit_label,
          minimum_quantity,
          maximum_quantity,
          display_note,
          active
        `)
        .eq(
          "service_id",
          id,
        )
        .maybeSingle(),
    ]);


  if (
    serviceResult.error
  ) {
    console.error(
      "Service pricing page service query failed:",
      serviceResult.error,
    );
  }


  if (
    pricingResult.error
  ) {
    console.error(
      "Service pricing query failed:",
      pricingResult.error,
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


  const pricing:
    ServicePricingRecord =
    pricingResult.data
      ? {
          id:
            pricingResult
              .data
              .id,

          service_id:
            pricingResult
              .data
              .service_id,

          pricing_mode:
            pricingResult
              .data
              .pricing_mode as ServicePricingRecord["pricing_mode"],

          currency:
            (
              pricingResult
                .data
                .currency ===
              "USD"
                ? "USD"
                : "GHS"
            ),

          amount:
            pricingResult
              .data
              .amount ===
            null
              ? null
              : Number(
                  pricingResult
                    .data
                    .amount,
                ),

          unit_label:
            pricingResult
              .data
              .unit_label,

          minimum_quantity:
            pricingResult
              .data
              .minimum_quantity ===
            null
              ? null
              : Number(
                  pricingResult
                    .data
                    .minimum_quantity,
                ),

          maximum_quantity:
            pricingResult
              .data
              .maximum_quantity ===
            null
              ? null
              : Number(
                  pricingResult
                    .data
                    .maximum_quantity,
                ),

          display_note:
            pricingResult
              .data
              .display_note,

          active:
            pricingResult
              .data
              .active,
        }
      : {
          id:
            null,

          service_id:
            service.id,

          pricing_mode:
            "MANUAL_PRICE",

          currency:
            "GHS",

          amount:
            null,

          unit_label:
            null,

          minimum_quantity:
            null,

          maximum_quantity:
            null,

          display_note:
            null,

          active:
            true,
        };


  return (
    <>
      <Link
        href="/admin/services"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />

        Back to services
      </Link>


      {/* ===============================================
          HEADER
      =============================================== */}

      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Service Pricing
          </p>


          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
            {
              service.name
            }
          </h1>


          <p className="mt-2 text-sm text-slate-500">
            {
              service.short_name
            }
          </p>


          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${
                service.service_scope ===
                "general"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-violet-50 text-violet-700"
              }`}
            >
              {service.service_scope ===
              "general" ? (
                <Shapes className="mr-1.5 h-3.5 w-3.5" />
              ) : (
                <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              )}


              {service.service_scope ===
              "general"
                ? "General Service"
                : "Academic Service"}
            </span>


            {category?.name && (
              <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                {
                  category.name
                }
              </span>
            )}


            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600">
              {
                service.slug
              }
            </span>
          </div>


          {service.service_scope ===
            "academic" &&
            university && (
            <p className="mt-4 text-sm text-slate-500">
              Institution:{" "}
              <span className="font-medium text-slate-700">
                {university.code}
                {" — "}
                {university.name}
              </span>
            </p>
          )}
        </div>


        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <BadgeDollarSign className="h-6 w-6" />
        </div>
      </div>


      {/* ===============================================
          FORM
      =============================================== */}

      <div className="mt-7">
        <ServicePricingForm
          serviceId={
            service.id
          }
          pricing={
            pricing
          }
        />
      </div>
    </>
  );
}


// =========================================================
// RELATION HELPER
// =========================================================

function firstRelation<
  T,
>(
  value:
    | T
    | T[]
    | null,
):
  T | null {
  if (
    !value
  ) {
    return null;
  }


  if (
    Array.isArray(
      value,
    )
  ) {
    return (
      value[0] ??
      null
    );
  }


  return value;
}