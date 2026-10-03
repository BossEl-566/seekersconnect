"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  CheckCircle2,
  CircleOff,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Power,
  Save,
  Search,
  X,
  ListChecks,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  createService,
  setServiceActive,
  updateService,
} from "@/app/admin/(dashboard)/services/actions";
import Link from "next/link";




export type ServiceUniversity = {
  id: string;

  code: string;

  name: string;

  active: boolean;
};


export type ServiceItem = {
  id: string;

  university_id: string;

  slug: string;

  name: string;

  short_name: string;

  description:
    | string
    | null;

  category: string;

  form_type: string;

  active: boolean;

  created_at: string;

  updated_at: string;

  universities:
    | {
        code: string;

        name: string;

        active: boolean;
      }
    | null;
};


type ServicesManagerProps = {
  services:
    ServiceItem[];

  universities:
    ServiceUniversity[];

  categories:
    string[];

  formTypes:
    string[];
};


export function ServicesManager({
  services,
  universities,
  categories,
  formTypes,
}: ServicesManagerProps) {
  const [
    universityFilter,
    setUniversityFilter,
  ] =
    useState("ALL");


  const [
    search,
    setSearch,
  ] =
    useState("");


  const filteredServices =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();


        return services.filter(
          (service) => {
            const matchesUniversity =
              universityFilter ===
                "ALL" ||
              service.university_id ===
                universityFilter;


            const searchable =
              [
                service.name,
                service.short_name,
                service.slug,
                service.category,
                service
                  .universities
                  ?.code,
                service
                  .universities
                  ?.name,
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const matchesSearch =
              !query ||
              searchable.includes(
                query,
              );


            return (
              matchesUniversity &&
              matchesSearch
            );
          },
        );
      },
      [
        services,
        universityFilter,
        search,
      ],
    );


  return (
    <div className="space-y-6">
      <CreateServiceCard
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


      <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={
                universityFilter
              }
              onChange={(
                event,
              ) =>
                setUniversityFilter(
                  event.target.value,
                )
              }
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">
  All Service Areas
</option>

              {universities.map(
  (
    university,
  ) => (
    <option
      key={
        university.id
      }
      value={
        university.id
      }
    >
      {university.code ===
      "SC247"
        ? "General Services"
        : `${university.code} — ${university.name}`}
    </option>
  ),
)}
            </select>


            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                value={
                  search
                }
                onChange={(
                  event,
                ) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search services..."
                className="pl-9"
              />
            </div>
          </div>


          <p className="text-xs text-slate-400">
            {
              filteredServices.length
            }{" "}
            service
            {filteredServices.length ===
            1
              ? ""
              : "s"}
          </p>
        </div>
      </div>


      <ServiceList
        services={
          filteredServices
        }
        categories={
          categories
        }
        formTypes={
          formTypes
        }
      />
    </div>
  );
}


// =========================================================
// CREATE SERVICE
// =========================================================

function CreateServiceCard({
  universities,
  categories,
  formTypes,
}: {
  universities:
    ServiceUniversity[];

  categories:
    string[];

  formTypes:
    string[];
}) {
  const [
    open,
    setOpen,
  ] =
    useState(false);


  const [
    universityId,
    setUniversityId,
  ] =
    useState("");


  const [
    slug,
    setSlug,
  ] =
    useState("");


  const [
    name,
    setName,
  ] =
    useState("");


  const [
    shortName,
    setShortName,
  ] =
    useState("");


  const [
    description,
    setDescription,
  ] =
    useState("");


  const [
    category,
    setCategory,
  ] =
    useState(
      categories[0] ??
        "",
    );


  const [
    formType,
    setFormType,
  ] =
    useState(
      formTypes.includes(
        "generic",
      )
        ? "generic"
        : formTypes[0] ??
            "",
    );


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    success,
    setSuccess,
  ] =
    useState("");


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  const activeUniversities =
    universities.filter(
      (university) =>
        university.active,
    );


  function reset() {
    setUniversityId("");
    setSlug("");
    setName("");
    setShortName("");
    setDescription("");

    setCategory(
      categories[0] ??
        "",
    );

    setFormType(
      formTypes.includes(
        "generic",
      )
        ? "generic"
        : formTypes[0] ??
            "",
    );

    setError("");
  }


  function handleCreate() {
    setError("");
    setSuccess("");


    startTransition(
      async () => {
        const result =
          await createService({
            universityId,

            slug,

            name,

            shortName,

            description,

            category,

            formType,
          });


        if (
          !result.success
        ) {
          setError(
            result.error,
          );

          return;
        }


        reset();

        setSuccess(
          "Service added successfully.",
        );

        setOpen(false);
      },
    );
  }


  return (
    <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="font-semibold text-slate-950">
  Service Directory
</h2>

<p className="mt-1 text-sm leading-6 text-slate-500">
  Configure general errands, delivery, shopping and academic
  document services from one place.
</p>
        </div>


        <Button
          type="button"
          onClick={() =>
            setOpen(
              (value) =>
                !value,
            )
          }
          className="rounded-xl bg-blue-600 hover:bg-blue-700"
        >
          {open ? (
            <>
              <X className="mr-2 h-4 w-4" />

              Cancel
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />

              Add Service
            </>
          )}
        </Button>
      </div>


      {success && (
        <div className="mx-5 mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 sm:mx-6">
          <CheckCircle2 className="h-4 w-4" />

          {success}
        </div>
      )}


      {open && (
        <div className="border-t border-slate-100 p-5 sm:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            {/* UNIVERSITY */}

            <div className="space-y-2">
              <Label htmlFor="serviceUniversity">
  Service Area / Institution
</Label>

              <select
                id="serviceUniversity"
                value={
                  universityId
                }
                onChange={(
                  event,
                ) =>
                  setUniversityId(
                    event.target.value,
                  )
                }
                disabled={
                  pending
                }
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
  Select service area
</option>

                {activeUniversities.map(
                  (
                    university,
                  ) => (
                    <option
                      key={
                        university.id
                      }
                      value={
                        university.id
                      }
                    >
                      {university.code ===
"SC247"
  ? "General Services — Seekers Connect 247"
  : `${university.code} — ${university.name}`}
                    </option>
                  ),
                )}
              </select>
            </div>


            {/* SLUG */}

            <div className="space-y-2">
              <Label htmlFor="serviceSlug">
                Service Slug
              </Label>

              <Input
                id="serviceSlug"
                value={
                  slug
                }
                onChange={(
                  event,
                ) =>
                  setSlug(
                    slugify(
                      event.target.value,
                    ),
                  )
                }
                placeholder="academic-transcript"
                disabled={
                  pending
                }
              />

              <p className="text-xs text-slate-400">
                Stable internal
                identifier. Example:
                academic-transcript.
              </p>
            </div>


            {/* NAME */}

            <div className="space-y-2">
              <Label htmlFor="serviceName">
                Service Name
              </Label>

              <Input
                id="serviceName"
                value={
                  name
                }
                onChange={(
                  event,
                ) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="Academic Transcript"
                disabled={
                  pending
                }
              />
            </div>


            {/* SHORT NAME */}

            <div className="space-y-2">
              <Label htmlFor="serviceShortName">
                Short Name
              </Label>

              <Input
                id="serviceShortName"
                value={
                  shortName
                }
                onChange={(
                  event,
                ) =>
                  setShortName(
                    event.target.value,
                  )
                }
                placeholder="Transcript"
                disabled={
                  pending
                }
              />
            </div>


            {/* CATEGORY */}

            <div className="space-y-2">
              <Label htmlFor="serviceCategory">
                Category
              </Label>

              <select
                id="serviceCategory"
                value={
                  category
                }
                onChange={(
                  event,
                ) =>
                  setCategory(
                    event.target.value,
                  )
                }
                disabled={
                  pending
                }
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                {categories.map(
                  (value) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {humanize(
                        value,
                      )}
                    </option>
                  ),
                )}
              </select>
            </div>


            {/* FORM TYPE */}

            <div className="space-y-2">
              <Label htmlFor="serviceFormType">
                Form Type
              </Label>

              <select
                id="serviceFormType"
                value={
                  formType
                }
                onChange={(
                  event,
                ) =>
                  setFormType(
                    event.target.value,
                  )
                }
                disabled={
                  pending
                }
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                {formTypes.map(
                  (value) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {humanize(
                        value,
                      )}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>


          {/* DESCRIPTION */}

          <div className="mt-5 space-y-2">
            <Label htmlFor="serviceDescription">
              Description
            </Label>

            <Textarea
              id="serviceDescription"
              value={
                description
              }
              onChange={(
                event,
              ) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Describe what this service provides..."
              disabled={
                pending
              }
              className="min-h-24"
            />
          </div>


          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}


          <div className="mt-5 flex justify-end">
            <Button
              type="button"
              disabled={
                pending ||
                !universityId ||
                !slug ||
                !name.trim() ||
                !shortName.trim() ||
                !category ||
                !formType
              }
              onClick={
                handleCreate
              }
              className="rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />

                  Add Service
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


// =========================================================
// LIST
// =========================================================

function ServiceList({
  services,
  categories,
  formTypes,
}: {
  services:
    ServiceItem[];

  categories:
    string[];

  formTypes:
    string[];
}) {
  if (
    services.length ===
    0
  ) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <FileText className="mx-auto h-7 w-7 text-slate-400" />

        <h3 className="mt-4 font-semibold text-slate-900">
          No services found
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Add a service or change
          your current filters.
        </p>
      </div>
    );
  }


  return (
    <div className="grid gap-4">
      {services.map(
        (service) => (
          <ServiceCard
            key={
              service.id
            }
            service={
              service
            }
            categories={
              categories
            }
            formTypes={
              formTypes
            }
          />
        ),
      )}
    </div>
  );
}


// =========================================================
// SERVICE CARD
// =========================================================

function ServiceCard({
  service,
  categories,
  formTypes,
}: {
 service:
  ServiceItem;

  categories:
    string[];

  formTypes:
    string[];
}) {
  const currentService =
  service;


  const [
    editing,
    setEditing,
  ] =
    useState(false);


  const [
    name,
    setName,
  ] =
    useState(
      currentService.name,
    );


  const [
    shortName,
    setShortName,
  ] =
    useState(
      currentService.short_name,
    );


  const [
    description,
    setDescription,
  ] =
    useState(
      currentService.description ??
        "",
    );


  const [
    category,
    setCategory,
  ] =
    useState(
      currentService.category,
    );


  const [
    formType,
    setFormType,
  ] =
    useState(
      currentService.form_type,
    );


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  function cancelEditing() {
    setName(
      currentService.name,
    );

    setShortName(
      currentService.short_name,
    );

    setDescription(
      currentService.description ??
        "",
    );

    setCategory(
      currentService.category,
    );

    setFormType(
      currentService.form_type,
    );

    setError("");

    setEditing(false);
  }


  function handleSave() {
    setError("");


    startTransition(
      async () => {
        const result =
          await updateService(
            currentService.id,
            {
              name,
              shortName,
              description,
              category,
              formType,
            },
          );


        if (
          !result.success
        ) {
          setError(
            result.error,
          );

          return;
        }


        setEditing(false);
      },
    );
  }


  function handleToggle() {
    setError("");


    startTransition(
      async () => {
        const result =
          await setServiceActive(
            currentService.id,
            !currentService.active,
          );


        if (
          !result.success
        ) {
          setError(
            result.error,
          );
        }
      },
    );
  }


  return (
    <div
      className={`rounded-[24px] border bg-white p-5 shadow-sm sm:p-6 ${
        currentService.active
          ? "border-slate-200"
          : "border-slate-200 opacity-75"
      }`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              currentService.active
                ? "bg-blue-50 text-blue-600"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {currentService.active ? (
              <FileText className="h-5 w-5" />
            ) : (
              <CircleOff className="h-5 w-5" />
            )}
          </div>


          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
  className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
    currentService
      .universities
      ?.code ===
    "SC247"
      ? "bg-blue-600 text-white"
      : "bg-slate-950 text-white"
  }`}
>
  {currentService
    .universities
    ?.code ===
  "SC247"
    ? "GENERAL SERVICE"
    : currentService
        .universities
        ?.code ??
      "—"}
</span>

              <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[10px] text-slate-600">
                {
                  currentService.slug
                }
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                  currentService.active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {currentService.active
                  ? "Active"
                  : "Disabled"}
              </span>
            </div>


            {!editing && (
              <>
                <h3 className="mt-3 text-lg font-semibold text-slate-950">
                  {
                    currentService.name
                  }
                </h3>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  {
                    currentService.short_name
                  }
                </p>

                {currentService.description && (
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                    {
                      currentService.description
                    }
                  </p>
                )}


                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-blue-700">
                    Category:{" "}
                    {humanize(
                      currentService.category,
                    )}
                  </span>

                  <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-violet-700">
                    Form:{" "}
                    {humanize(
                      currentService.form_type,
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>


        {!editing && (
          <div className="flex flex-wrap gap-2">
            <Link
  href={`/admin/services/${currentService.id}/fields`}
  className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900"
>
  <ListChecks className="mr-2 h-4 w-4" />

  Manage Fields
</Link>
            <Button
              type="button"
              variant="outline"
              disabled={
                pending
              }
              onClick={() =>
                setEditing(
                  true,
                )
              }
              className="rounded-xl"
            >
              <Pencil className="mr-2 h-4 w-4" />

              Edit
            </Button>


            <Button
              type="button"
              variant="outline"
              disabled={
                pending
              }
              onClick={
                handleToggle
              }
              className={`rounded-xl ${
                currentService.active
                  ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                  : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Power className="mr-2 h-4 w-4" />
              )}

              {currentService.active
                ? "Disable"
                : "Enable"}
            </Button>
          </div>
        )}
      </div>


      {editing && (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Service Name
              </Label>

              <Input
                value={
                  name
                }
                onChange={(
                  event,
                ) =>
                  setName(
                    event.target.value,
                  )
                }
                disabled={
                  pending
                }
              />
            </div>


            <div className="space-y-2">
              <Label>
                Short Name
              </Label>

              <Input
                value={
                  shortName
                }
                onChange={(
                  event,
                ) =>
                  setShortName(
                    event.target.value,
                  )
                }
                disabled={
                  pending
                }
              />
            </div>


            <div className="space-y-2">
              <Label>
                Category
              </Label>

              <select
                value={
                  category
                }
                onChange={(
                  event,
                ) =>
                  setCategory(
                    event.target.value,
                  )
                }
                disabled={
                  pending
                }
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                {categories.map(
                  (value) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {humanize(
                        value,
                      )}
                    </option>
                  ),
                )}
              </select>
            </div>


            <div className="space-y-2">
              <Label>
                Form Type
              </Label>

              <select
                value={
                  formType
                }
                onChange={(
                  event,
                ) =>
                  setFormType(
                    event.target.value,
                  )
                }
                disabled={
                  pending
                }
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                {formTypes.map(
                  (value) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {humanize(
                        value,
                      )}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>


          <div className="mt-5 space-y-2">
            <Label>
              Description
            </Label>

            <Textarea
              value={
                description
              }
              onChange={(
                event,
              ) =>
                setDescription(
                  event.target.value,
                )
              }
              disabled={
                pending
              }
              className="min-h-24"
            />
          </div>


          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
  The service area / institution and service slug are
  intentionally not editable because existing customer
  requests may already depend on these identifiers.
</div>


          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}


          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={
                pending
              }
              onClick={
                cancelEditing
              }
              className="rounded-xl"
            >
              <X className="mr-2 h-4 w-4" />

              Cancel
            </Button>


            <Button
              type="button"
              disabled={
                pending ||
                !name.trim() ||
                !shortName.trim()
              }
              onClick={
                handleSave
              }
              className="rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />

                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}


      {!editing &&
        error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
    </div>
  );
}


// =========================================================
// HELPERS
// =========================================================

function slugify(
  value: string,
) {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}


function humanize(
  value: string,
) {
  return value
    .replaceAll(
      "_",
      " ",
    )
    .replaceAll(
      "-",
      " ",
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}