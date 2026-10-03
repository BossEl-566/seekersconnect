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
  ShieldCheck,
  Upload,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { SystemSettings } from "@/lib/validation/system-settings";

import type { RequestDraft } from "@/types/request";

import type {
  RequestCatalog,
  RequestCatalogField,
  RequestCatalogService,
  RequestCatalogUniversity,
} from "@/types/request-catalog";

import {
  UniversityLogo,
} from "@/components/public/university-logo";


const STORAGE_KEY =
  "seekers-connect-request-draft";


const steps = [
  {
  number: 1,
  label: "Service Area",
  icon: Package,
},

  {
    number: 2,
    label: "Service",
    icon: FileText,
  },

  {
    number: 3,
    label: "Details",
    icon: UserRound,
  },

  {
    number: 4,
    label: "Delivery",
    icon: Package,
  },

  {
    number: 5,
    label: "Payment",
    icon: CreditCard,
  },

  {
    number: 6,
    label: "Review",
    icon: ShieldCheck,
  },
];


const initialDraft: RequestDraft = {
  universityId: "",
  serviceId: "",

  applicant: {
    firstName: "",
    otherNames: "",
    surname: "",
    gender: "",
    phone: "",
    email: "",
  },

  responses: {},

  delivery: {
    required: true,

    fullName: "",
    houseNumber: "",
    areaTown: "",
    cityDistrict: "",
    region: "",
    digitalAddress: "",

    phone: "",
    email: "",

    itemType: "Academic Document",

    emergencyContact: "",
  },

  paymentMethod: "",

  notes: "",
};


type CatalogApiResponse = {
  success?: boolean;

  catalog?: RequestCatalog;

  message?: string;
};


type PublicSettingsApiResponse = {
  success?: boolean;

  settings?: SystemSettings;

  message?: string;
};


// =========================================================
// MAIN REQUEST WIZARD
// =========================================================

export function RequestWizard() {
  const [
    currentStep,
    setCurrentStep,
  ] =
    useState(1);


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
    useState(false);


  // =======================================================
  // REQUEST CATALOG STATE
  // =======================================================

  const [
    catalog,
    setCatalog,
  ] =
    useState<RequestCatalog | null>(
      null,
    );


  const [
    catalogLoading,
    setCatalogLoading,
  ] =
    useState(true);


  const [
    catalogError,
    setCatalogError,
  ] =
    useState("");


  const [
    catalogReloadKey,
    setCatalogReloadKey,
  ] =
    useState(0);


  // =======================================================
  // PUBLIC SETTINGS STATE
  // =======================================================

  const [
    publicSettings,
    setPublicSettings,
  ] =
    useState<SystemSettings | null>(
      null,
    );


  const [
    settingsLoading,
    setSettingsLoading,
  ] =
    useState(true);


  const [
    settingsError,
    setSettingsError,
  ] =
    useState("");


  const [
    settingsReloadKey,
    setSettingsReloadKey,
  ] =
    useState(0);


  // =======================================================
  // REQUEST SUBMISSION STATE
  // =======================================================

  const [
    paymentProof,
    setPaymentProof,
  ] =
    useState<File | null>(
      null,
    );


  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);


  const [
    submitError,
    setSubmitError,
  ] =
    useState("");


  const [
    submittedRequest,
    setSubmittedRequest,
  ] =
    useState<{
      requestNumber: string;
    } | null>(
      null,
    );


  // =======================================================
  // RESTORE SAVED DRAFT
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


          // Preserve newly introduced properties when
          // restoring a draft created by an older version.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setDraft({
            ...initialDraft,
            ...parsed,

            applicant: {
              ...initialDraft.applicant,
              ...(parsed.applicant ??
                {}),
            },

            delivery: {
              ...initialDraft.delivery,
              ...(parsed.delivery ??
                {}),
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
  // LOAD DYNAMIC REQUEST CATALOG
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
            (await response.json()) as
              CatalogApiResponse;


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
            (await response.json()) as
              PublicSettingsApiResponse;


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
  // RECONCILE OLD / STALE SAVED DRAFTS
  //
  // Old localStorage drafts may contain university IDs such
  // as "ucc" while the dynamic catalog now uses UUIDs.
  //
  // It also removes responses belonging to fields that were
  // later disabled by a Super Admin.
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
  // CATALOG SELECTIONS
  // =======================================================

  const availableUniversities =
  useMemo(
    () => {
      const items =
        (
          catalog
            ?.universities ??
          []
        ).filter(
          (
            university,
          ) =>
            university
              .services
              .length >
            0,
        );


      return [
        ...items,
      ].sort(
        (
          first,
          second,
        ) => {
          if (
            first.code ===
            "SC247"
          ) {
            return -1;
          }


          if (
            second.code ===
            "SC247"
          ) {
            return 1;
          }


          return first.name.localeCompare(
            second.name,
          );
        },
      );
    },
    [
      catalog,
    ],
  );


  const selectedUniversity =
    useMemo<
      | RequestCatalogUniversity
      | undefined
    >(
      () =>
        availableUniversities.find(
          (
            university,
          ) =>
            university.id ===
            draft.universityId,
        ),
      [
        availableUniversities,
        draft.universityId,
      ],
    );


  const availableServices =
    useMemo(
      () =>
        selectedUniversity
          ?.services ??
        [],
      [
        selectedUniversity,
      ],
    );


  const selectedService =
    useMemo<
      | RequestCatalogService
      | undefined
    >(
      () =>
        availableServices.find(
          (
            service,
          ) =>
            service.id ===
            draft.serviceId,
        ),
      [
        availableServices,
        draft.serviceId,
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
  // UPDATE DYNAMIC RESPONSE
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
      | string
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
  // UNIVERSITY SELECTION
  // =======================================================

  function selectUniversity(
    universityId:
      string,
  ) {
    setDraft(
      (
        current,
      ) => ({
        ...current,

        universityId,

        serviceId:
          "",

        responses:
          {},
      }),
    );
  }


  // =======================================================
  // SERVICE SELECTION
  // =======================================================

  function selectService(
  serviceId:
    string,
) {
  const service =
    availableServices.find(
      (
        item,
      ) =>
        item.id ===
        serviceId,
    );


  const isGeneralService =
    selectedUniversity
      ?.code ===
    "SC247";


  setDraft(
    (
      current,
    ) => ({
      ...current,

      serviceId,

      responses:
        {},

      delivery: {
        ...current.delivery,

        itemType:
          isGeneralService
            ? service
                ?.shortName ||
              service?.name ||
              "Service Request"
            : "Academic Document",
      },
    }),
  );
}


  // =======================================================
  // STEP VALIDATION
  // =======================================================

  function canContinue() {
    if (
      currentStep ===
      1
    ) {
      return Boolean(
        selectedUniversity,
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
      ) =>
        Math.min(
          step + 1,
          steps.length,
        ),
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
      ) =>
        Math.max(
          step - 1,
          1,
        ),
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
      !paymentProof ||
      submitting
    ) {
      return;
    }


    if (
      !selectedUniversity ||
      !selectedService
    ) {
      setSubmitError(
        "The selected university or service is no longer available. Please start the request again.",
      );

      return;
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


      formData.append(
        "paymentProof",
        paymentProof,
      );


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
  // CLEAR SAVED REQUEST
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

    setCurrentStep(
      1,
    );


    localStorage.removeItem(
      STORAGE_KEY,
    );
  }


  // =======================================================
  // INITIAL LOADING STATE
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
  // CATALOG / SETTINGS FAILURE STATE
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
  // SUCCESS SCREEN
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
            Your payment proof is now awaiting verification by{" "}
            {
              publicSettings
                .company
                .shortName
            }.
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
              Our team will verify your payment. Once the payment has
              been confirmed, your secure tracking details will be
              generated and provided to you.
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
              {steps.map(
                (
                  step,
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
                            step.number
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


        {/* MAIN CONTENT */}

        <div>
          <MobileProgress
            currentStep={
              currentStep
            }
            totalSteps={
              steps.length
            }
          />


          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">

            {/* DATABASE CONTROLLED GENERAL REQUEST NOTICE */}

            {currentStep ===
              1 && (
              <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                {
                  publicSettings
                    .request
                    .requestNotice
                }
              </div>
            )}


            {currentStep ===
              1 && (
              <UniversityStep
                universities={
                  availableUniversities
                }
                selectedId={
                  draft.universityId
                }
                onSelect={
                  selectUniversity
                }
              />
            )}


            {currentStep ===
              2 && (
              <ServiceStep
  providerCode={
    selectedUniversity
      ?.code
  }
  universityName={
    selectedUniversity
      ?.name
  }
  services={
    availableServices
  }
  selectedId={
    draft.serviceId
  }
  onSelect={
    selectService
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
              5 && (
              <PaymentStep
                draft={
                  draft
                }
                setDraft={
                  setDraft
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
  providerCode={
    selectedUniversity
      ?.code
  }
  universityName={
    selectedUniversity
      ?.name
  }
  serviceName={
    selectedService
      ?.name
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
                    !paymentProof
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
  totalSteps,
}: {
  currentStep:
    number;

  totalSteps:
    number;
}) {
  const progress =
    (
      currentStep /
      totalSteps
    ) * 100;


  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 lg:hidden">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          Step{" "}
          {currentStep}{" "}
          of{" "}
          {totalSteps}
        </p>

        <p className="text-xs text-slate-500">
          {
            steps[
              currentStep -
                1
            ].label
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
// UNIVERSITY STEP
// =========================================================

function UniversityStep({
  universities,
  selectedId,
  onSelect,
}: {
  universities:
    RequestCatalogUniversity[];

  selectedId:
    string;

  onSelect:
    (
      id:
        string,
    ) => void;
}) {
  const generalProvider =
    universities.find(
      (
        university,
      ) =>
        university.code ===
        "SC247",
    );


  const academicUniversities =
    universities.filter(
      (
        university,
      ) =>
        university.code !==
        "SC247",
    );


  return (
    <>
      <StepHeading
        eyebrow="Service Area"
        title="What do you need help with?"
        description="Choose an errand, delivery or shopping service, or select your university for an academic document request."
      />


      {/* ================================================
          GENERAL SERVICES
      ================================================ */}

      {generalProvider && (
        <div className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
            Errands & Delivery
          </p>


          <button
            type="button"
            onClick={() =>
              onSelect(
                generalProvider.id,
              )
            }
            className={`relative w-full overflow-hidden rounded-[24px] border p-6 text-left transition ${
              selectedId ===
              generalProvider.id
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                : "border-blue-200 bg-gradient-to-br from-blue-50 via-white to-slate-50 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg"
            }`}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-100/70 blur-3xl" />


            {selectedId ===
              generalProvider.id && (
              <div className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
                <Check className="h-4 w-4" />
              </div>
            )}


            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200">
                <Package className="h-5 w-5" />
              </div>


              <h3 className="mt-5 text-xl font-semibold text-slate-950">
                Errands, Delivery & Shopping
              </h3>


              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Let Seekers Connect run errands, pick up and deliver
                items, handle document errands or shop on your behalf.
              </p>


              <div className="mt-5 flex flex-wrap gap-2">
                {generalProvider.services.map(
                  (
                    service,
                  ) => (
                    <span
                      key={
                        service.id
                      }
                      className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-medium text-blue-700"
                    >
                      {
                        service.shortName
                      }
                    </span>
                  ),
                )}
              </div>
            </div>
          </button>
        </div>
      )}


      {/* ================================================
          ACADEMIC SERVICES
      ================================================ */}

      <div className="mt-8 border-t border-slate-200 pt-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Academic Documents
          </p>

          <h3 className="mt-2 font-semibold text-slate-900">
            Request from a university
          </h3>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Select the institution that holds the academic record or
            document you need.
          </p>
        </div>


        {academicUniversities.length ===
        0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <Building2 className="mx-auto h-6 w-6 text-slate-400" />

            <p className="mt-3 text-sm text-slate-500">
              No academic institutions are currently available.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {academicUniversities.map(
              (
                university,
              ) => {
                const selected =
                  selectedId ===
                  university.id;


                return (
                  <button
                    key={
                      university.id
                    }
                    type="button"
                    onClick={() =>
                      onSelect(
                        university.id,
                      )
                    }
                    className={`relative rounded-2xl border p-5 text-left transition ${
                      selected
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-md"
                    }`}
                  >
                    {selected && (
                      <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    )}


                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Building2 className="h-5 w-5" />
                    </div>


                    <h3 className="mt-5 text-lg font-semibold text-slate-950">
                      {
                        university.code
                      }
                    </h3>


                    <p className="mt-1 pr-6 text-sm leading-6 text-slate-500">
                      {
                        university.name
                      }
                    </p>


                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />

                      {
                        university.location ||
                        "Ghana"
                      }
                    </div>
                  </button>
                );
              },
            )}
          </div>
        )}
      </div>
    </>
  );
}


// =========================================================
// SERVICE STEP
// =========================================================

function ServiceStep({
  providerCode,
  universityName,
  services,
  selectedId,
  onSelect,
}: {
  providerCode?:
    string;

  universityName?:
    string;

  services:
    RequestCatalogService[];

  selectedId:
    string;

  onSelect:
    (
      id:
        string,
    ) => void;
}) {
  const isGeneralServices =
    providerCode ===
    "SC247";


  return (
    <>
      <StepHeading
        eyebrow="Service"
        title={
          isGeneralServices
            ? "What would you like us to handle?"
            : "What academic document do you need?"
        }
        description={
          isGeneralServices
            ? "Choose the errand, delivery, document or shopping service you need."
            : `Choose the academic request you want us to process${
                universityName
                  ? ` for ${universityName}`
                  : ""
              }.`
        }
      />


      {services.length ===
      0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <FileText className="mx-auto h-7 w-7 text-slate-400" />

          <p className="mt-4 font-semibold text-slate-800">
            No active services are currently available.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {services.map(
            (
              service,
            ) => {
              const selected =
                selectedId ===
                service.id;


              return (
                <button
                  key={
                    service.id
                  }
                  type="button"
                  onClick={() =>
                    onSelect(
                      service.id,
                    )
                  }
                  className={`flex min-h-[150px] w-full flex-col rounded-[22px] border p-5 text-left transition ${
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
                      {isGeneralServices ? (
                        <Package className="h-5 w-5" />
                      ) : (
                        <FileText className="h-5 w-5" />
                      )}
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
  Boolean(
    selectedService &&
      [
        "general_errand",
        "pickup_delivery",
        "document_errand",
        "shop_for_me",
      ].includes(
        selectedService.formType,
      ),
  );
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
        | string
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

  paymentProof:
    File | null;

  onPaymentProofChange:
    (
      file:
        File | null,
    ) => void;

  paymentSettings:
    SystemSettings["payment"];

  requestSettings:
    SystemSettings["request"];
}) {
  return (
    <>
      <StepHeading
        eyebrow="Payment"
        title="Make payment and upload your proof."
        description={
          requestSettings
            .paymentInstructions
        }
      />


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
                JPG, PNG, WEBP or PDF • Maximum 5 MB
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
// REVIEW STEP
// =========================================================

function ReviewStep({
  draft,
  providerCode,
  universityName,
  serviceName,
  dynamicFields,
}: {
  draft:
    RequestDraft;

  providerCode?:
    string;

  universityName?:
    string;

  serviceName?:
    string;

  dynamicFields:
    RequestCatalogField[];
}) {
    const isGeneralService =
  providerCode ===
  "SC247";
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
  rows={[
    [
      isGeneralService
        ? "Service Area"
        : "University",

      isGeneralService
        ? "Errands, Delivery & Shopping"
        : universityName ??
          "—",
    ],

    [
      "Service",
      serviceName ??
        "—",
    ],
  ]}
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


        <ReviewCard
          title="Payment"
          rows={[
            [
              "Method",

              draft.paymentMethod ===
              "momo"
                ? "Mobile Money"
                : "Bank Transfer",
            ],
          ]}
        />


        <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

          <div>
            <p className="text-sm font-semibold text-emerald-950">
              Ready for submission
            </p>

            <p className="mt-1 text-sm leading-6 text-emerald-800">
              Your information and payment proof are ready to be
              submitted. Please confirm that all details are correct
              before continuing.
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
// STANDARD FORM INPUT
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
// DYNAMIC DATABASE FIELD
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
// RECONCILE LOCAL STORAGE WITH CURRENT CATALOG
// =========================================================

function reconcileDraftWithCatalog(
  draft:
    RequestDraft,

  catalog:
    RequestCatalog,
):
  RequestDraft {
  if (
    !draft.universityId
  ) {
    return draft;
  }


  const university =
    catalog.universities.find(
      (
        item,
      ) =>
        item.id ===
        draft.universityId,
    );


  // Old static IDs such as "ucc" arrive here, as do
  // universities disabled after a draft was saved.
  if (
    !university ||
    university.services.length ===
      0
  ) {
    return {
      ...draft,

      universityId:
        "",

      serviceId:
        "",

      responses:
        {},
    };
  }


  if (
    !draft.serviceId
  ) {
    return draft;
  }


  const service =
    university.services.find(
      (
        item,
      ) =>
        item.id ===
        draft.serviceId,
    );


  if (
    !service
  ) {
    return {
      ...draft,

      serviceId:
        "",

      responses:
        {},
    };
  }


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


  const previousKeys =
    Object.keys(
      draft.responses,
    );


  const nextKeys =
    Object.keys(
      nextResponses,
    );


  const responsesChanged =
    previousKeys.length !==
      nextKeys.length ||
    previousKeys.some(
      (
        key,
      ) =>
        !Object.hasOwn(
          nextResponses,
          key,
        ),
    );


  if (
    !responsesChanged
  ) {
    return draft;
  }


  return {
    ...draft,

    responses:
      nextResponses,
  };
}