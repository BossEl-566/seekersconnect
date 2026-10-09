"use client";

import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Shapes,
  ShieldCheck,
  Upload,
  UserRound,
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

import type {
  SystemSettings,
} from "@/lib/validation/system-settings";

import type {
  RequestDraft,
} from "@/types/request";

import type {
  RequestCatalog,
  RequestCatalogCategory,
  RequestCatalogField,
  RequestCatalogService,
  RequestCatalogUniversity,
} from "@/types/request-catalog";


// =========================================================
// LOCAL STORAGE
//
// V2 deliberately uses a new key because the selection model
// changed from university-first to category-first.
// =========================================================

const STORAGE_KEY =
  "seekers-connect-request-draft-v2";


// =========================================================
// STEPS
// =========================================================

const steps = [
  {
    number:
      1,

    label:
      "Category",

    icon:
      Shapes,
  },

  {
    number:
      2,

    label:
      "Service",

    icon:
      FileText,
  },

  {
    number:
      3,

    label:
      "Details",

    icon:
      UserRound,
  },

  {
    number:
      4,

    label:
      "Delivery",

    icon:
      Package,
  },

  {
    number:
      5,

    label:
      "Payment",

    icon:
      CreditCard,
  },

  {
    number:
      6,

    label:
      "Review",

    icon:
      ShieldCheck,
  },
];


// =========================================================
// INITIAL DRAFT
// =========================================================

const initialDraft:
  RequestDraft =
{
  categoryId:
    "",

  serviceKey:
    "",

  universityId:
    "",

  serviceId:
    "",

  pricingQuantity:
    "",

  applicant: {
    firstName:
      "",

    otherNames:
      "",

    surname:
      "",

    gender:
      "",

    phone:
      "",

    email:
      "",
  },


  responses:
    {},


  delivery: {
    required:
      true,

    fullName:
      "",

    houseNumber:
      "",

    areaTown:
      "",

    cityDistrict:
      "",

    region:
      "",

    digitalAddress:
      "",

    phone:
      "",

    email:
      "",

    itemType:
      "Service Request",

    emergencyContact:
      "",
  },


  paymentMethod:
    "",


  notes:
    "",
};


// =========================================================
// API RESPONSE TYPES
// =========================================================

type CatalogApiResponse = {
  success?:
    boolean;

  catalog?:
    RequestCatalog;

  message?:
    string;
};


type PublicSettingsApiResponse = {
  success?:
    boolean;

  settings?:
    SystemSettings;

  message?:
    string;
};


// =========================================================
// ACADEMIC SERVICE FAMILY
//
// An academic service such as "Transcript" can exist as
// separate database service rows for UCC, UG, KNUST, etc.
//
// The customer should see one "Transcript" card first, then
// choose the institution.
// =========================================================

type AcademicServiceOffering = {
  university:
    RequestCatalogUniversity;

  service:
    RequestCatalogService;
};


type AcademicServiceFamily = {
  key:
    string;

  slug:
    string;

  name:
    string;

  shortName:
    string;

  description:
    | string
    | null;

  offerings:
    AcademicServiceOffering[];
};


// =========================================================
// MAIN REQUEST WIZARD
// =========================================================

export function RequestWizard() {
  const [
    currentStep,
    setCurrentStep,
  ] =
    useState(
      1,
    );


  const [
    draft,
    setDraft,
  ] =
    useState<RequestDraft>(
      initialDraft,
    );


  const [
    hydrated,
    setHydrated,
  ] =
    useState(
      false,
    );


  // =======================================================
  // CATALOG
  // =======================================================

  const [
    catalog,
    setCatalog,
  ] =
    useState<
      RequestCatalog
      | null
    >(
      null,
    );


  const [
    catalogLoading,
    setCatalogLoading,
  ] =
    useState(
      true,
    );


  const [
    catalogError,
    setCatalogError,
  ] =
    useState(
      "",
    );


  const [
    catalogReloadKey,
    setCatalogReloadKey,
  ] =
    useState(
      0,
    );


  // =======================================================
  // SETTINGS
  // =======================================================

  const [
    publicSettings,
    setPublicSettings,
  ] =
    useState<
      SystemSettings
      | null
    >(
      null,
    );


  const [
    settingsLoading,
    setSettingsLoading,
  ] =
    useState(
      true,
    );


  const [
    settingsError,
    setSettingsError,
  ] =
    useState(
      "",
    );


  const [
    settingsReloadKey,
    setSettingsReloadKey,
  ] =
    useState(
      0,
    );


  // =======================================================
  // PAYMENT / SUBMISSION
  // =======================================================

  const [
    paymentProof,
    setPaymentProof,
  ] =
    useState<
      File
      | null
    >(
      null,
    );


  const [
    submitting,
    setSubmitting,
  ] =
    useState(
      false,
    );


  const [
    submitError,
    setSubmitError,
  ] =
    useState(
      "",
    );


  const [
    submittedRequest,
    setSubmittedRequest,
  ] =
    useState<{
      requestNumber:
        string;

      status:
        string;

      pricingMode:
        string;

      currency:
        string;

      totalAmount:
        number
        | null;
    } | null>(
      null,
    );


  // =======================================================
  // RESTORE DRAFT
  // =======================================================

  useEffect(
    () => {
      try {
        const saved =
          localStorage.getItem(
            STORAGE_KEY,
          );


        if (
          saved
        ) {
          const parsed =
            JSON.parse(
              saved,
            ) as Partial<RequestDraft>;


          // eslint-disable-next-line react-hooks/set-state-in-effect
          setDraft({
            ...initialDraft,
            ...parsed,

            applicant: {
              ...initialDraft.applicant,
              ...(
                parsed.applicant ??
                {}
              ),
            },

            delivery: {
              ...initialDraft.delivery,
              ...(
                parsed.delivery ??
                {}
              ),
            },

            responses:
              parsed.responses ??
              {},
          });
        }
      } catch {
        localStorage.removeItem(
          STORAGE_KEY,
        );
      }


      setHydrated(
        true,
      );
    },
    [],
  );


  // =======================================================
  // SAVE DRAFT
  // =======================================================

  useEffect(
    () => {
      if (
        !hydrated
      ) {
        return;
      }


      localStorage.setItem(
        STORAGE_KEY,

        JSON.stringify(
          draft,
        ),
      );
    },
    [
      draft,
      hydrated,
    ],
  );


  // =======================================================
  // LOAD CATALOG
  // =======================================================

  useEffect(
    () => {
      let cancelled =
        false;


      async function loadCatalog() {
        setCatalogLoading(
          true,
        );

        setCatalogError(
          "",
        );


        try {
          const response =
            await fetch(
              "/api/request-catalog",
              {
                cache:
                  "no-store",
              },
            );


          const result =
            (
              await response.json()
            ) as CatalogApiResponse;


          if (
            !response.ok ||
            !result.success ||
            !result.catalog
          ) {
            throw new Error(
              result.message ||
                "The request services could not be loaded.",
            );
          }


          if (
            cancelled
          ) {
            return;
          }


          setCatalog(
            result.catalog,
          );
        } catch (
          error
        ) {
          if (
            cancelled
          ) {
            return;
          }


          setCatalog(
            null,
          );


          setCatalogError(
            error instanceof
              Error
              ? error.message
              : "The request services could not be loaded.",
          );
        } finally {
          if (
            !cancelled
          ) {
            setCatalogLoading(
              false,
            );
          }
        }
      }


      loadCatalog();


      return () => {
        cancelled =
          true;
      };
    },
    [
      catalogReloadKey,
    ],
  );


  // =======================================================
  // LOAD PUBLIC SETTINGS
  // =======================================================

  useEffect(
    () => {
      let cancelled =
        false;


      async function loadSettings() {
        setSettingsLoading(
          true,
        );

        setSettingsError(
          "",
        );


        try {
          const response =
            await fetch(
              "/api/public-settings",
              {
                cache:
                  "no-store",
              },
            );


          const result =
            (
              await response.json()
            ) as PublicSettingsApiResponse;


          if (
            !response.ok ||
            !result.success ||
            !result.settings
          ) {
            throw new Error(
              result.message ||
                "Public settings could not be loaded.",
            );
          }


          if (
            cancelled
          ) {
            return;
          }


          setPublicSettings(
            result.settings,
          );
        } catch (
          error
        ) {
          if (
            cancelled
          ) {
            return;
          }


          setPublicSettings(
            null,
          );


          setSettingsError(
            error instanceof
              Error
              ? error.message
              : "Public settings could not be loaded.",
          );
        } finally {
          if (
            !cancelled
          ) {
            setSettingsLoading(
              false,
            );
          }
        }
      }


      loadSettings();


      return () => {
        cancelled =
          true;
      };
    },
    [
      settingsReloadKey,
    ],
  );


  // =======================================================
  // CATEGORIES
  // =======================================================

  const availableCategories =
    useMemo(
      () =>
        [
          ...(
            catalog
              ?.categories ??
            []
          ),
        ].sort(
          (
            first,
            second,
          ) =>
            first.displayOrder -
              second.displayOrder ||
            first.name.localeCompare(
              second.name,
            ),
        ),
      [
        catalog,
      ],
    );


  const selectedCategory =
    useMemo<
      RequestCatalogCategory
      | undefined
    >(
      () =>
        availableCategories.find(
          (
            category,
          ) =>
            category.id ===
            draft.categoryId,
        ),
      [
        availableCategories,
        draft.categoryId,
      ],
    );


  // =======================================================
  // ACADEMIC SERVICE FAMILIES FOR SELECTED CATEGORY
  // =======================================================

  const academicFamilies =
    useMemo<
      AcademicServiceFamily[]
    >(
      () => {
        if (
          !catalog ||
          !selectedCategory
        ) {
          return [];
        }


        const familyMap =
          new Map<
            string,
            AcademicServiceFamily
          >();


        for (
          const university of
          catalog.universities
        ) {
          if (
            university.code ===
            "SC247"
          ) {
            continue;
          }


          for (
            const service of
            university.services
          ) {
            if (
              service.serviceScope !==
                "academic" ||
              service.serviceCategoryId !==
                selectedCategory.id
            ) {
              continue;
            }


            const key =
              service.slug;


            const existing =
              familyMap.get(
                key,
              );


            if (
              existing
            ) {
              existing.offerings.push({
                university,
                service,
              });

              continue;
            }


            familyMap.set(
              key,
              {
                key:
                  `academic:${service.slug}`,

                slug:
                  service.slug,

                name:
                  service.name,

                shortName:
                  service.shortName,

                description:
                  service.description,

                offerings: [
                  {
                    university,
                    service,
                  },
                ],
              },
            );
          }
        }


        return Array.from(
          familyMap.values(),
        ).sort(
          (
            first,
            second,
          ) =>
            first.name.localeCompare(
              second.name,
            ),
        );
      },
      [
        catalog,
        selectedCategory,
      ],
    );


  // =======================================================
  // GENERAL SERVICES FOR SELECTED CATEGORY
  // =======================================================

  const categoryGeneralServices =
    useMemo(
      () =>
        selectedCategory
          ?.generalServices ??
        [],
      [
        selectedCategory,
      ],
    );


  // =======================================================
  // SELECTED ACADEMIC FAMILY
  // =======================================================

  const selectedAcademicFamily =
    useMemo<
      AcademicServiceFamily
      | undefined
    >(
      () =>
        academicFamilies.find(
          (
            family,
          ) =>
            family.key ===
            draft.serviceKey,
        ),
      [
        academicFamilies,
        draft.serviceKey,
      ],
    );


  // =======================================================
  // ALL CONCRETE SERVICES
  // =======================================================

  const allConcreteServices =
    useMemo(
      () => {
        if (
          !catalog
        ) {
          return [];
        }


        const map =
          new Map<
            string,
            RequestCatalogService
          >();


        for (
          const service of
          catalog.generalServices
        ) {
          map.set(
            service.id,
            service,
          );
        }


        for (
          const university of
          catalog.universities
        ) {
          for (
            const service of
            university.services
          ) {
            map.set(
              service.id,
              service,
            );
          }
        }


        return Array.from(
          map.values(),
        );
      },
      [
        catalog,
      ],
    );


  const selectedService =
    useMemo<
      RequestCatalogService
      | undefined
    >(
      () =>
        allConcreteServices.find(
          (
            service,
          ) =>
            service.id ===
            draft.serviceId,
        ),
      [
        allConcreteServices,
        draft.serviceId,
      ],
    );

      // =======================================================
  // PRICING BEHAVIOUR
  // =======================================================

  const effectivePricingMode =
    selectedService
      ?.pricing
      ?.mode ??
    "MANUAL_PRICE";


  const paymentRequiredNow =
    selectedService
      ? (
          effectivePricingMode ===
            "FIXED" ||
          effectivePricingMode ===
            "PER_UNIT"
        )
      : true;


  const visibleSteps =
    useMemo(
      () =>
        paymentRequiredNow
          ? steps
          : steps.filter(
              (
                step,
              ) =>
                step.number !==
                5,
            ),
      [
        paymentRequiredNow,
      ],
    );


  const selectedUniversity =
    useMemo<
      RequestCatalogUniversity
      | undefined
    >(
      () =>
        catalog
          ?.universities
          .find(
            (
              university,
            ) =>
              university.id ===
              draft.universityId,
          ),
      [
        catalog,
        draft.universityId,
      ],
    );


  const dynamicFields =
    useMemo<
      RequestCatalogField[]
    >(
      () =>
        selectedService
          ?.fields ??
        [],
      [
        selectedService,
      ],
    );


  // =======================================================
  // RECONCILE SAVED V2 DRAFT WITH CURRENT CATALOG
  // =======================================================

  useEffect(
    () => {
      if (
        !hydrated ||
        !catalog
      ) {
        return;
      }


      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraft(
        (
          current,
        ) =>
          reconcileDraftWithCatalog(
            current,
            catalog,
          ),
      );
    },
    [
      hydrated,
      catalog,
    ],
  );


  // =======================================================
  // CATEGORY SELECTION
  // =======================================================

  function selectCategory(
    categoryId:
      string,
  ) {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        categoryId,

        serviceKey:
          "",

        universityId:
          "",

        serviceId:
          "",

        pricingQuantity:
          "",

        paymentMethod:
          "",

        responses:
          {},

        delivery: {
          ...current.delivery,

          itemType:
            "Service Request",
        },
      }),
    );
            setPaymentProof(
      null,
    );
  }


  // =======================================================
  // GENERAL SERVICE SELECTION
  // =======================================================

  function selectGeneralService(
    service:
      RequestCatalogService,
  ) {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        serviceKey:
          `general:${service.id}`,

        universityId:
          "",

        serviceId:
          service.id,

        pricingQuantity:
          "",

        paymentMethod:
          "",

        responses:
          {},

        delivery: {
          ...current.delivery,

          itemType:
            service.shortName ||
            service.name ||
            "Service Request",
        },
      }),
    );
        setPaymentProof(
      null,
    );
  }


  // =======================================================
  // ACADEMIC SERVICE FAMILY SELECTION
  // =======================================================

  function selectAcademicFamily(
    family:
      AcademicServiceFamily,
  ) {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        serviceKey:
          family.key,

        universityId:
          "",

        serviceId:
          "",

        pricingQuantity:
          "",

        paymentMethod:
          "",

        responses:
          {},

        delivery: {
          ...current.delivery,

          itemType:
            "Academic Document",
        },
      }),
    );
        setPaymentProof(
      null,
    );
  }


  // =======================================================
  // ACADEMIC INSTITUTION SELECTION
  // =======================================================

  function selectAcademicInstitution(
    universityId:
      string,
  ) {
    if (
      !selectedAcademicFamily
    ) {
      return;
    }


    const offering =
      selectedAcademicFamily
        .offerings
        .find(
          (
            item,
          ) =>
            item.university.id ===
            universityId,
        );


    if (
      !offering
    ) {
      return;
    }


    setDraft(
      (
        current,
      ) => ({
        ...current,

        universityId:
          offering.university.id,

        serviceId:
          offering.service.id,

        pricingQuantity:
          "",

        paymentMethod:
          "",

        responses:
          {},

        delivery: {
          ...current.delivery,

          itemType:
            "Academic Document",
        },
      }),
    );
        setPaymentProof(
      null,
    );
  }


  // =======================================================
  // UPDATE APPLICANT
  // =======================================================

  function updateApplicant(
    key:
      keyof RequestDraft["applicant"],

    value:
      string,
  ) {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        applicant: {
          ...current.applicant,

          [key]:
            value,
        },
      }),
    );
  }


  // =======================================================
  // UPDATE RESPONSE
  // =======================================================

  function updateResponse(
    key:
      string,

    value:
      string,
  ) {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        responses: {
          ...current.responses,

          [key]:
            value,
        },
      }),
    );
  }


  // =======================================================
  // UPDATE DELIVERY
  // =======================================================

  function updateDelivery(
    key:
      keyof RequestDraft["delivery"],

    value:
      string
      | boolean,
  ) {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        delivery: {
          ...current.delivery,

          [key]:
            value,
        },
      }),
    );
  }


  // =======================================================
  // VALIDATION
  // =======================================================

  function canContinue() {
    if (
      currentStep ===
      1
    ) {
      return Boolean(
        selectedCategory,
      );
    }


    if (
      currentStep ===
      2
    ) {
      return Boolean(
        selectedService,
      );
    }


    if (
      currentStep ===
      3
    ) {
      const applicantComplete =
        draft.applicant.firstName.trim() &&
        draft.applicant.surname.trim() &&
        draft.applicant.gender.trim() &&
        draft.applicant.phone.trim() &&
        draft.applicant.email.trim();


      const requiredDynamicFieldsComplete =
        dynamicFields
          .filter(
            (
              field,
            ) =>
              field.required,
          )
          .every(
            (
              field,
            ) =>
              Boolean(
                draft.responses[
                  field.key
                ]?.trim(),
              ),
          );


      return Boolean(
        applicantComplete &&
        requiredDynamicFieldsComplete,
      );
    }


    if (
      currentStep ===
      4
    ) {
      if (
        !draft.delivery.required
      ) {
        return true;
      }


      return Boolean(
        draft.delivery.fullName.trim() &&
        draft.delivery.areaTown.trim() &&
        draft.delivery.cityDistrict.trim() &&
        draft.delivery.region.trim() &&
        draft.delivery.phone.trim() &&
        draft.delivery.emergencyContact.trim(),
      );
    }


        if (
      currentStep ===
      5
    ) {
      if (
        !paymentRequiredNow
      ) {
        return true;
      }


      if (
        effectivePricingMode ===
        "PER_UNIT"
      ) {
        const quantity =
          Number(
            draft.pricingQuantity,
          );


        const minimumQuantity =
          selectedService
            ?.pricing
            ?.minimumQuantity ??
          null;


        const maximumQuantity =
          selectedService
            ?.pricing
            ?.maximumQuantity ??
          null;


        if (
          !Number.isFinite(
            quantity,
          ) ||
          quantity <=
            0
        ) {
          return false;
        }


        if (
          minimumQuantity !==
            null &&
          quantity <
            minimumQuantity
        ) {
          return false;
        }


        if (
          maximumQuantity !==
            null &&
          quantity >
            maximumQuantity
        ) {
          return false;
        }
      }


      return Boolean(
        draft.paymentMethod &&
        paymentProof,
      );
    }


    return true;
  }


  // =======================================================
  // NAVIGATION
  // =======================================================

    function nextStep() {
    if (
      !canContinue()
    ) {
      return;
    }


    setCurrentStep(
      (
        step,
      ) => {
        if (
          step ===
            4 &&
          !paymentRequiredNow
        ) {
          return 6;
        }


        return Math.min(
          step + 1,
          6,
        );
      },
    );


    window.scrollTo({
      top:
        0,

      behavior:
        "smooth",
    });
  }


    function previousStep() {
    setCurrentStep(
      (
        step,
      ) => {
        if (
          step ===
            6 &&
          !paymentRequiredNow
        ) {
          return 4;
        }


        return Math.max(
          step - 1,
          1,
        );
      },
    );


    window.scrollTo({
      top:
        0,

      behavior:
        "smooth",
    });
  }


  // =======================================================
  // SUBMIT REQUEST
  // =======================================================

    async function submitRequest() {
    if (
      submitting
    ) {
      return;
    }


    if (
      !selectedCategory ||
      !selectedService
    ) {
      setSubmitError(
        "The selected service is no longer available. Please start the request again.",
      );

      return;
    }


    if (
      selectedService.serviceScope ===
        "academic" &&
      !selectedUniversity
    ) {
      setSubmitError(
        "Please select the institution for this academic service.",
      );

      return;
    }


    if (
      paymentRequiredNow &&
      !paymentProof
    ) {
      setSubmitError(
        "Please upload proof of payment before submitting.",
      );

      return;
    }


    if (
      paymentRequiredNow &&
      effectivePricingMode ===
        "PER_UNIT"
    ) {
      const quantity =
        Number(
          draft.pricingQuantity,
        );


      if (
        !Number.isFinite(
          quantity,
        ) ||
        quantity <=
          0
      ) {
        setSubmitError(
          "Enter a valid quantity for this service.",
        );

        return;
      }
    }


    setSubmitting(
      true,
    );


    setSubmitError(
      "",
    );


    try {
      const formData =
        new FormData();


      formData.append(
        "draft",

        JSON.stringify(
          draft,
        ),
      );


      if (
        paymentRequiredNow &&
        paymentProof
      ) {
        formData.append(
          "paymentProof",
          paymentProof,
        );
      }


      const response =
        await fetch(
          "/api/requests",
          {
            method:
              "POST",

            body:
              formData,
          },
        );


      const result =
        await response.json();


      if (
        !response.ok
      ) {
        throw new Error(
          result.message ||
            "Unable to submit request.",
        );
      }


      localStorage.removeItem(
        STORAGE_KEY,
      );


      setSubmittedRequest({
        requestNumber:
          result.request
            .requestNumber,

        status:
          result.request
            .status,

        pricingMode:
          result.request
            .pricingMode,

        currency:
          result.request
            .currency,

        totalAmount:
          result.request
            .totalAmount,
      });
    } catch (
      error
    ) {
      setSubmitError(
        error instanceof
          Error
          ? error.message
          : "Unable to submit request.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }


  // =======================================================
  // CLEAR DRAFT
  // =======================================================

  function clearDraft() {
  setDraft(
    initialDraft,
  );


  setPaymentProof(
    null,
  );


  setSubmitError(
    "",
  );


  setSubmittedRequest(
    null,
  );


  setCurrentStep(
    1,
  );


  localStorage.removeItem(
    STORAGE_KEY,
  );


  window.scrollTo({
    top:
      0,

    behavior:
      "smooth",
  });
}


  // =======================================================
  // INITIAL LOADING
  // =======================================================

  if (
    !hydrated ||
    catalogLoading ||
    settingsLoading
  ) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" />

          <p className="mt-3 text-sm text-slate-500">
            Preparing your request...
          </p>
        </div>
      </div>
    );
  }


  // =======================================================
  // FAILURE
  // =======================================================

  if (
    catalogError ||
    settingsError ||
    !catalog ||
    !publicSettings
  ) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[28px] border border-red-200 bg-white p-7 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <RefreshCw className="h-6 w-6" />
          </div>


          <h1 className="mt-5 text-2xl font-semibold text-slate-950">
            Request form could not be loaded.
          </h1>


          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
            {catalogError ||
              settingsError ||
              "Please try loading the request form again."}
          </p>


          <Button
            type="button"
            onClick={() => {
              setCatalogReloadKey(
                (
                  value,
                ) =>
                  value + 1,
              );


              setSettingsReloadKey(
                (
                  value,
                ) =>
                  value + 1,
              );
            }}
            className="mt-6 rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="mr-2 h-4 w-4" />

            Try Again
          </Button>
        </div>
      </div>
    );
  }


  // =======================================================
  // SUCCESS
  // =======================================================

  if (
    submittedRequest
  ) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[28px] border border-emerald-200 bg-white p-7 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-7 w-7" />
          </div>


          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Request Submitted
          </p>


          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            We have received your request.
          </h1>


<p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500">
  {submittedRequest.status ===
  "AWAITING_PAYMENT_VERIFICATION"
    ? `Your payment proof is now awaiting verification by ${publicSettings.company.shortName}.`
    : submittedRequest.pricingMode ===
        "FREE"
      ? "Your request has been submitted successfully. No service payment is required."
      : "Your request has been submitted successfully. Our team will review it and confirm the amount before payment."}
</p>


          <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Request Number
            </p>

            <p className="mt-2 break-all text-xl font-semibold tracking-wide text-slate-950">
              {
                submittedRequest
                  .requestNumber
              }
            </p>
          </div>


          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-left">
            <p className="font-semibold text-blue-950">
              What happens next?
            </p>

            <p className="mt-2 text-sm leading-6 text-blue-800">
  {submittedRequest.status ===
  "AWAITING_PAYMENT_VERIFICATION"
    ? "Our team will verify your payment. Once payment is confirmed, processing can begin and your secure tracking details will be issued."
    : submittedRequest.pricingMode ===
        "FREE"
      ? "Our team can now review and begin processing your request without waiting for payment."
      : "Our team will review the request and confirm the final price. Payment will only be required after the amount has been finalized."}
</p>
          </div>


          <p className="mt-6 text-xs leading-5 text-slate-400">
            {
              publicSettings
                .request
                .trackingNotice
            }
          </p>
        </div>
      </div>
    );
  }


  // =======================================================
  // WIZARD
  // =======================================================

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)]">

        {/* SIDEBAR */}

        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="px-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              Your progress
            </p>


            <div className="mt-4 space-y-1">
              {visibleSteps.map(
                (
                  step,
                  index,
                ) => {
                  const Icon =
                    step.icon;


                  const active =
                    currentStep ===
                    step.number;


                  const completed =
                    currentStep >
                    step.number;


                  return (
                    <div
                      key={
                        step.number
                      }
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 ${
                        active
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-500"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          completed
                            ? "bg-blue-600 text-white"
                            : active
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100"
                        }`}
                      >
                        {completed ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>


                      <div>
                        <p className="text-xs text-slate-400">
                          Step{" "}
{
  index + 1
}
                        </p>

                        <p
                          className={`text-sm font-medium ${
                            active
                              ? "text-blue-700"
                              : completed
                                ? "text-slate-700"
                                : ""
                          }`}
                        >
                          {
                            step.label
                          }
                        </p>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </aside>


        {/* MAIN */}

        <div>
          <MobileProgress
  currentStep={
    currentStep
  }
  visibleSteps={
    visibleSteps
  }
/>


          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">

            {currentStep ===
              1 && (
              <>
                <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                  {
                    publicSettings
                      .request
                      .requestNotice
                  }
                </div>


                <CategoryStep
                  categories={
                    availableCategories
                  }
                  selectedId={
                    draft.categoryId
                  }
                  onSelect={
                    selectCategory
                  }
                />
              </>
            )}


            {currentStep ===
              2 && (
              <ServiceStep
                category={
                  selectedCategory
                }
                generalServices={
                  categoryGeneralServices
                }
                academicFamilies={
                  academicFamilies
                }
                selectedServiceKey={
                  draft.serviceKey
                }
                selectedUniversityId={
                  draft.universityId
                }
                onSelectGeneral={
                  selectGeneralService
                }
                onSelectAcademic={
                  selectAcademicFamily
                }
                onSelectInstitution={
                  selectAcademicInstitution
                }
              />
            )}


            {currentStep ===
              3 && (
              <DetailsStep
                draft={
                  draft
                }
                dynamicFields={
                  dynamicFields
                }
                selectedService={
                  selectedService
                }
                updateApplicant={
                  updateApplicant
                }
                updateResponse={
                  updateResponse
                }
              />
            )}


            {currentStep ===
              4 && (
              <DeliveryStep
                draft={
                  draft
                }
                updateDelivery={
                  updateDelivery
                }
              />
            )}


            {currentStep ===
  5 &&
  paymentRequiredNow && (
  <PaymentStep
                draft={
                  draft
                }
                setDraft={
                  setDraft
                }
                  selectedService={
                  selectedService
                }
                paymentProof={
                  paymentProof
                }
                onPaymentProofChange={
                  setPaymentProof
                }
                paymentSettings={
                  publicSettings
                    .payment
                }
                requestSettings={
                  publicSettings
                    .request
                }
              />
            )}


            {currentStep ===
              6 && (
              <ReviewStep
                draft={
                  draft
                }
                categoryName={
                  selectedCategory
                    ?.name
                }
                universityName={
                  selectedUniversity
                    ?.name
                }
                selectedService={
                  selectedService
                }
                dynamicFields={
                  dynamicFields
                }
              />
            )}


            {submitError && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {
                  submitError
                }
              </div>
            )}


            <div className="mt-9 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {currentStep >
                  1 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl sm:w-auto"
                    onClick={
                      previousStep
                    }
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />

                    Back
                  </Button>
                )}
              </div>


              {currentStep <
              steps.length ? (
                <Button
                  type="button"
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 sm:w-auto"
                  disabled={
                    !canContinue()
                  }
                  onClick={
                    nextStep
                  }
                >
                  Continue

                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 sm:w-auto"
disabled={
  submitting ||
  (
    paymentRequiredNow &&
    !paymentProof
  )
}
                  onClick={
                    submitRequest
                  }
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Request

                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>


          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={
                clearDraft
              }
              className="text-xs text-slate-400 underline-offset-4 hover:text-slate-600 hover:underline"
            >
              Clear saved form and start again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// =========================================================
// MOBILE PROGRESS
// =========================================================

function MobileProgress({
  currentStep,
  visibleSteps,
}: {
  currentStep:
    number;

  visibleSteps:
    typeof steps;
}) {
  const currentIndex =
    Math.max(
      visibleSteps.findIndex(
        (
          step,
        ) =>
          step.number ===
          currentStep,
      ),
      0,
    );


  const progress =
    (
      (
        currentIndex +
        1
      ) /
      visibleSteps.length
    ) * 100;


  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 lg:hidden">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          Step{" "}
          {currentIndex + 1}{" "}
          of{" "}
          {visibleSteps.length}
        </p>


        <p className="text-xs text-slate-500">
          {
            visibleSteps[
              currentIndex
            ]?.label
          }
        </p>
      </div>


      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{
            width:
              `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}


// =========================================================
// CATEGORY STEP
// =========================================================

function CategoryStep({
  categories,
  selectedId,
  onSelect,
}: {
  categories:
    RequestCatalogCategory[];

  selectedId:
    string;

  onSelect:
    (
      categoryId:
        string,
    ) => void;
}) {
  return (
    <>
      <StepHeading
        eyebrow="Service Category"
        title="What do you need help with?"
        description="Choose a service area to see the services currently available from Seekers Connect 247."
      />


      {categories.length ===
      0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <Shapes className="mx-auto h-7 w-7 text-slate-400" />

          <p className="mt-4 font-semibold text-slate-800">
            No service categories are currently available.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {categories.map(
            (
              category,
            ) => {
              const selected =
                selectedId ===
                category.id;


              const serviceCount =
                category
                  .generalServices
                  .length +
                category
                  .academicServiceCount;


              return (
                <button
                  key={
                    category.id
                  }
                  type="button"
                  onClick={() =>
                    onSelect(
                      category.id,
                    )
                  }
                  className={`relative min-h-[180px] rounded-[24px] border p-5 text-left transition ${
                    selected
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                      : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  }`}
                >
                  {selected && (
                    <div className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
                      <Check className="h-4 w-4" />
                    </div>
                  )}


                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      selected
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {category.slug ===
                    "errands-delivery" ? (
                      <Package className="h-5 w-5" />
                    ) : category.slug ===
                      "academic-documents" ? (
                      <FileText className="h-5 w-5" />
                    ) : (
                      <Shapes className="h-5 w-5" />
                    )}
                  </div>


                  <h3 className="mt-5 pr-8 text-lg font-semibold text-slate-950">
                    {
                      category.name
                    }
                  </h3>


                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {category.description ||
                      "Services provided by Seekers Connect 247."}
                  </p>


                  <p className="mt-4 text-xs font-medium text-blue-600">
                    {serviceCount}{" "}
                    service
                    {serviceCount ===
                    1
                      ? ""
                      : "s"}{" "}
                    available
                  </p>
                </button>
              );
            },
          )}
        </div>
      )}
    </>
  );
}


// =========================================================
// SERVICE STEP
// =========================================================

function ServiceStep({
  category,
  generalServices,
  academicFamilies,
  selectedServiceKey,
  selectedUniversityId,
  onSelectGeneral,
  onSelectAcademic,
  onSelectInstitution,
}: {
  category:
    | RequestCatalogCategory
    | undefined;

  generalServices:
    RequestCatalogService[];

  academicFamilies:
    AcademicServiceFamily[];

  selectedServiceKey:
    string;

  selectedUniversityId:
    string;

  onSelectGeneral:
    (
      service:
        RequestCatalogService,
    ) => void;

  onSelectAcademic:
    (
      family:
        AcademicServiceFamily,
    ) => void;

  onSelectInstitution:
    (
      universityId:
        string,
    ) => void;
}) {
  const selectedAcademicFamily =
    academicFamilies.find(
      (
        family,
      ) =>
        family.key ===
        selectedServiceKey,
    );


  const totalServices =
    generalServices.length +
    academicFamilies.length;


  return (
    <>
      <StepHeading
        eyebrow="Service"
        title={
          category
            ? `Choose a service under ${category.name}.`
            : "Choose a service."
        }
        description="Select the service you need. If the service is institution-specific, you will then choose the institution that should handle the request."
      />


      {totalServices ===
      0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <FileText className="mx-auto h-7 w-7 text-slate-400" />


          <p className="mt-4 font-semibold text-slate-800">
            No active services are currently available in this category.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {/* ===========================================
              GENERAL SERVICES
          =========================================== */}

          {generalServices.map(
            (
              service,
            ) => {
              const key =
                `general:${service.id}`;


              const selected =
                selectedServiceKey ===
                key;


              return (
                <button
                  key={
                    service.id
                  }
                  type="button"
                  onClick={() =>
                    onSelectGeneral(
                      service,
                    )
                  }
                  className={`flex min-h-[180px] w-full flex-col rounded-[22px] border p-5 text-left transition ${
                    selected
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                      : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        selected
                          ? "bg-blue-600 text-white"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <Package className="h-5 w-5" />
                    </div>


                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                        selected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {selected && (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </div>
                  </div>


                  <h3 className="mt-5 font-semibold text-slate-950">
                    {
                      service.name
                    }
                  </h3>


                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {service.description ||
                      "Service provided by Seekers Connect 247."}
                  </p>


                  <div className="mt-auto pt-4">
                    <ServicePricingLabel
                      service={
                        service
                      }
                    />
                  </div>
                </button>
              );
            },
          )}


          {/* ===========================================
              ACADEMIC SERVICE FAMILIES
          =========================================== */}

          {academicFamilies.map(
            (
              family,
            ) => {
              const selected =
                selectedServiceKey ===
                family.key;


              return (
                <button
                  key={
                    family.key
                  }
                  type="button"
                  onClick={() =>
                    onSelectAcademic(
                      family,
                    )
                  }
                  className={`flex min-h-[180px] w-full flex-col rounded-[22px] border p-5 text-left transition ${
                    selected
                      ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100"
                      : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        selected
                          ? "bg-violet-600 text-white"
                          : "bg-violet-50 text-violet-600"
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                    </div>


                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                        selected
                          ? "border-violet-600 bg-violet-600 text-white"
                          : "border-slate-300"
                      }`}
                    >
                      {selected && (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </div>
                  </div>


                  <h3 className="mt-5 font-semibold text-slate-950">
                    {
                      family.name
                    }
                  </h3>


                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {family.description ||
                      "Institution-based academic service."}
                  </p>


                  <div className="mt-auto pt-4">
                    <p className="text-xs font-medium text-violet-600">
                      Available from{" "}
                      {
                        family
                          .offerings
                          .length
                      }{" "}
                      institution
                      {family
                        .offerings
                        .length ===
                      1
                        ? ""
                        : "s"}
                    </p>


                    <p className="mt-1 text-xs text-slate-400">
                      Select the service to view institution-specific pricing.
                    </p>
                  </div>
                </button>
              );
            },
          )}
        </div>
      )}


      {/* ===============================================
          ACADEMIC INSTITUTION SELECTION

          Each institution can have its own services row,
          therefore its own pricing configuration.
      =============================================== */}

      {selectedAcademicFamily && (
        <div className="mt-10 border-t border-slate-200 pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-600">
            Institution Required
          </p>


          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Which institution should handle{" "}
            {
              selectedAcademicFamily
                .shortName
            }
            ?
          </h2>


          <p className="mt-2 text-sm leading-6 text-slate-500">
            Select the institution where the academic record or
            document is held. The price shown below belongs to that
            institution&apos;s specific service configuration.
          </p>


          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {selectedAcademicFamily
              .offerings
              .map(
                (
                  offering,
                ) => {
                  const selected =
                    selectedUniversityId ===
                    offering
                      .university
                      .id;


                  return (
                    <button
                      key={
                        offering
                          .university
                          .id
                      }
                      type="button"
                      onClick={() =>
                        onSelectInstitution(
                          offering
                            .university
                            .id,
                        )
                      }
                      className={`relative flex min-h-[190px] flex-col rounded-2xl border p-5 text-left transition ${
                        selected
                          ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100"
                          : "border-slate-200 bg-white hover:border-violet-200 hover:shadow-md"
                      }`}
                    >
                      {selected && (
                        <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}


                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <Building2 className="h-5 w-5" />
                      </div>


                      <h3 className="mt-5 text-lg font-semibold text-slate-950">
                        {
                          offering
                            .university
                            .code
                        }
                      </h3>


                      <p className="mt-1 pr-6 text-sm leading-6 text-slate-500">
                        {
                          offering
                            .university
                            .name
                        }
                      </p>


                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                        <MapPin className="h-3.5 w-3.5" />


                        {
                          offering
                            .university
                            .location ||
                          "Ghana"
                        }
                      </div>


                      {/* =================================
                          INSTITUTION-SPECIFIC PRICE
                      ================================= */}

                      <div className="mt-auto pt-5">
                        <div className="border-t border-slate-100 pt-4">
                          <ServicePricingLabel
                            service={
                              offering.service
                            }
                          />


                          {offering
                            .service
                            .pricing
                            ?.displayNote && (
                            <p className="mt-1 text-xs leading-5 text-slate-400">
                              {
                                offering
                                  .service
                                  .pricing
                                  .displayNote
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                },
              )}
          </div>
        </div>
      )}
    </>
  );
}


// =========================================================
// DETAILS STEP
// =========================================================

function DetailsStep({
  draft,
  dynamicFields,
  selectedService,
  updateApplicant,
  updateResponse,
}: {
  draft:
    RequestDraft;

  dynamicFields:
    RequestCatalogField[];

  selectedService?:
    RequestCatalogService;

  updateApplicant:
    (
      key:
        keyof RequestDraft["applicant"],

      value:
        string,
    ) => void;

  updateResponse:
    (
      key:
        string,

      value:
        string,
    ) => void;
}) {
  const isGeneralService =
    selectedService
      ?.serviceScope ===
    "general";


  return (
    <>
      <StepHeading
        eyebrow={
          isGeneralService
            ? "Customer Information"
            : "Applicant Information"
        }
        title={
          isGeneralService
            ? "Tell us about yourself."
            : "Tell us about the applicant."
        }
        description={
          isGeneralService
            ? `Provide your contact details and the information we need to handle ${
                selectedService
                  ?.shortName ||
                "your request"
              }.`
            : `Enter the information carefully. ${
                selectedService
                  ? `These details will be used for ${selectedService.shortName}.`
                  : ""
              }`
        }
      />


      <div className="mt-8">
        <SectionHeading
          title="Personal Details"
        />


        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormInput
            label="First Name"
            required
            value={
              draft
                .applicant
                .firstName
            }
            onChange={(
              value,
            ) =>
              updateApplicant(
                "firstName",
                value,
              )
            }
          />


          <FormInput
            label="Other Names"
            value={
              draft
                .applicant
                .otherNames
            }
            onChange={(
              value,
            ) =>
              updateApplicant(
                "otherNames",
                value,
              )
            }
          />


          <FormInput
            label="Surname"
            required
            value={
              draft
                .applicant
                .surname
            }
            onChange={(
              value,
            ) =>
              updateApplicant(
                "surname",
                value,
              )
            }
          />


          <div className="space-y-2">
            <Label>
              Gender

              <span className="ml-1 text-red-500">
                *
              </span>
            </Label>


            <select
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/50"
              value={
                draft
                  .applicant
                  .gender
              }
              onChange={(
                event,
              ) =>
                updateApplicant(
                  "gender",
                  event.target.value,
                )
              }
            >
              <option value="">
                Select gender
              </option>

              <option value="Male">
                Male
              </option>

              <option value="Female">
                Female
              </option>
            </select>
          </div>


          <FormInput
            label="Active Mobile Number"
            required
            type="tel"
            value={
              draft
                .applicant
                .phone
            }
            onChange={(
              value,
            ) =>
              updateApplicant(
                "phone",
                value,
              )
            }
          />


          <FormInput
            label="Email Address"
            required
            type="email"
            value={
              draft
                .applicant
                .email
            }
            onChange={(
              value,
            ) =>
              updateApplicant(
                "email",
                value,
              )
            }
          />
        </div>


        <div className="my-8 border-t border-slate-200" />


        <SectionHeading
          title={
            isGeneralService
              ? "Service Details"
              : "Academic Information"
          }
        />


        {dynamicFields.length ===
        0 ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
            This service does not require any additional information.
          </div>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {dynamicFields.map(
              (
                field,
              ) => (
                <DynamicField
                  key={
                    field.id
                  }
                  field={
                    field
                  }
                  value={
                    draft.responses[
                      field.key
                    ] ??
                    ""
                  }
                  onChange={(
                    value,
                  ) =>
                    updateResponse(
                      field.key,
                      value,
                    )
                  }
                />
              ),
            )}
          </div>
        )}


        {selectedService
          ?.formType ===
          "ucc-college" && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <strong>
              Important:
            </strong>{" "}
            This form is not applicable to four-year post applicants.
            Ensure all academic information is entered correctly.
          </div>
        )}
      </div>
    </>
  );
}


// =========================================================
// DELIVERY STEP
// =========================================================

function DeliveryStep({
  draft,
  updateDelivery,
}: {
  draft:
    RequestDraft;

  updateDelivery:
    (
      key:
        keyof RequestDraft["delivery"],

      value:
        string
        | boolean,
    ) => void;
}) {
  return (
    <>
      <StepHeading
        eyebrow="Delivery"
        title="Do you need a final physical delivery?"
        description="Provide delivery information if an item, document, package or purchase should be delivered to you or another recipient."
      />


      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() =>
            updateDelivery(
              "required",
              true,
            )
          }
          className={`rounded-2xl border p-5 text-left ${
            draft
              .delivery
              .required
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
              : "border-slate-200"
          }`}
        >
          <Package className="h-5 w-5 text-blue-600" />

          <p className="mt-4 font-semibold">
            Physical Delivery
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Deliver the completed document, package, purchase or requested item to the recipient.
          </p>
        </button>


        <button
          type="button"
          onClick={() =>
            updateDelivery(
              "required",
              false,
            )
          }
          className={`rounded-2xl border p-5 text-left ${
            !draft
              .delivery
              .required
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
              : "border-slate-200"
          }`}
        >
          <FileText className="h-5 w-5 text-blue-600" />

          <p className="mt-4 font-semibold">
            No Additional Delivery
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Select this if your request does not require a final physical delivery.
          </p>
        </button>
      </div>


      {draft
        .delivery
        .required && (
        <div className="mt-8">
          <SectionHeading
            title="Delivery Information"
          />


          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FormInput
              label="Full Name"
              required
              value={
                draft
                  .delivery
                  .fullName
              }
              onChange={(
                value,
              ) =>
                updateDelivery(
                  "fullName",
                  value,
                )
              }
            />


            <FormInput
              label="House Number"
              value={
                draft
                  .delivery
                  .houseNumber
              }
              onChange={(
                value,
              ) =>
                updateDelivery(
                  "houseNumber",
                  value,
                )
              }
            />


            <FormInput
              label="Area / Town"
              required
              value={
                draft
                  .delivery
                  .areaTown
              }
              onChange={(
                value,
              ) =>
                updateDelivery(
                  "areaTown",
                  value,
                )
              }
            />


            <FormInput
              label="City / District"
              required
              value={
                draft
                  .delivery
                  .cityDistrict
              }
              onChange={(
                value,
              ) =>
                updateDelivery(
                  "cityDistrict",
                  value,
                )
              }
            />


            <FormInput
              label="Region"
              required
              value={
                draft
                  .delivery
                  .region
              }
              onChange={(
                value,
              ) =>
                updateDelivery(
                  "region",
                  value,
                )
              }
            />


            <FormInput
              label="Digital Address"
              placeholder="e.g. GA-123-4567"
              value={
                draft
                  .delivery
                  .digitalAddress
              }
              onChange={(
                value,
              ) =>
                updateDelivery(
                  "digitalAddress",
                  value,
                )
              }
            />


            <FormInput
              label="Phone Number"
              required
              type="tel"
              value={
                draft
                  .delivery
                  .phone
              }
              onChange={(
                value,
              ) =>
                updateDelivery(
                  "phone",
                  value,
                )
              }
            />


            <FormInput
              label="Email"
              type="email"
              value={
                draft
                  .delivery
                  .email
              }
              onChange={(
                value,
              ) =>
                updateDelivery(
                  "email",
                  value,
                )
              }
            />


            <FormInput
              label="Item Type"
              value={
                draft
                  .delivery
                  .itemType
              }
              onChange={(
                value,
              ) =>
                updateDelivery(
                  "itemType",
                  value,
                )
              }
            />


            <FormInput
              label="Emergency Contact"
              required
              type="tel"
              value={
                draft
                  .delivery
                  .emergencyContact
              }
              onChange={(
                value,
              ) =>
                updateDelivery(
                  "emergencyContact",
                  value,
                )
              }
            />
          </div>
        </div>
      )}
    </>
  );
}


// =========================================================
// PAYMENT STEP
// =========================================================

function PaymentStep({
  draft,
  setDraft,
  selectedService,
  paymentProof,
  onPaymentProofChange,
  paymentSettings,
  requestSettings,
}: {
  draft:
    RequestDraft;

  setDraft:
    Dispatch<
      SetStateAction<RequestDraft>
    >;

  selectedService?:
    RequestCatalogService;

  paymentProof:
    File
    | null;

  onPaymentProofChange:
    (
      file:
        File
        | null,
    ) => void;

  paymentSettings:
    SystemSettings["payment"];

  requestSettings:
    SystemSettings["request"];
}) {
  const pricing =
    selectedService
      ?.pricing;


  const pricingMode =
    pricing?.mode ??
    "MANUAL_PRICE";


  const quantity =
    Number(
      draft.pricingQuantity,
    );


  const unitAmount =
    pricing?.amount ??
    null;


  const calculatedTotal =
    pricingMode ===
      "PER_UNIT" &&
    unitAmount !==
      null &&
    Number.isFinite(
      quantity,
    ) &&
    quantity >
      0
      ? unitAmount *
        quantity
      : pricingMode ===
          "FIXED"
        ? unitAmount
        : null;


  return (
    <>
      <StepHeading
        eyebrow="Payment"
        title="Confirm the amount and make payment."
        description={
          requestSettings
            .paymentInstructions
        }
      />


      {/* =============================================
          PRICE
      ============================================= */}

      <div className="mt-8 rounded-[22px] border border-blue-100 bg-blue-50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
          Amount Due
        </p>


        {pricingMode ===
        "PER_UNIT" ? (
          <>
            <p className="mt-2 text-xl font-semibold text-blue-950">
              {formatMoney(
                pricing?.currency ??
                  "GHS",
                unitAmount,
              )}{" "}
              per{" "}
              {pricing?.unitLabel ||
                "unit"}
            </p>


            <div className="mt-5 max-w-xs space-y-2">
              <Label htmlFor="pricingQuantity">
                Quantity
              </Label>


              <Input
                id="pricingQuantity"
                type="number"
                min={
                  pricing?.minimumQuantity ??
                  0.01
                }
                max={
                  pricing?.maximumQuantity ??
                  undefined
                }
                step="0.01"
                value={
                  draft.pricingQuantity
                }
                onChange={(
                  event,
                ) =>
                  setDraft(
                    (
                      current,
                    ) => ({
                      ...current,

                      pricingQuantity:
                        event.target
                          .value,
                    }),
                  )
                }
                placeholder="Enter quantity"
              />


              {(pricing?.minimumQuantity !==
                null ||
                pricing?.maximumQuantity !==
                  null) && (
                <p className="text-xs text-blue-700">
                  {pricing &&
  (
    pricing.minimumQuantity !==
      null ||
    pricing.maximumQuantity !==
      null
  ) && (
    <p className="text-xs text-blue-700">
      {pricing.minimumQuantity !==
        null &&
        `Minimum: ${pricing.minimumQuantity}`}

      {pricing.minimumQuantity !==
        null &&
        pricing.maximumQuantity !==
          null &&
        " · "}

      {pricing.maximumQuantity !==
        null &&
        `Maximum: ${pricing.maximumQuantity}`}
    </p>
  )}
                </p>
              )}
            </div>


            <div className="mt-5 border-t border-blue-200 pt-4">
              <p className="text-sm text-blue-700">
                Calculated Total
              </p>

              <p className="mt-1 text-3xl font-semibold tracking-tight text-blue-950">
                {
                  formatMoney(
                    pricing?.currency ??
                      "GHS",
                    calculatedTotal,
                  )
                }
              </p>
            </div>
          </>
        ) : (
          <p className="mt-2 text-3xl font-semibold tracking-tight text-blue-950">
            {
              formatMoney(
                pricing?.currency ??
                  "GHS",
                calculatedTotal,
              )
            }
          </p>
        )}


        {pricing?.displayNote && (
          <p className="mt-3 text-sm leading-6 text-blue-800">
            {
              pricing.displayNote
            }
          </p>
        )}


        <p className="mt-4 text-xs leading-5 text-blue-700">
          Pay in the currency shown above. The system does not
          automatically convert between Ghana cedis and US dollars.
        </p>
      </div>


      {/* =============================================
          PAYMENT METHOD
      ============================================= */}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() =>
            setDraft(
              (
                current,
              ) => ({
                ...current,

                paymentMethod:
                  "momo",
              }),
            )
          }
          className={`rounded-2xl border p-5 text-left transition ${
            draft.paymentMethod ===
            "momo"
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
              : "border-slate-200 hover:border-blue-200"
          }`}
        >
          <CreditCard className="h-5 w-5 text-blue-600" />


          <h3 className="mt-4 font-semibold">
            Mobile Money
          </h3>


          <p className="mt-3 text-sm text-slate-500">
            Number
          </p>

          <p className="mt-1 font-semibold">
            {
              paymentSettings
                .momoNumber
            }
          </p>


          <p className="mt-3 text-sm text-slate-500">
            Account Name
          </p>

          <p className="mt-1 font-semibold">
            {
              paymentSettings
                .momoAccountName
            }
          </p>
        </button>


        <button
          type="button"
          onClick={() =>
            setDraft(
              (
                current,
              ) => ({
                ...current,

                paymentMethod:
                  "bank",
              }),
            )
          }
          className={`rounded-2xl border p-5 text-left transition ${
            draft.paymentMethod ===
            "bank"
              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
              : "border-slate-200 hover:border-blue-200"
          }`}
        >
          <Building2 className="h-5 w-5 text-blue-600" />


          <h3 className="mt-4 font-semibold">
            {
              paymentSettings
                .bankName
            }
          </h3>


          <p className="mt-3 text-sm text-slate-500">
            Account Number
          </p>

          <p className="mt-1 break-all font-semibold">
            {
              paymentSettings
                .bankAccountNumber
            }
          </p>


          <p className="mt-3 text-sm text-slate-500">
            Account Name
          </p>

          <p className="mt-1 font-semibold">
            {
              paymentSettings
                .bankAccountName
            }
          </p>
        </button>
      </div>


      {/* =============================================
          PROOF
      ============================================= */}

      <div className="mt-7">
        <Label>
          Proof of Payment

          <span className="ml-1 text-red-500">
            *
          </span>
        </Label>


        <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50/50">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <Upload className="h-5 w-5" />
          </div>


          {paymentProof ? (
            <>
              <p className="mt-4 break-all text-sm font-semibold text-slate-900">
                {
                  paymentProof.name
                }
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {(
                  paymentProof.size /
                  1024 /
                  1024
                ).toFixed(
                  2,
                )}{" "}
                MB
              </p>

              <p className="mt-3 text-xs font-medium text-blue-600">
                Click to replace
              </p>
            </>
          ) : (
            <>
              <p className="mt-4 text-sm font-semibold text-slate-900">
                Upload payment screenshot
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                JPG, PNG, WEBP or PDF · Maximum 5 MB
              </p>
            </>
          )}


          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={(
              event,
            ) => {
              const file =
                event.target
                  .files?.[0] ??
                null;


              onPaymentProofChange(
                file,
              );
            }}
          />
        </label>
      </div>


      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-950">
          Important
        </p>

        <p className="mt-1 text-sm leading-6 text-amber-800">
          {
            requestSettings
              .paymentProofNotice
          }
        </p>
      </div>
    </>
  );
}


// =========================================================
// REVIEW
// =========================================================

function ReviewStep({
  draft,
  categoryName,
  universityName,
  selectedService,
  dynamicFields,
}: {
  draft:
    RequestDraft;

  categoryName?:
    string;

  universityName?:
    string;

  selectedService?:
    RequestCatalogService;

  dynamicFields:
    RequestCatalogField[];
}) {
  const isGeneralService =
    selectedService
      ?.serviceScope ===
    "general";

      const pricingMode =
    selectedService
      ?.pricing
      ?.mode ??
    "MANUAL_PRICE";


  const paymentRequiredNow =
    pricingMode ===
      "FIXED" ||
    pricingMode ===
      "PER_UNIT";


  const pricingRows =
    buildPricingReviewRows(
      selectedService,
      draft,
    );


  const requestRows:
    [string, string][] =
  [
    [
      "Category",
      categoryName ??
        "—",
    ],

    [
      "Service",
      selectedService
        ?.name ??
        "—",
    ],
  ];


  if (
    !isGeneralService
  ) {
    requestRows.push([
      "Institution",
      universityName ??
        "—",
    ]);
  }


  return (
    <>
      <StepHeading
        eyebrow="Review"
        title="Review your request before submitting."
        description="Please confirm that every detail is correct before submitting your request."
      />


      <div className="mt-8 space-y-5">
        <ReviewCard
          title="Request"
          rows={
            requestRows
          }
        />

        <ReviewCard
  title="Pricing"
  rows={
    pricingRows
  }
/>


        <ReviewCard
          title={
            isGeneralService
              ? "Customer"
              : "Applicant"
          }
          rows={[
            [
              "Name",

              [
                draft
                  .applicant
                  .firstName,

                draft
                  .applicant
                  .otherNames,

                draft
                  .applicant
                  .surname,
              ]
                .filter(
                  Boolean,
                )
                .join(
                  " ",
                ),
            ],

            [
              "Gender",
              draft
                .applicant
                .gender,
            ],

            [
              "Phone",
              draft
                .applicant
                .phone,
            ],

            [
              "Email",
              draft
                .applicant
                .email,
            ],
          ]}
        />


        <ReviewCard
          title={
            isGeneralService
              ? "Service Details"
              : "Academic Information"
          }
          rows={
            dynamicFields.map(
              (
                field,
              ) => [
                field.label,

                draft.responses[
                  field.key
                ] ||
                  "—",
              ],
            )
          }
        />


        {draft
          .delivery
          .required ? (
          <ReviewCard
            title="Delivery"
            rows={[
              [
                "Recipient",
                draft
                  .delivery
                  .fullName,
              ],

              [
                "House Number",
                draft
                  .delivery
                  .houseNumber ||
                  "—",
              ],

              [
                "Area / Town",
                draft
                  .delivery
                  .areaTown,
              ],

              [
                "City / District",
                draft
                  .delivery
                  .cityDistrict,
              ],

              [
                "Region",
                draft
                  .delivery
                  .region,
              ],

              [
                "Digital Address",
                draft
                  .delivery
                  .digitalAddress ||
                  "—",
              ],

              [
                "Phone",
                draft
                  .delivery
                  .phone,
              ],

              [
                "Email",
                draft
                  .delivery
                  .email ||
                  "—",
              ],

              [
                "Item Type",
                draft
                  .delivery
                  .itemType ||
                  "—",
              ],

              [
                "Emergency Contact",
                draft
                  .delivery
                  .emergencyContact,
              ],
            ]}
          />
        ) : (
          <ReviewCard
            title="Delivery"
            rows={[
              [
                "Physical Delivery",
                "Not requested",
              ],
            ]}
          />
        )}



        <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

          <div>
            <p className="text-sm font-semibold text-emerald-950">
              Ready for submission
            </p>

<p className="mt-1 text-sm leading-6 text-emerald-800">
  {paymentRequiredNow
    ? "Your information and payment proof are ready. Please confirm that all details are correct before submitting."
    : pricingMode ===
        "FREE"
      ? "No service payment is required. Please confirm your details before submitting."
      : "No payment is required at this stage. Submit your request and our team will confirm the final amount before payment."}
</p>
          </div>
        </div>
      </div>
    </>
  );
}


// =========================================================
// STEP HEADING
// =========================================================

function StepHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow:
    string;

  title:
    string;

  description:
    string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
        {
          eyebrow
        }
      </p>


      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
        {
          title
        }
      </h1>


      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
        {
          description
        }
      </p>
    </div>
  );
}


// =========================================================
// SECTION HEADING
// =========================================================

function SectionHeading({
  title,
}: {
  title:
    string;
}) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
      {
        title
      }
    </h2>
  );
}


// =========================================================
// STANDARD INPUT
// =========================================================

function FormInput({
  label,
  required,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label:
    string;

  required?:
    boolean;

  type?:
    string;

  placeholder?:
    string;

  value:
    string;

  onChange:
    (
      value:
        string,
    ) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {
          label
        }

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </Label>


      <Input
        type={
          type
        }
        placeholder={
          placeholder
        }
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
      />
    </div>
  );
}


// =========================================================
// DYNAMIC FIELD
// =========================================================

function DynamicField({
  field,
  value,
  onChange,
}: {
  field:
    RequestCatalogField;

  value:
    string;

  onChange:
    (
      value:
        string,
    ) => void;
}) {
  const fullWidth =
    field.type ===
    "textarea";


  return (
    <div
      className={`space-y-2 ${
        fullWidth
          ? "sm:col-span-2"
          : ""
      }`}
    >
      <Label>
        {
          field.label
        }

        {field.required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </Label>


      {field.type ===
      "textarea" ? (
        <Textarea
          value={
            value
          }
          placeholder={
            field.placeholder ??
            undefined
          }
          onChange={(
            event,
          ) =>
            onChange(
              event.target.value,
            )
          }
          className="min-h-28"
        />
      ) : field.type ===
        "select" ? (
        <select
          value={
            value
          }
          onChange={(
            event,
          ) =>
            onChange(
              event.target.value,
            )
          }
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/50"
        >
          <option value="">
            Select option
          </option>


          {field.options.map(
            (
              option,
            ) => (
              <option
                key={
                  option
                }
                value={
                  option
                }
              >
                {
                  option
                }
              </option>
            ),
          )}
        </select>
      ) : (
        <Input
          type={
            field.type
          }
          value={
            value
          }
          placeholder={
            field.placeholder ??
            undefined
          }
          onChange={(
            event,
          ) =>
            onChange(
              event.target.value,
            )
          }
        />
      )}
    </div>
  );
}


// =========================================================
// REVIEW CARD
// =========================================================

function ReviewCard({
  title,
  rows,
}: {
  title:
    string;

  rows:
    [string, string][];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <h2 className="font-semibold">
        {
          title
        }
      </h2>


      {rows.length ===
      0 ? (
        <p className="mt-4 text-sm text-slate-500">
          No additional information was provided.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-slate-100">
          {rows.map(
            ([
              label,
              value,
            ]) => (
              <div
                key={
                  label
                }
                className="grid gap-1 py-3 text-sm sm:grid-cols-[190px_1fr]"
              >
                <span className="text-slate-500">
                  {
                    label
                  }
                </span>

                <span className="break-words font-medium text-slate-800">
                  {
                    value ||
                    "—"
                  }
                </span>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

// =========================================================
// PRICING HELPERS
// =========================================================

function formatMoney(
  currency:
    string,

  amount:
    number
    | null
    | undefined,
) {
  if (
    amount ===
      null ||
    amount ===
      undefined ||
    !Number.isFinite(
      amount,
    )
  ) {
    return `${currency} —`;
  }


  return `${currency} ${amount.toFixed(
    2,
  )}`;
}


function ServicePricingLabel({
  service,
}: {
  service:
    RequestCatalogService;
}) {
  const pricing =
    service.pricing;


  if (
    !pricing
  ) {
    return (
      <p className="text-xs font-semibold text-slate-500">
        Price confirmed after review
      </p>
    );
  }


  switch (
    pricing.mode
  ) {
    case "FIXED":
      return (
        <p className="text-sm font-semibold text-blue-700">
          {
            formatMoney(
              pricing.currency,
              pricing.amount,
            )
          }
        </p>
      );


    case "PER_UNIT":
      return (
        <p className="text-sm font-semibold text-blue-700">
          {
            formatMoney(
              pricing.currency,
              pricing.amount,
            )
          }{" "}
          per{" "}
          {
            pricing.unitLabel ||
            "unit"
          }
        </p>
      );


    case "STARTING_FROM":
      return (
        <p className="text-sm font-semibold text-blue-700">
          From{" "}
          {
            formatMoney(
              pricing.currency,
              pricing.amount,
            )
          }
        </p>
      );


    case "FREE":
      return (
        <p className="text-sm font-semibold text-emerald-700">
          Free
        </p>
      );


    case "QUOTE_REQUIRED":
      return (
        <p className="text-sm font-semibold text-amber-700">
          Quote required
        </p>
      );


    case "MANUAL_PRICE":
    default:
      return (
        <p className="text-sm font-semibold text-slate-500">
          Price confirmed after review
        </p>
      );
  }
}


function buildPricingReviewRows(
  service:
    RequestCatalogService
    | undefined,

  draft:
    RequestDraft,
):
  [string, string][] {
  const pricing =
    service?.pricing;


  if (
    !pricing
  ) {
    return [
      [
        "Pricing",
        "Price confirmed after review",
      ],

      [
        "Payment",
        "Not required yet",
      ],
    ];
  }


  if (
    pricing.mode ===
    "FREE"
  ) {
    return [
      [
        "Price",
        "Free",
      ],

      [
        "Payment",
        "Not required",
      ],
    ];
  }


  if (
    pricing.mode ===
    "FIXED"
  ) {
    return [
      [
        "Price",
        formatMoney(
          pricing.currency,
          pricing.amount,
        ),
      ],

      [
        "Payment Method",
        draft.paymentMethod ===
        "momo"
          ? "Mobile Money"
          : draft.paymentMethod ===
              "bank"
            ? "Bank Transfer"
            : "—",
      ],
    ];
  }


  if (
    pricing.mode ===
    "PER_UNIT"
  ) {
    const quantity =
      Number(
        draft.pricingQuantity,
      );


    const total =
      pricing.amount !==
        null &&
      Number.isFinite(
        quantity,
      ) &&
      quantity >
        0
        ? pricing.amount *
          quantity
        : null;


    return [
      [
        "Unit Price",

        `${formatMoney(
          pricing.currency,
          pricing.amount,
        )} per ${
          pricing.unitLabel ||
          "unit"
        }`,
      ],

      [
        "Quantity",
        draft.pricingQuantity ||
        "—",
      ],

      [
        "Total",
        formatMoney(
          pricing.currency,
          total,
        ),
      ],

      [
        "Payment Method",
        draft.paymentMethod ===
        "momo"
          ? "Mobile Money"
          : draft.paymentMethod ===
              "bank"
            ? "Bank Transfer"
            : "—",
      ],
    ];
  }


  if (
    pricing.mode ===
    "STARTING_FROM"
  ) {
    return [
      [
        "Starting Price",

        `From ${formatMoney(
          pricing.currency,
          pricing.amount,
        )}`,
      ],

      [
        "Payment",
        "After final price confirmation",
      ],
    ];
  }


  if (
    pricing.mode ===
    "QUOTE_REQUIRED"
  ) {
    return [
      [
        "Pricing",
        `Quote required · ${pricing.currency}`,
      ],

      [
        "Payment",
        "After quote confirmation",
      ],
    ];
  }


  return [
    [
      "Pricing",
      `Price confirmed manually · ${pricing.currency}`,
    ],

    [
      "Payment",
      "After price confirmation",
    ],
  ];
}

// =========================================================
// RECONCILE SAVED DRAFT
// =========================================================

function reconcileDraftWithCatalog(
  draft:
    RequestDraft,

  catalog:
    RequestCatalog,
):
  RequestDraft {
  // =======================================================
  // CATEGORY
  // =======================================================

  const category =
    catalog.categories.find(
      (
        item,
      ) =>
        item.id ===
        draft.categoryId,
    );


  // =======================================================
  // INVALID / REMOVED CATEGORY
  // =======================================================

  if (
    !category
  ) {
    /*
     * A completely untouched draft can remain as-is.
     */
    if (
      !draft.categoryId &&
      !draft.serviceId
    ) {
      return draft;
    }


    /*
     * Otherwise clear everything that depends on the old
     * category/service selection.
     */
    return {
      ...draft,

      categoryId:
        "",

      serviceKey:
        "",

      universityId:
        "",

      serviceId:
        "",

      pricingQuantity:
        "",

      paymentMethod:
        "",

      responses:
        {},

      delivery: {
        ...draft.delivery,

        itemType:
          "Service Request",
      },
    };
  }


  // =======================================================
  // CATEGORY SELECTED, SERVICE NOT YET SELECTED
  // =======================================================

  if (
    !draft.serviceId
  ) {
    return {
      ...draft,

      pricingQuantity:
        "",

      paymentMethod:
        "",
    };
  }


  // =======================================================
  // LOCATE CONCRETE SERVICE
  // =======================================================

  let service:
    | RequestCatalogService
    | undefined;


  // -------------------------------------------------------
  // GENERAL SERVICE
  // -------------------------------------------------------

  service =
    catalog.generalServices.find(
      (
        item,
      ) =>
        item.id ===
        draft.serviceId,
    );


  // -------------------------------------------------------
  // ACADEMIC SERVICE
  // -------------------------------------------------------

  if (
    !service
  ) {
    for (
      const university of
      catalog.universities
    ) {
      service =
        university.services.find(
          (
            item,
          ) =>
            item.id ===
            draft.serviceId,
        );


      if (
        service
      ) {
        break;
      }
    }
  }


  // =======================================================
  // SERVICE REMOVED / MOVED TO ANOTHER CATEGORY
  // =======================================================

  if (
    !service ||
    service.serviceCategoryId !==
      category.id
  ) {
    return {
      ...draft,

      serviceKey:
        "",

      universityId:
        "",

      serviceId:
        "",

      pricingQuantity:
        "",

      paymentMethod:
        "",

      responses:
        {},

      delivery: {
        ...draft.delivery,

        itemType:
          "Service Request",
      },
    };
  }


  // =======================================================
  // REMOVE RESPONSES FOR FIELDS THAT NO LONGER EXIST
  // =======================================================

  const activeFieldKeys =
    new Set(
      service.fields.map(
        (
          field,
        ) =>
          field.key,
      ),
    );


  const nextResponses =
    Object.fromEntries(
      Object.entries(
        draft.responses,
      ).filter(
        ([
          key,
        ]) =>
          activeFieldKeys.has(
            key,
          ),
      ),
    );


  // =======================================================
  // NORMALIZE SERVICE KEY
  // =======================================================

  const expectedServiceKey =
    service.serviceScope ===
    "general"
      ? `general:${service.id}`
      : `academic:${service.slug}`;


  // =======================================================
  // NORMALIZE INSTITUTION
  // =======================================================

  const expectedUniversityId =
    service.serviceScope ===
    "general"
      ? ""
      : service.universityId ??
        "";


  // =======================================================
  // NORMALIZE PRICING
  //
  // If an admin changes the pricing mode while a customer
  // still has an older saved localStorage draft, stale
  // quantities/payment choices must not leak into the new
  // pricing flow.
  // =======================================================

  const currentPricingMode =
    service.pricing?.mode ??
    "MANUAL_PRICE";


  const paymentRequiredNow =
    currentPricingMode ===
      "FIXED" ||
    currentPricingMode ===
      "PER_UNIT";


  const nextPricingQuantity =
    currentPricingMode ===
    "PER_UNIT"
      ? draft.pricingQuantity
      : "";


  const nextPaymentMethod =
    paymentRequiredNow
      ? draft.paymentMethod
      : "";


  // =======================================================
  // NORMALIZE ITEM TYPE
  // =======================================================

  const nextItemType =
    service.serviceScope ===
    "academic"
      ? "Academic Document"
      : service.shortName ||
        service.name ||
        "Service Request";


  // =======================================================
  // RESULT
  // =======================================================

  return {
    ...draft,

    serviceKey:
      expectedServiceKey,

    universityId:
      expectedUniversityId,

    pricingQuantity:
      nextPricingQuantity,

    paymentMethod:
      nextPaymentMethod,

    responses:
      nextResponses,

    delivery: {
      ...draft.delivery,

      itemType:
        draft.delivery
          .itemType
          .trim()
          ? draft.delivery.itemType
          : nextItemType,
    },
  };
}