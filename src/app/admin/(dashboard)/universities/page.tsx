import {
  Building2,
  CheckCircle2,
  CircleOff,
} from "lucide-react";

import {
  requireSuperAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  UniversitiesManager,
  type UniversityItem,
} from "@/components/admin/universities-manager";


export default async function UniversitiesPage() {
  await requireSuperAdmin();


  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } = await supabase
    .from("universities")
    .select(`
      id,
      code,
      name,
      location,
      active,
      created_at,
      updated_at
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
    );


  if (error) {
    console.error(
      "Universities query failed:",
      error,
    );
  }


  const universities =
    (data ??
      []) as UniversityItem[];


  const activeCount =
    universities.filter(
      (university) =>
        university.active,
    ).length;


  const disabledCount =
    universities.length -
    activeCount;


  return (
    <>
      {/* HEADER */}

      <div>
        <p className="text-sm font-medium text-blue-600">
          Super Admin
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          Universities
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage universities supported by Seekers Connect 247.
          Disabled universities remain attached to historical
          requests but will later be hidden from new customer
          requests.
        </p>
      </div>


      {/* SUMMARY */}

      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={
            Building2
          }
          label="Total Universities"
          value={
            universities.length
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
        <UniversitiesManager
          universities={
            universities
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