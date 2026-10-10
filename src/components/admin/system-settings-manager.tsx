"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  Building2,
  CheckCircle2,
  CreditCard,
  Headphones,
  Loader2,
  MessageSquareText,
  Plus,
  Save,
  Trash2,
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
  updateCompanyProfile,
  updatePaymentDetails,
  updateRequestNotices,
  updateSupportContacts,
} from "@/app/admin/(dashboard)/settings/actions";

import type {
  SystemSettings,
} from "@/lib/validation/system-settings";


export function SystemSettingsManager({
  initialSettings,
}: {
  initialSettings:
    SystemSettings;
}) {
  return (
    <div className="space-y-6">
      <CompanySettingsCard
        initialSettings={
          initialSettings.company
        }
      />

      <PaymentSettingsCard
        initialSettings={
          initialSettings.payment
        }
      />

      <SupportSettingsCard
        initialSettings={
          initialSettings.support
        }
      />

      <RequestNoticesCard
        initialSettings={
          initialSettings.request
        }
      />
    </div>
  );
}


// =========================================================
// COMPANY
// =========================================================

function CompanySettingsCard({
  initialSettings,
}: {
  initialSettings:
    SystemSettings["company"];
}) {
  const [
    form,
    setForm,
  ] =
    useState(
      initialSettings,
    );


  const [
    status,
    setStatus,
  ] =
    useState<{
      type:
        | "success"
        | "error";

      message:
        string;
    } | null>(
      null,
    );


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  function save() {
    setStatus(
      null,
    );


    startTransition(
      async () => {
        const result =
          await updateCompanyProfile(
            form,
          );


        setStatus(
          result.success
            ? {
                type:
                  "success",

                message:
                  "Company information saved.",
              }
            : {
                type:
                  "error",

                message:
                  result.error,
              },
        );
      },
    );
  }


  return (
    <SettingsCard
      icon={
        Building2
      }
      title="Company Information"
      description="Public identity and primary company contact details."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          label="Company Name"
          value={
            form.name
          }
          onChange={(
            value,
          ) =>
            setForm(
              (
                current,
              ) => ({
                ...current,

                name:
                  value,
              }),
            )
          }
        />


        <TextField
          label="Short Name"
          value={
            form.shortName
          }
          onChange={(
            value,
          ) =>
            setForm(
              (
                current,
              ) => ({
                ...current,

                shortName:
                  value,
              }),
            )
          }
        />


        <TextField
          label="Website"
          value={
            form.website
          }
          onChange={(
            value,
          ) =>
            setForm(
              (
                current,
              ) => ({
                ...current,

                website:
                  value,
              }),
            )
          }
        />


        <TextField
          label="Public Email"
          type="email"
          value={
            form.email
          }
          onChange={(
            value,
          ) =>
            setForm(
              (
                current,
              ) => ({
                ...current,

                email:
                  value,
              }),
            )
          }
        />


        <TextField
          label="WhatsApp Number"
          type="tel"
          value={
            form.whatsapp
          }
          onChange={(
            value,
          ) =>
            setForm(
              (
                current,
              ) => ({
                ...current,

                whatsapp:
                  value,
              }),
            )
          }
        />
      </div>


      <SaveRow
        status={
          status
        }
        pending={
          pending
        }
        onSave={
          save
        }
      />
    </SettingsCard>
  );
}


// =========================================================
// PAYMENT
// =========================================================

type PaymentCurrencyCode =
  | "GHS"
  | "USD";


function PaymentSettingsCard({
  initialSettings,
}: {
  initialSettings:
    SystemSettings["payment"];
}) {
  const [
    form,
    setForm,
  ] =
    useState(
      initialSettings,
    );


  const [
    status,
    setStatus,
  ] =
    useState<{
      type:
        | "success"
        | "error";

      message:
        string;
    } | null>(
      null,
    );


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  function updateCurrency(
    currency:
      PaymentCurrencyCode,

    value:
      SystemSettings["payment"]["currencies"][PaymentCurrencyCode],
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,

        currencies: {
          ...current.currencies,

          [currency]:
            value,
        },
      }),
    );
  }


  function save() {
    setStatus(
      null,
    );


    startTransition(
      async () => {
        const result =
          await updatePaymentDetails(
            form,
          );


        setStatus(
          result.success
            ? {
                type:
                  "success",

                message:
                  "Currency-specific payment details saved.",
              }
            : {
                type:
                  "error",

                message:
                  result.error,
              },
        );
      },
    );
  }


  return (
    <SettingsCard
      icon={
        CreditCard
      }
      title="Payment Destinations"
      description="Configure the payment accounts customers see for each service currency."
    >
      <div className="space-y-6">
        <CurrencyPaymentEditor
          currency="GHS"
          title="GHS — Ghana Cedi"
          description="Payment destinations used for services priced in Ghana cedis."
          value={
            form
              .currencies
              .GHS
          }
          onChange={(
            value,
          ) =>
            updateCurrency(
              "GHS",
              value,
            )
          }
        />


        <CurrencyPaymentEditor
          currency="USD"
          title="USD — US Dollar"
          description="Only enable a destination if that account can actually receive US-dollar payments."
          value={
            form
              .currencies
              .USD
          }
          onChange={(
            value,
          ) =>
            updateCurrency(
              "USD",
              value,
            )
          }
        />
      </div>


      <SaveRow
        status={
          status
        }
        pending={
          pending
        }
        onSave={
          save
        }
      />
    </SettingsCard>
  );
}


// =========================================================
// CURRENCY PAYMENT EDITOR
// =========================================================

function CurrencyPaymentEditor({
  currency,
  title,
  description,
  value,
  onChange,
}: {
  currency:
    PaymentCurrencyCode;

  title:
    string;

  description:
    string;

  value:
    SystemSettings["payment"]["currencies"][PaymentCurrencyCode];

  onChange:
    (
      value:
        SystemSettings["payment"]["currencies"][PaymentCurrencyCode],
    ) => void;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50/60 p-5">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-slate-950">
            {
              title
            }
          </p>


          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            {
              description
            }
          </p>
        </div>


        <span className="inline-flex self-start rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          {
            currency
          }
        </span>
      </div>


      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* =============================================
            MOBILE MONEY
        ============================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <label className="flex cursor-pointer items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900">
                Mobile Money
              </p>


              <p className="mt-1 text-xs leading-5 text-slate-500">
                Show Mobile Money as a payment option for{" "}
                {
                  currency
                }{" "}
                services.
              </p>
            </div>


            <input
              type="checkbox"
              checked={
                value
                  .momo
                  .enabled
              }
              onChange={(
                event,
              ) =>
                onChange({
                  ...value,

                  momo: {
                    ...value.momo,

                    enabled:
                      event.target
                        .checked,
                  },
                })
              }
              className="mt-1 h-4 w-4 rounded border-slate-300"
            />
          </label>


          {value
            .momo
            .enabled && (
            <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
              <TextField
                label="MoMo Number"
                type="tel"
                value={
                  value
                    .momo
                    .number
                }
                onChange={(
                  nextValue,
                ) =>
                  onChange({
                    ...value,

                    momo: {
                      ...value.momo,

                      number:
                        nextValue,
                    },
                  })
                }
              />


              <TextField
                label="Account Name"
                value={
                  value
                    .momo
                    .accountName
                }
                onChange={(
                  nextValue,
                ) =>
                  onChange({
                    ...value,

                    momo: {
                      ...value.momo,

                      accountName:
                        nextValue,
                    },
                  })
                }
              />
            </div>
          )}
        </div>


        {/* =============================================
            BANK
        ============================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <label className="flex cursor-pointer items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900">
                Bank Transfer
              </p>


              <p className="mt-1 text-xs leading-5 text-slate-500">
                Show bank transfer as a payment option for{" "}
                {
                  currency
                }{" "}
                services.
              </p>
            </div>


            <input
              type="checkbox"
              checked={
                value
                  .bank
                  .enabled
              }
              onChange={(
                event,
              ) =>
                onChange({
                  ...value,

                  bank: {
                    ...value.bank,

                    enabled:
                      event.target
                        .checked,
                  },
                })
              }
              className="mt-1 h-4 w-4 rounded border-slate-300"
            />
          </label>


          {value
            .bank
            .enabled && (
            <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
              <TextField
                label="Bank Name"
                value={
                  value
                    .bank
                    .bankName
                }
                onChange={(
                  nextValue,
                ) =>
                  onChange({
                    ...value,

                    bank: {
                      ...value.bank,

                      bankName:
                        nextValue,
                    },
                  })
                }
              />


              <TextField
                label="Account Number"
                value={
                  value
                    .bank
                    .accountNumber
                }
                onChange={(
                  nextValue,
                ) =>
                  onChange({
                    ...value,

                    bank: {
                      ...value.bank,

                      accountNumber:
                        nextValue,
                    },
                  })
                }
              />


              <TextField
                label="Account Name"
                value={
                  value
                    .bank
                    .accountName
                }
                onChange={(
                  nextValue,
                ) =>
                  onChange({
                    ...value,

                    bank: {
                      ...value.bank,

                      accountName:
                        nextValue,
                    },
                  })
                }
              />


              <TextField
                label="Branch"
                value={
                  value
                    .bank
                    .branch
                }
                onChange={(
                  nextValue,
                ) =>
                  onChange({
                    ...value,

                    bank: {
                      ...value.bank,

                      branch:
                        nextValue,
                    },
                  })
                }
              />


              <TextField
                label="SWIFT / BIC"
                value={
                  value
                    .bank
                    .swiftBic
                }
                onChange={(
                  nextValue,
                ) =>
                  onChange({
                    ...value,

                    bank: {
                      ...value.bank,

                      swiftBic:
                        nextValue,
                    },
                  })
                }
              />


              <TextareaField
                label="Additional Transfer Instructions"
                value={
                  value
                    .bank
                    .instructions
                }
                onChange={(
                  nextValue,
                ) =>
                  onChange({
                    ...value,

                    bank: {
                      ...value.bank,

                      instructions:
                        nextValue,
                    },
                  })
                }
              />
            </div>
          )}
        </div>
      </div>


      {!value.momo.enabled &&
        !value.bank.enabled && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
          No payment destination is currently enabled for{" "}
          <strong>
            {
              currency
            }
          </strong>
          . Customers will not be able to submit immediate payments
          for services using this currency until at least one
          destination is configured.
        </div>
      )}
    </div>
  );
}


// =========================================================
// SUPPORT
// =========================================================

function SupportSettingsCard({
  initialSettings,
}: {
  initialSettings:
    SystemSettings["support"];
}) {
  const [
    form,
    setForm,
  ] =
    useState(
      initialSettings,
    );


  const [
    status,
    setStatus,
  ] =
    useState<{
      type:
        | "success"
        | "error";

      message:
        string;
    } | null>(
      null,
    );


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  function updatePhone(
    index:
      number,

    value:
      string,
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,

        phones:
          current.phones.map(
            (
              phone,
              phoneIndex,
            ) =>
              phoneIndex ===
              index
                ? value
                : phone,
          ),
      }),
    );
  }


  function addPhone() {
    if (
      form.phones.length >=
      5
    ) {
      return;
    }


    setForm(
      (
        current,
      ) => ({
        ...current,

        phones: [
          ...current.phones,
          "",
        ],
      }),
    );
  }


  function removePhone(
    index:
      number,
  ) {
    if (
      form.phones.length <=
      1
    ) {
      return;
    }


    setForm(
      (
        current,
      ) => ({
        ...current,

        phones:
          current.phones.filter(
            (
              _phone,
              phoneIndex,
            ) =>
              phoneIndex !==
              index,
          ),
      }),
    );
  }


  function save() {
    setStatus(
      null,
    );


    startTransition(
      async () => {
        const cleaned = {
          ...form,

          phones:
            form.phones
              .map(
                (
                  phone,
                ) =>
                  phone.trim(),
              )
              .filter(
                Boolean,
              ),
        };


        const result =
          await updateSupportContacts(
            cleaned,
          );


        if (
          result.success
        ) {
          setForm(
            cleaned,
          );
        }


        setStatus(
          result.success
            ? {
                type:
                  "success",

                message:
                  "Support contacts saved.",
              }
            : {
                type:
                  "error",

                message:
                  result.error,
              },
        );
      },
    );
  }


  return (
    <SettingsCard
      icon={
        Headphones
      }
      title="Customer Support"
      description="Manage the contact information customers use when they need assistance."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <Label>
              Support Phone Numbers
            </Label>

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={
                form.phones.length >=
                5
              }
              onClick={
                addPhone
              }
              className="rounded-xl"
            >
              <Plus className="mr-2 h-4 w-4" />

              Add Number
            </Button>
          </div>


          <div className="mt-3 space-y-3">
            {form.phones.map(
              (
                phone,
                index,
              ) => (
                <div
                  key={
                    index
                  }
                  className="flex gap-2"
                >
                  <Input
                    type="tel"
                    value={
                      phone
                    }
                    onChange={(
                      event,
                    ) =>
                      updatePhone(
                        index,
                        event.target.value,
                      )
                    }
                  />


                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={
                      form.phones.length <=
                      1
                    }
                    onClick={() =>
                      removePhone(
                        index,
                      )
                    }
                    className="shrink-0 rounded-xl text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ),
            )}
          </div>
        </div>


        <TextField
          label="Support Email"
          type="email"
          value={
            form.supportEmail
          }
          onChange={(
            value,
          ) =>
            setForm(
              (
                current,
              ) => ({
                ...current,

                supportEmail:
                  value,
              }),
            )
          }
        />
      </div>


      <SaveRow
        status={
          status
        }
        pending={
          pending
        }
        onSave={
          save
        }
      />
    </SettingsCard>
  );
}


// =========================================================
// REQUEST NOTICES
// =========================================================

function RequestNoticesCard({
  initialSettings,
}: {
  initialSettings:
    SystemSettings["request"];
}) {
  const [
    form,
    setForm,
  ] =
    useState(
      initialSettings,
    );


  const [
    status,
    setStatus,
  ] =
    useState<{
      type:
        | "success"
        | "error";

      message:
        string;
    } | null>(
      null,
    );


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  function save() {
    setStatus(
      null,
    );


    startTransition(
      async () => {
        const result =
          await updateRequestNotices(
            form,
          );


        setStatus(
          result.success
            ? {
                type:
                  "success",

                message:
                  "Request notices saved.",
              }
            : {
                type:
                  "error",

                message:
                  result.error,
              },
        );
      },
    );
  }


  return (
    <SettingsCard
      icon={
        MessageSquareText
      }
      title="Request Workflow Notices"
      description="Customer-facing guidance used throughout request submission and tracking."
    >
      <div className="grid gap-5">
        <TextareaField
          label="General Request Notice"
          value={
            form.requestNotice
          }
          onChange={(
            value,
          ) =>
            setForm(
              (
                current,
              ) => ({
                ...current,

                requestNotice:
                  value,
              }),
            )
          }
        />


        <TextareaField
          label="Payment Instructions"
          value={
            form.paymentInstructions
          }
          onChange={(
            value,
          ) =>
            setForm(
              (
                current,
              ) => ({
                ...current,

                paymentInstructions:
                  value,
              }),
            )
          }
        />


        <TextareaField
          label="Payment Proof Notice"
          value={
            form.paymentProofNotice
          }
          onChange={(
            value,
          ) =>
            setForm(
              (
                current,
              ) => ({
                ...current,

                paymentProofNotice:
                  value,
              }),
            )
          }
        />


        <TextareaField
          label="Tracking Notice"
          value={
            form.trackingNotice
          }
          onChange={(
            value,
          ) =>
            setForm(
              (
                current,
              ) => ({
                ...current,

                trackingNotice:
                  value,
              }),
            )
          }
        />
      </div>


      <SaveRow
        status={
          status
        }
        pending={
          pending
        }
        onSave={
          save
        }
      />
    </SettingsCard>
  );
}


// =========================================================
// COMMON CARD
// =========================================================

function SettingsCard({
  icon:
    Icon,

  title,

  description,

  children,
}: {
  icon:
    React.ElementType;

  title:
    string;

  description:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-950">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>


      <div className="pt-6">
        {children}
      </div>
    </section>
  );
}


// =========================================================
// SAVE ROW
// =========================================================

function SaveRow({
  status,

  pending,

  onSave,
}: {
  status: {
    type:
      | "success"
      | "error";

    message:
      string;
  } | null;

  pending:
    boolean;

  onSave:
    () => void;
}) {
  return (
    <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {status && (
          <div
            className={`flex items-center gap-2 text-sm ${
              status.type ===
              "success"
                ? "text-emerald-700"
                : "text-red-700"
            }`}
          >
            {status.type ===
              "success" && (
              <CheckCircle2 className="h-4 w-4" />
            )}

            {
              status.message
            }
          </div>
        )}
      </div>


      <Button
        type="button"
        disabled={
          pending
        }
        onClick={
          onSave
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
  );
}


// =========================================================
// INPUTS
// =========================================================

function TextField({
  label,

  value,

  onChange,

  type = "text",
}: {
  label:
    string;

  value:
    string;

  onChange:
    (
      value:
        string,
    ) => void;

  type?:
    string;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
      </Label>

      <Input
        type={
          type
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


function TextareaField({
  label,

  value,

  onChange,
}: {
  label:
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
        {label}
      </Label>

      <Textarea
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
        className="min-h-28"
      />
    </div>
  );
}