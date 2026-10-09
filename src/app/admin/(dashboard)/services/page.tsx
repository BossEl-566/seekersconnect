import {
  BookOpen,
  CheckCircle2,
  CircleOff,
  FileText,
  Shapes,
} from "lucide-react";

import {
  requireSuperAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  ServicesManager,
  type ServiceCategory,
  type ServiceItem,
  type ServiceUniversity,
} from "@/components/admin/services-manager";


export default async function ServicesPage() {
  await requireSuperAdmin();


  const supabase =
    createAdminClient();


  const [
    servicesResult,
    universitiesResult,
    categoriesResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "services",
        )
        .select(`
          id,
          university_id,
          service_category_id,
          service_scope,
          slug,
          name,
          short_name,
          description,
          category,
          form_type,
          display_order,
          featured,
          image_url,
          active,
          created_at,
          updated_at,

          universities (
            code,
            name,
            active
          ),

          service_categories (
            id,
            slug,
            name,
            description,
            icon_key,
            display_order,
            active
          )
        `)
        .order(
          "active",
          {
            ascending:
              false,
          },
        )
        .order(
          "display_order",
          {
            ascending:
              true,
          },
        )
        .order(
          "name",
          {
            ascending:
              true,
          },
        ),


      supabase
        .from(
          "universities",
        )
        .select(`
          id,
          code,
          name,
          active
        `)
        .order(
          "active",
          {
            ascending:
              false,
          },
        )
        .order(
          "name",
          {
            ascending:
              true,
          },
        ),


      supabase
        .from(
          "service_categories",
        )
        .select(`
          id,
          slug,
          name,
          description,
          icon_key,
          display_order,
          active
        `)
        .order(
          "display_order",
          {
            ascending:
              true,
          },
        )
        .order(
          "name",
          {
            ascending:
              true,
          },
        ),
    ]);


  if (
    servicesResult.error
  ) {
    console.error(
      "Services query failed:",
      servicesResult.error,
    );
  }


  if (
    universitiesResult.error
  ) {
    console.error(
      "Service institutions query failed:",
      universitiesResult.error,
    );
  }


  if (
    categoriesResult.error
  ) {
    console.error(
      "Service categories query failed:",
      categoriesResult.error,
    );
  }


  const services =
    (servicesResult.data ??
      []) as unknown as
      ServiceItem[];


  const universities =
    (universitiesResult.data ??
      []) as
      ServiceUniversity[];


  const categories =
    (categoriesResult.data ??
      []) as
      ServiceCategory[];


  // =======================================================
  // FORM TYPES
  //
  // Kept temporarily for compatibility with the existing
  // request wizard and form field engine.
  // =======================================================

  const formTypes =
    Array.from(
      new Set(
        services
          .map(
            (
              service,
            ) =>
              service.form_type,
          )
          .filter(
            Boolean,
          ),
      ),
    ).sort();


  if (
    !formTypes.includes(
      "generic",
    )
  ) {
    formTypes.push(
      "generic",
    );
  }


  const activeCount =
    services.filter(
      (
        service,
      ) =>
        service.active,
    ).length;


  const generalCount =
    services.filter(
      (
        service,
      ) =>
        service.service_scope ===
        "general",
    ).length;


  const academicCount =
    services.filter(
      (
        service,
      ) =>
        service.service_scope ===
        "academic",
    ).length;


  return (
    <>
      {/* ===============================================
          HEADER
      =============================================== */}

      <div>
        <p className="text-sm font-medium text-blue-600">
          Super Admin
        </p>


        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          Services
        </h1>


        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Manage every service offered by Seekers Connect 247,
          including general services and institution-specific
          academic services.
        </p>
      </div>


      {/* ===============================================
          SUMMARY
      =============================================== */}

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={
            FileText
          }
          label="Total Services"
          value={
            services.length
          }
        />


        <SummaryCard
          icon={
            CheckCircle2
          }
          label="Active"
          value={
            activeCount
          }
        />


        <SummaryCard
          icon={
            Shapes
          }
          label="General Services"
          value={
            generalCount
          }
        />


        <SummaryCard
          icon={
            BookOpen
          }
          label="Academic Services"
          value={
            academicCount
          }
        />
      </div>


      {/* ===============================================
          MANAGER
      =============================================== */}

      <div className="mt-6">
        <ServicesManager
          services={
            services
          }
          universities={
            universities
          }
          categories={
            categories
          }
          formTypes={
            formTypes
          }
        />
      </div>
    </>
  );
}


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