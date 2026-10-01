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
                  "Payment details saved.",
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
      title="Payment Details"
      description="These details will eventually replace the payment information currently hardcoded in the request wizard."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-5">
          <p className="font-semibold text-slate-900">
            Mobile Money
          </p>

          <div className="mt-4 space-y-4">
            <TextField
              label="MoMo Number"
              type="tel"
              value={
                form.momoNumber
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,

                    momoNumber:
                      value,
                  }),
                )
              }
            />

            <TextField
              label="Account Name"
              value={
                form.momoAccountName
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,

                    momoAccountName:
                      value,
                  }),
                )
              }
            />
          </div>
        </div>


        <div className="rounded-2xl border border-slate-200 p-5">
          <p className="font-semibold text-slate-900">
            Bank Account
          </p>

          <div className="mt-4 space-y-4">
            <TextField
              label="Bank Name"
              value={
                form.bankName
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,

                    bankName:
                      value,
                  }),
                )
              }
            />

            <TextField
              label="Account Number"
              value={
                form.bankAccountNumber
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,

                    bankAccountNumber:
                      value,
                  }),
                )
              }
            />

            <TextField
              label="Account Name"
              value={
                form.bankAccountName
              }
              onChange={(
                value,
              ) =>
                setForm(
                  (
                    current,
                  ) => ({
                    ...current,

                    bankAccountName:
                      value,
                  }),
                )
              }
            />
          </div>
        </div>
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