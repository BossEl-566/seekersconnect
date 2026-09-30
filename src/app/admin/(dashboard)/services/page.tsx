import {
  CheckCircle2,
  CircleOff,
  FileText,
} from "lucide-react";

import {
  requireSuperAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  ServicesManager,
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
  ] =
    await Promise.all([
      supabase
        .from("services")
        .select(`
          id,
          university_id,
          slug,
          name,
          short_name,
          description,
          category,
          form_type,
          active,
          created_at,
          updated_at,

          universities (
            code,
            name,
            active
          )
        `)
        .order(
          "active",
          {
            ascending: false,
          },
        )
        .order(
          "name",
          {
            ascending: true,
          },
        ),

      supabase
        .from("universities")
        .select(`
          id,
          code,
          name,
          active
        `)
        .order(
          "active",
          {
            ascending: false,
          },
        )
        .order(
          "name",
          {
            ascending: true,
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
      "Service universities query failed:",
      universitiesResult.error,
    );
  }


  const services =
    (servicesResult.data ??
      []) as unknown as
      ServiceItem[];


  const universities =
    (universitiesResult.data ??
      []) as ServiceUniversity[];


  // =======================================================
  // BUILD CATEGORY OPTIONS FROM EXISTING DATABASE VALUES
  // =======================================================

  const categories =
    Array.from(
      new Set(
        services
          .map(
            (service) =>
              service.category,
          )
          .filter(Boolean),
      ),
    ).sort();


  // =======================================================
  // BUILD FORM TYPE OPTIONS FROM EXISTING DATABASE VALUES
  // =======================================================

  const formTypes =
    Array.from(
      new Set(
        services
          .map(
            (service) =>
              service.form_type,
          )
          .filter(Boolean),
      ),
    ).sort();


  const activeCount =
    services.filter(
      (service) =>
        service.active,
    ).length;


  const disabledCount =
    services.length -
    activeCount;


  return (
    <>
      {/* HEADER */}

      <div>
        <p className="text-sm font-medium text-blue-600">
          Super Admin
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          Services
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage the academic document
          services offered under each
          supported university.
        </p>
      </div>


      {/* SUMMARY */}

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
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
            CircleOff
          }
          label="Disabled"
          value={
            disabledCount
          }
        />
      </div>


      {/* MANAGER */}

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
  icon: Icon,
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
            {label}
          </p>

          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}