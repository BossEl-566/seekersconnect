"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import Link from "next/link";

import {
  BookOpen,
  CheckCircle2,
  CircleOff,
  FileText,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  Power,
  Save,
  Search,
  Shapes,
  Star,
  X,
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


// =========================================================
// TYPES
// =========================================================

export type ServiceUniversity = {
  id:
    string;

  code:
    string;

  name:
    string;

  active:
    boolean;
};


export type ServiceCategory = {
  id:
    string;

  slug:
    string;

  name:
    string;

  description:
    | string
    | null;

  icon_key:
    | string
    | null;

  display_order:
    number;

  active:
    boolean;
};


export type ServiceItem = {
  id:
    string;

  university_id:
    | string
    | null;

  service_category_id:
    string;

  service_scope:
    "general"
    | "academic";

  slug:
    string;

  name:
    string;

  short_name:
    string;

  description:
    | string
    | null;

  // Legacy compatibility column.
  category:
    string;

  form_type:
    string;

  display_order:
    number;

  featured:
    boolean;

  image_url:
    | string
    | null;

  active:
    boolean;

  created_at:
    string;

  updated_at:
    string;

  universities:
    | {
        code:
          string;

        name:
          string;

        active:
          boolean;
      }
    | null;

  service_categories:
    | {
        id:
          string;

        slug:
          string;

        name:
          string;

        description:
          | string
          | null;

        icon_key:
          | string
          | null;

        display_order:
          number;

        active:
          boolean;
      }
    | null;
};


type ServicesManagerProps = {
  services:
    ServiceItem[];

  universities:
    ServiceUniversity[];

  categories:
    ServiceCategory[];

  formTypes:
    string[];
};


// =========================================================
// MANAGER
// =========================================================

export function ServicesManager({
  services,
  universities,
  categories,
  formTypes,
}: ServicesManagerProps) {
  const [
    scopeFilter,
    setScopeFilter,
  ] =
    useState(
      "ALL",
    );


  const [
    categoryFilter,
    setCategoryFilter,
  ] =
    useState(
      "ALL",
    );


  const [
    universityFilter,
    setUniversityFilter,
  ] =
    useState(
      "ALL",
    );


  const [
    search,
    setSearch,
  ] =
    useState(
      "",
    );


  const realUniversities =
    universities.filter(
      (
        university,
      ) =>
        university.code !==
        "SC247",
    );


  const filteredServices =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();


        return services.filter(
          (
            service,
          ) => {
            const matchesScope =
              scopeFilter ===
                "ALL" ||
              service.service_scope ===
                scopeFilter;


            const matchesCategory =
              categoryFilter ===
                "ALL" ||
              service.service_category_id ===
                categoryFilter;


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
                service.service_scope,
                service
                  .service_categories
                  ?.name,
                service
                  .service_categories
                  ?.slug,
                service
                  .universities
                  ?.code,
                service
                  .universities
                  ?.name,
              ]
                .filter(
                  Boolean,
                )
                .join(
                  " ",
                )
                .toLowerCase();


            const matchesSearch =
              !query ||
              searchable.includes(
                query,
              );


            return (
              matchesScope &&
              matchesCategory &&
              matchesUniversity &&
              matchesSearch
            );
          },
        );
      },
      [
        services,
        scopeFilter,
        categoryFilter,
        universityFilter,
        search,
      ],
    );


  return (
    <div className="space-y-6">
      <CreateServiceCard
        universities={
          realUniversities
        }
        categories={
          categories
        }
        formTypes={
          formTypes
        }
      />


      {/* ===============================================
          FILTERS
      =============================================== */}

      <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {/* SCOPE */}

            <select
              value={
                scopeFilter
              }
              onChange={(
                event,
              ) =>
                setScopeFilter(
                  event.target.value,
                )
              }
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">
                All Scopes
              </option>

              <option value="general">
                General Services
              </option>

              <option value="academic">
                Academic Services
              </option>
            </select>


            {/* CATEGORY */}

            <select
              value={
                categoryFilter
              }
              onChange={(
                event,
              ) =>
                setCategoryFilter(
                  event.target.value,
                )
              }
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">
                All Categories
              </option>


              {categories.map(
                (
                  category,
                ) => (
                  <option
                    key={
                      category.id
                    }
                    value={
                      category.id
                    }
                  >
                    {
                      category.name
                    }
                  </option>
                ),
              )}
            </select>


            {/* INSTITUTION */}

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
                All Institutions
              </option>


              {realUniversities.map(
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
                    {university.code}
                    {" — "}
                    {university.name}
                  </option>
                ),
              )}
            </select>


            {/* SEARCH */}

            <div className="relative">
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


          <p className="shrink-0 text-xs text-slate-400">
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
    ServiceCategory[];

  formTypes:
    string[];
}) {
  const [
    open,
    setOpen,
  ] =
    useState(
      false,
    );


  const [
    serviceScope,
    setServiceScope,
  ] =
    useState<
      "general" |
      "academic"
    >(
      "general",
    );


  const [
    universityId,
    setUniversityId,
  ] =
    useState(
      "",
    );


  const [
    serviceCategoryId,
    setServiceCategoryId,
  ] =
    useState(
      categories.find(
        (
          category,
        ) =>
          category.active,
      )?.id ??
        "",
    );


  const [
    slug,
    setSlug,
  ] =
    useState(
      "",
    );


  const [
    name,
    setName,
  ] =
    useState(
      "",
    );


  const [
    shortName,
    setShortName,
  ] =
    useState(
      "",
    );


  const [
    description,
    setDescription,
  ] =
    useState(
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
    displayOrder,
    setDisplayOrder,
  ] =
    useState(
      "0",
    );


  const [
    featured,
    setFeatured,
  ] =
    useState(
      false,
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


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  const activeUniversities =
    universities.filter(
      (
        university,
      ) =>
        university.active,
    );


  const activeCategories =
    categories.filter(
      (
        category,
      ) =>
        category.active,
    );


  function reset() {
    setServiceScope(
      "general",
    );

    setUniversityId(
      "",
    );

    setServiceCategoryId(
      activeCategories[0]
        ?.id ??
        "",
    );

    setSlug(
      "",
    );

    setName(
      "",
    );

    setShortName(
      "",
    );

    setDescription(
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

    setDisplayOrder(
      "0",
    );

    setFeatured(
      false,
    );

    setError(
      "",
    );
  }


  function handleScopeChange(
    value:
      "general" |
      "academic",
  ) {
    setServiceScope(
      value,
    );


    if (
      value ===
      "general"
    ) {
      setUniversityId(
        "",
      );
    }
  }


  function handleCreate() {
    setError(
      "",
    );

    setSuccess(
      "",
    );


    startTransition(
      async () => {
        const result =
          await createService({
            serviceScope,

            universityId:
              serviceScope ===
              "academic"
                ? universityId
                : null,

            serviceCategoryId,

            slug,

            name,

            shortName,

            description,

            formType,

            displayOrder:
              Number(
                displayOrder,
              ),

            featured,
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


        setOpen(
          false,
        );
      },
    );
  }


  const createDisabled =
    pending ||
    !slug ||
    !name.trim() ||
    !shortName.trim() ||
    !serviceCategoryId ||
    !formType ||
    (
      serviceScope ===
        "academic" &&
      !universityId
    );


  return (
    <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="font-semibold text-slate-950">
            Service Directory
          </h2>


          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            Add general services directly under Seekers Connect or
            attach academic services to a supported institution.
          </p>
        </div>


        <Button
          type="button"
          onClick={() =>
            setOpen(
              (
                value,
              ) =>
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

          {
            success
          }
        </div>
      )}


      {open && (
        <div className="border-t border-slate-100 p-5 sm:p-6">
          {/* ===========================================
              SCOPE
          =========================================== */}

          <div>
            <Label>
              Service Scope
            </Label>


            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={
                  pending
                }
                onClick={() =>
                  handleScopeChange(
                    "general",
                  )
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  serviceScope ===
                  "general"
                    ? "border-blue-300 bg-blue-50 ring-2 ring-blue-100"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <Shapes className="h-5 w-5" />
                  </div>


                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      General Service
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Not tied to a university or institution.
                    </p>
                  </div>
                </div>
              </button>


              <button
                type="button"
                disabled={
                  pending
                }
                onClick={() =>
                  handleScopeChange(
                    "academic",
                  )
                }
                className={`rounded-2xl border p-4 text-left transition ${
                  serviceScope ===
                  "academic"
                    ? "border-violet-300 bg-violet-50 ring-2 ring-violet-100"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <BookOpen className="h-5 w-5" />
                  </div>


                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Academic / Institution Service
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Attached to a supported institution.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>


          {/* ===========================================
              CORE FIELDS
          =========================================== */}

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {/* CATEGORY */}

            <div className="space-y-2">
              <Label htmlFor="serviceCategory">
                Service Category
              </Label>


              <select
                id="serviceCategory"
                value={
                  serviceCategoryId
                }
                onChange={(
                  event,
                ) =>
                  setServiceCategoryId(
                    event.target.value,
                  )
                }
                disabled={
                  pending
                }
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select category
                </option>


                {activeCategories.map(
                  (
                    category,
                  ) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  ),
                )}
              </select>
            </div>


            {/* INSTITUTION */}

            <div className="space-y-2">
              <Label htmlFor="serviceUniversity">
                Institution
              </Label>


              {serviceScope ===
              "general" ? (
                <>
                  <Input
                    id="serviceUniversity"
                    value="Not required for general services"
                    disabled
                    className="bg-slate-50 text-slate-500"
                  />

                  <p className="text-xs text-slate-400">
                    General services belong directly to Seekers Connect 247.
                  </p>
                </>
              ) : (
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
                    Select institution
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
                        {university.code}
                        {" — "}
                        {university.name}
                      </option>
                    ),
                  )}
                </select>
              )}
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
                ) => {
                  const value =
                    event.target.value;

                  setName(
                    value,
                  );


                  if (
                    !slug
                  ) {
                    setSlug(
                      slugify(
                        value,
                      ),
                    );
                  }


                  if (
                    !shortName
                  ) {
                    setShortName(
                      value,
                    );
                  }
                }}
                placeholder="Gazette"
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
                placeholder="Gazette"
                disabled={
                  pending
                }
              />
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
                placeholder="gazette"
                disabled={
                  pending
                }
              />


              <p className="text-xs text-slate-400">
                Stable internal identifier. It cannot be edited after creation.
              </p>
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
                  (
                    value,
                  ) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {
                        humanize(
                          value,
                        )
                      }
                    </option>
                  ),
                )}
              </select>


              <p className="text-xs text-slate-400">
                Use Generic for new services. Individual fields are configured after creation.
              </p>
            </div>


            {/* DISPLAY ORDER */}

            <div className="space-y-2">
              <Label htmlFor="serviceDisplayOrder">
                Display Order
              </Label>


              <Input
                id="serviceDisplayOrder"
                type="number"
                min="0"
                value={
                  displayOrder
                }
                onChange={(
                  event,
                ) =>
                  setDisplayOrder(
                    event.target.value,
                  )
                }
                disabled={
                  pending
                }
              />


              <p className="text-xs text-slate-400">
                Smaller numbers appear earlier.
              </p>
            </div>


            {/* FEATURED */}

            <div className="space-y-2">
              <Label>
                Visibility
              </Label>


              <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3">
                <input
                  type="checkbox"
                  checked={
                    featured
                  }
                  onChange={(
                    event,
                  ) =>
                    setFeatured(
                      event.target.checked,
                    )
                  }
                  disabled={
                    pending
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />

                <span className="text-sm text-slate-700">
                  Feature this service
                </span>
              </label>
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
              className="min-h-28"
            />
          </div>


          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {
                error
              }
            </div>
          )}


          <div className="mt-5 flex justify-end">
            <Button
              type="button"
              disabled={
                createDisabled
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
    ServiceCategory[];

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
          Add a service or change your current filters.
        </p>
      </div>
    );
  }


  return (
    <div className="grid gap-4">
      {services.map(
        (
          service,
        ) => (
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
    ServiceCategory[];

  formTypes:
    string[];
}) {
  const currentService =
    service;


  const [
    editing,
    setEditing,
  ] =
    useState(
      false,
    );


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
    serviceCategoryId,
    setServiceCategoryId,
  ] =
    useState(
      currentService.service_category_id,
    );


  const [
    formType,
    setFormType,
  ] =
    useState(
      currentService.form_type,
    );


  const [
    displayOrder,
    setDisplayOrder,
  ] =
    useState(
      String(
        currentService.display_order ??
          0,
      ),
    );


  const [
    featured,
    setFeatured,
  ] =
    useState(
      currentService.featured,
    );


  const [
    error,
    setError,
  ] =
    useState(
      "",
    );


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

    setServiceCategoryId(
      currentService.service_category_id,
    );

    setFormType(
      currentService.form_type,
    );

    setDisplayOrder(
      String(
        currentService.display_order ??
          0,
      ),
    );

    setFeatured(
      currentService.featured,
    );

    setError(
      "",
    );

    setEditing(
      false,
    );
  }


  function handleSave() {
    setError(
      "",
    );


    startTransition(
      async () => {
        const result =
          await updateService(
            currentService.id,
            {
              name,

              shortName,

              description,

              serviceCategoryId,

              formType,

              displayOrder:
                Number(
                  displayOrder,
                ),

              featured,
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


        setEditing(
          false,
        );
      },
    );
  }


  function handleToggle() {
    setError(
      "",
    );


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


  const categoryName =
    currentService
      .service_categories
      ?.name ??
    "Uncategorised";


  const institutionLabel =
    currentService.service_scope ===
    "general"
      ? "Seekers Connect 247"
      : currentService
          .universities
          ?.code &&
        currentService
          .universities
          ?.name
        ? `${currentService.universities.code} — ${currentService.universities.name}`
        : "Institution unavailable";


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
                ? currentService.service_scope ===
                  "general"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-violet-50 text-violet-600"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {currentService.active ? (
              currentService.service_scope ===
              "general" ? (
                <Shapes className="h-5 w-5" />
              ) : (
                <BookOpen className="h-5 w-5" />
              )
            ) : (
              <CircleOff className="h-5 w-5" />
            )}
          </div>


          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {/* SCOPE */}

              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  currentService.service_scope ===
                  "general"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-950 text-white"
                }`}
              >
                {currentService.service_scope ===
                "general"
                  ? "GENERAL SERVICE"
                  : "ACADEMIC SERVICE"}
              </span>


              {/* CATEGORY */}

              <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                {
                  categoryName
                }
              </span>


              {/* SLUG */}

              <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[10px] text-slate-600">
                {
                  currentService.slug
                }
              </span>


              {/* STATUS */}

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


              {currentService.featured && (
                <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-yellow-700">
                  <Star className="mr-1 h-3 w-3" />

                  Featured
                </span>
              )}
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


                <p className="mt-2 text-xs font-medium text-slate-400">
                  {
                    institutionLabel
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
                  <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-violet-700">
                    Form:{" "}
                    {
                      humanize(
                        currentService.form_type,
                      )
                    }
                  </span>


                  <span className="rounded-lg bg-slate-50 px-2.5 py-1 text-slate-600">
                    Order:{" "}
                    {
                      currentService.display_order
                    }
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


      {/* ===============================================
          EDIT
      =============================================== */}

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
                Service Category
              </Label>


              <select
                value={
                  serviceCategoryId
                }
                onChange={(
                  event,
                ) =>
                  setServiceCategoryId(
                    event.target.value,
                  )
                }
                disabled={
                  pending
                }
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                {categories.map(
                  (
                    category,
                  ) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {
                        category.name
                      }
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
                  (
                    value,
                  ) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {
                        humanize(
                          value,
                        )
                      }
                    </option>
                  ),
                )}
              </select>
            </div>


            <div className="space-y-2">
              <Label>
                Display Order
              </Label>


              <Input
                type="number"
                min="0"
                value={
                  displayOrder
                }
                onChange={(
                  event,
                ) =>
                  setDisplayOrder(
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
                Visibility
              </Label>


              <label className="flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3">
                <input
                  type="checkbox"
                  checked={
                    featured
                  }
                  onChange={(
                    event,
                  ) =>
                    setFeatured(
                      event.target.checked,
                    )
                  }
                  disabled={
                    pending
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />

                <span className="text-sm text-slate-700">
                  Feature this service
                </span>
              </label>
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
            Scope, institution and service slug are intentionally
            locked after creation because existing customer requests
            may already depend on those identifiers.
          </div>


          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {
                error
              }
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
                !shortName.trim() ||
                !serviceCategoryId
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
            {
              error
            }
          </div>
        )}
    </div>
  );
}


// =========================================================
// HELPERS
// =========================================================

function slugify(
  value:
    string,
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
  value:
    string,
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
      (
        letter,
      ) =>
        letter.toUpperCase(),
    );
}