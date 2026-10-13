"use client";

import {
  type Dispatch,
  type SetStateAction,
  useState,
  useTransition,
} from "react";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  CircleOff,
  FileInput,
  Info,
  Loader2,
  Pencil,
  Plus,
  Power,
  Save,
  Settings2,
  X,
} from "lucide-react";

import Link from "next/link";

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
  createServiceFormField,
  moveServiceFormField,
  setServiceFormFieldActive,
  updateServiceFormField,
} from "@/app/admin/(dashboard)/services/[id]/fields/actions";

import {
  serviceFormFieldConditionOperators,
  serviceFormFieldTypes,
  type CreateServiceFormFieldInput,
  type ServiceFormFieldConditionOperator,
  type ServiceFormFieldType,
  type UpdateServiceFormFieldInput,
} from "@/lib/validation/service-form-field";


// =========================================================
// TYPES
// =========================================================

export type FormBuilderService = {
  id:
    string;

  name:
    string;

  short_name:
    string;

  slug:
    string;

  active:
    boolean;

  universities:
    | {
        code:
          string;

        name:
          string;
      }
    | null;
};


export type ServiceFormFieldValidationRules = {
  minLength?:
    number;

  maxLength?:
    number;

  min?:
    number;

  max?:
    number;

  maxFiles?:
    number;

  maxFileSizeMb?:
    number;

  accept?:
    string[];
};


export type ServiceFormFieldItem = {
  id:
    string;

  service_id:
    string;

  field_key:
    string;

  label:
    string;

  field_type:
    ServiceFormFieldType;

  placeholder:
    string | null;

  help_text:
    string | null;

  required:
    boolean;

  options:
    string[] | null;

  allow_other:
    boolean;

  other_label:
    string | null;

  condition_field_id:
    string | null;

  condition_operator:
    ServiceFormFieldConditionOperator | null;

  condition_value:
    unknown;

  validation_rules:
    ServiceFormFieldValidationRules;

  sort_order:
    number;

  active:
    boolean;

  created_at:
    string;

  updated_at:
    string;
};


type EditorState = {
  fieldKey:
    string;

  label:
    string;

  fieldType:
    ServiceFormFieldType;

  placeholder:
    string;

  helpText:
    string;

  required:
    boolean;

  optionsText:
    string;

  allowOther:
    boolean;

  otherLabel:
    string;

  conditionFieldId:
    string;

  conditionOperator:
    ""
    | ServiceFormFieldConditionOperator;

  conditionValue:
    string;

  minLength:
    string;

  maxLength:
    string;

  min:
    string;

  max:
    string;

  maxFiles:
    string;

  maxFileSizeMb:
    string;

  acceptText:
    string;
};


// =========================================================
// CONSTANTS
// =========================================================

const optionFieldTypes =
  new Set<ServiceFormFieldType>([
    "select",
    "radio",
    "multi_select",
  ]);


const textValidationTypes =
  new Set<ServiceFormFieldType>([
    "text",
    "email",
    "tel",
    "textarea",
  ]);


const numericValidationTypes =
  new Set<ServiceFormFieldType>([
    "number",
    "currency",
  ]);


const fileFieldTypes =
  new Set<ServiceFormFieldType>([
    "file",
    "image",
    "document",
  ]);


const conditionValueOperators =
  new Set<
    ServiceFormFieldConditionOperator
  >([
    "EQUALS",
    "NOT_EQUALS",
    "IN",
    "NOT_IN",
  ]);


// =========================================================
// MAIN
// =========================================================

export function ServiceFormFieldsManager({
  service,
  fields,
}: {
  service:
    FormBuilderService;

  fields:
    ServiceFormFieldItem[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/services"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />

          Back to services
        </Link>
      </div>


      <div className="rounded-[26px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold">
                {
                  service.universities
                    ?.code ??
                  "GENERAL"
                }
              </span>

              <span className="rounded-lg bg-white/10 px-2.5 py-1 font-mono text-xs text-slate-300">
                {
                  service.slug
                }
              </span>
            </div>


            <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              {
                service.name
              }
            </h1>


            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Build the information customers must provide when
              requesting this service. Fields can include choices,
              conditional visibility, validation rules and upload
              requirements.
            </p>
          </div>


          <div className="rounded-2xl bg-white/10 px-5 py-4">
            <p className="text-xs text-slate-400">
              Form Fields
            </p>

            <p className="mt-1 text-3xl font-semibold">
              {
                fields.length
              }
            </p>
          </div>
        </div>
      </div>


      <CreateFieldCard
        serviceId={
          service.id
        }
        fields={
          fields
        }
      />


      <FieldList
        serviceId={
          service.id
        }
        fields={
          fields
        }
      />
    </div>
  );
}


// =========================================================
// CREATE
// =========================================================

function CreateFieldCard({
  serviceId,
  fields,
}: {
  serviceId:
    string;

  fields:
    ServiceFormFieldItem[];
}) {
  const [
    open,
    setOpen,
  ] =
    useState(
      false,
    );


  const [
    state,
    setState,
  ] =
    useState<EditorState>(
      emptyEditorState(),
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


  function reset() {
    setState(
      emptyEditorState(),
    );

    setError(
      "",
    );
  }


  function handleCreate() {
    setError(
      "",
    );

    setSuccess(
      "",
    );


    const input:
      CreateServiceFormFieldInput =
    {
      fieldKey:
        state.fieldKey,

      ...buildActionInput(
        state,
      ),
    };


    startTransition(
      async () => {
        const result =
          await createServiceFormField(
            serviceId,
            input,
          );


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
          "Form field added successfully.",
        );

        setOpen(
          false,
        );
      },
    );
  }


  return (
    <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="font-semibold text-slate-950">
            Advanced Form Builder
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Add any field required for this service.
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
              Add Field
            </>
          )}
        </Button>
      </div>


      {success && (
        <SuccessMessage
          message={
            success
          }
        />
      )}


      {open && (
        <div className="border-t border-slate-100 p-5 sm:p-6">
          <FieldEditor
            state={
              state
            }
            setState={
              setState
            }
            fields={
              fields
            }
            pending={
              pending
            }
            showFieldKey
          />


          {error && (
            <ErrorMessage
              message={
                error
              }
            />
          )}


          <div className="mt-6 flex justify-end">
            <Button
              type="button"
              disabled={
                pending ||
                !state.fieldKey ||
                !state.label.trim() ||
                (
                  optionFieldTypes.has(
                    state.fieldType,
                  ) &&
                  parseOptions(
                    state.optionsText,
                  ).length ===
                    0
                )
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
                  Add Field
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

function FieldList({
  serviceId,
  fields,
}: {
  serviceId:
    string;

  fields:
    ServiceFormFieldItem[];
}) {
  if (
    fields.length ===
    0
  ) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <FileInput className="mx-auto h-7 w-7 text-slate-400" />

        <h3 className="mt-4 font-semibold text-slate-900">
          No form fields yet
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Add the first field required for this service.
        </p>
      </div>
    );
  }


  return (
    <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <h2 className="font-semibold text-slate-950">
          Form Fields
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Fields are displayed to the customer in this order.
        </p>
      </div>


      <div className="divide-y divide-slate-100">
        {fields.map(
          (
            field,
            index,
          ) => (
            <FieldCard
              key={
                field.id
              }
              serviceId={
                serviceId
              }
              field={
                field
              }
              fields={
                fields
              }
              first={
                index ===
                0
              }
              last={
                index ===
                fields.length -
                  1
              }
            />
          ),
        )}
      </div>
    </div>
  );
}


// =========================================================
// FIELD CARD
// =========================================================

function FieldCard({
  serviceId,
  field,
  fields,
  first,
  last,
}: {
  serviceId:
    string;

  field:
    ServiceFormFieldItem;

  fields:
    ServiceFormFieldItem[];

  first:
    boolean;

  last:
    boolean;
}) {
  const [
    editing,
    setEditing,
  ] =
    useState(
      false,
    );


  const [
    state,
    setState,
  ] =
    useState<EditorState>(
      editorStateFromField(
        field,
      ),
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


  const conditionParent =
    fields.find(
      (
        item,
      ) =>
        item.id ===
        field.condition_field_id,
    );


  function cancelEditing() {
    setState(
      editorStateFromField(
        field,
      ),
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


    const input:
      UpdateServiceFormFieldInput =
      buildActionInput(
        state,
      );


    startTransition(
      async () => {
        const result =
          await updateServiceFormField(
            serviceId,
            field.id,
            input,
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
          await setServiceFormFieldActive(
            serviceId,
            field.id,
            !field.active,
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


  function handleMove(
    direction:
      | "UP"
      | "DOWN",
  ) {
    setError(
      "",
    );


    startTransition(
      async () => {
        const result =
          await moveServiceFormField(
            serviceId,
            field.id,
            direction,
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
      className={`p-5 sm:p-6 ${
        !field.active
          ? "bg-slate-50/60"
          : ""
      }`}
    >
      {!editing ? (
        <>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-mono text-sm font-semibold text-blue-700">
                {
                  field.sort_order
                }
              </div>


              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {
                      field.label
                    }
                  </h3>

                  <Badge>
                    {
                      field.field_key
                    }
                  </Badge>

                  <BlueBadge>
                    {
                      humanize(
                        field.field_type,
                      )
                    }
                  </BlueBadge>

                  {field.required && (
                    <AmberBadge>
                      Required
                    </AmberBadge>
                  )}

                  {field.allow_other && (
                    <BlueBadge>
                      Other enabled
                    </BlueBadge>
                  )}

                  <StatusBadge
                    active={
                      field.active
                    }
                  />
                </div>


                {field.placeholder && (
                  <p className="mt-2 text-sm text-slate-500">
                    Placeholder:{" "}
                    {
                      field.placeholder
                    }
                  </p>
                )}


                {field.help_text && (
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {
                      field.help_text
                    }
                  </p>
                )}


                {field.options &&
                  field.options.length >
                    0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {field.options.map(
                      (
                        option,
                      ) => (
                        <span
                          key={
                            option
                          }
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600"
                        >
                          {
                            option
                          }
                        </span>
                      ),
                    )}

                    {field.allow_other && (
                      <span className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        {
                          field.other_label ||
                          "Other"
                        }
                      </span>
                    )}
                  </div>
                )}


                {field.condition_field_id && (
                  <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-xs leading-5 text-violet-700">
                    Visible when{" "}
                    <strong>
                      {
                        conditionParent
                          ?.label ??
                        "another field"
                      }
                    </strong>{" "}
                    {
                      humanize(
                        field.condition_operator ??
                        "",
                      )
                    }

                    {formatConditionValue(
                      field.condition_value,
                    ) && (
                      <>
                        {" "}
                        <strong>
                          {
                            formatConditionValue(
                              field.condition_value,
                            )
                          }
                        </strong>
                      </>
                    )}
                  </div>
                )}


                {Object.keys(
                  field.validation_rules ??
                  {},
                ).length >
                  0 && (
                  <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-500">
                    <Settings2 className="h-3.5 w-3.5" />

                    Custom validation configured
                  </div>
                )}
              </div>
            </div>


            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={
                  pending ||
                  first
                }
                onClick={() =>
                  handleMove(
                    "UP",
                  )
                }
                title="Move up"
                className="rounded-xl"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>


              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={
                  pending ||
                  last
                }
                onClick={() =>
                  handleMove(
                    "DOWN",
                  )
                }
                title="Move down"
                className="rounded-xl"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>


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
                  field.active
                    ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                    : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                {pending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : field.active ? (
                  <Power className="mr-2 h-4 w-4" />
                ) : (
                  <CircleOff className="mr-2 h-4 w-4" />
                )}

                {field.active
                  ? "Disable"
                  : "Enable"}
              </Button>
            </div>
          </div>


          {error && (
            <ErrorMessage
              message={
                error
              }
            />
          )}
        </>
      ) : (
        <>
          <FieldEditor
            state={
              state
            }
            setState={
              setState
            }
            fields={
              fields
            }
            excludeFieldId={
              field.id
            }
            pending={
              pending
            }
          />


          {error && (
            <ErrorMessage
              message={
                error
              }
            />
          )}


          <div className="mt-6 flex flex-wrap justify-end gap-2">
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
                !state.label.trim() ||
                (
                  optionFieldTypes.has(
                    state.fieldType,
                  ) &&
                  parseOptions(
                    state.optionsText,
                  ).length ===
                    0
                )
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
        </>
      )}
    </div>
  );
}


// =========================================================
// FIELD EDITOR
// =========================================================

function FieldEditor({
  state,
  setState,
  fields,
  excludeFieldId,
  pending,
  showFieldKey = false,
}: {
  state:
    EditorState;

  setState:
    Dispatch<
      SetStateAction<EditorState>
    >;

  fields:
    ServiceFormFieldItem[];

  excludeFieldId?:
    string;

  pending:
    boolean;

  showFieldKey?:
    boolean;
}) {
  const optionField =
    optionFieldTypes.has(
      state.fieldType,
    );


  const textValidation =
    textValidationTypes.has(
      state.fieldType,
    );


  const numericValidation =
    numericValidationTypes.has(
      state.fieldType,
    );


  const fileField =
    fileFieldTypes.has(
      state.fieldType,
    );


  const availableConditionFields =
    fields.filter(
      (
        field,
      ) =>
        field.id !==
          excludeFieldId &&
        field.active,
    );


  function set<K extends keyof EditorState>(
    key:
      K,

    value:
      EditorState[K],
  ) {
    setState(
      (
        current,
      ) => ({
        ...current,

        [key]:
          value,
      }),
    );
  }


  function changeFieldType(
    fieldType:
      ServiceFormFieldType,
  ) {
    setState(
      (
        current,
      ) => ({
        ...current,

        fieldType,

        ...(
          optionFieldTypes.has(
            fieldType,
          )
            ? {}
            : {
                optionsText:
                  "",

                allowOther:
                  false,

                otherLabel:
                  "",
              }
        ),

        ...(
          fileFieldTypes.has(
            fieldType,
          )
            ? {}
            : {
                maxFiles:
                  "",

                maxFileSizeMb:
                  "",

                acceptText:
                  "",
              }
        ),
      }),
    );
  }


  return (
    <div className="space-y-7">

      {/* BASIC */}

      <EditorSection
        title="Basic Field Settings"
        description="Configure the field label, type and customer guidance."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {showFieldKey && (
            <div className="space-y-2">
              <Label>
                Field Key
              </Label>

              <Input
                value={
                  state.fieldKey
                }
                onChange={(
                  event,
                ) =>
                  set(
                    "fieldKey",
                    normalizeFieldKey(
                      event.target.value,
                    ),
                  )
                }
                placeholder="staff_id"
                disabled={
                  pending
                }
              />

              <p className="text-xs text-slate-400">
                Stable internal name. It cannot be changed after creation.
              </p>
            </div>
          )}


          {!showFieldKey && (
            <div className="space-y-2">
              <Label>
                Field Key
              </Label>

              <Input
                value={
                  state.fieldKey
                }
                disabled
                className="bg-slate-50 font-mono"
              />

              <p className="text-xs text-slate-400">
                Existing field keys are immutable.
              </p>
            </div>
          )}


          <div className="space-y-2">
            <Label>
              Field Label
            </Label>

            <Input
              value={
                state.label
              }
              onChange={(
                event,
              ) =>
                set(
                  "label",
                  event.target.value,
                )
              }
              placeholder="Staff ID"
              disabled={
                pending
              }
            />
          </div>


          <div className="space-y-2">
            <Label>
              Field Type
            </Label>

            <select
              value={
                state.fieldType
              }
              onChange={(
                event,
              ) =>
                changeFieldType(
                  event.target.value as
                    ServiceFormFieldType,
                )
              }
              disabled={
                pending
              }
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              {serviceFormFieldTypes.map(
                (
                  type,
                ) => (
                  <option
                    key={
                      type
                    }
                    value={
                      type
                    }
                  >
                    {
                      humanize(
                        type,
                      )
                    }
                  </option>
                ),
              )}
            </select>
          </div>


          <div className="space-y-2">
            <Label>
              Placeholder
            </Label>

            <Input
              value={
                state.placeholder
              }
              onChange={(
                event,
              ) =>
                set(
                  "placeholder",
                  event.target.value,
                )
              }
              placeholder="Enter a value"
              disabled={
                pending
              }
            />
          </div>


          <div className="space-y-2 md:col-span-2">
            <Label>
              Help Text
            </Label>

            <Textarea
              value={
                state.helpText
              }
              onChange={(
                event,
              ) =>
                set(
                  "helpText",
                  event.target.value,
                )
              }
              placeholder="Explain what the customer should enter."
              disabled={
                pending
              }
              className="min-h-24"
            />
          </div>
        </div>


        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <input
            type="checkbox"
            checked={
              state.required
            }
            onChange={(
              event,
            ) =>
              set(
                "required",
                event.target.checked,
              )
            }
            disabled={
              pending
            }
            className="mt-1 h-4 w-4 rounded border-slate-300"
          />

          <div>
            <p className="text-sm font-medium text-slate-800">
              Required Field
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Customer must complete this field before continuing.
            </p>
          </div>
        </label>
      </EditorSection>


      {/* OPTIONS */}

      {optionField && (
        <EditorSection
          title="Choice Options"
          description="Define the options shown to the customer."
        >
          <div className="space-y-2">
            <Label>
              Options
            </Label>

            <Textarea
              value={
                state.optionsText
              }
              onChange={(
                event,
              ) =>
                set(
                  "optionsText",
                  event.target.value,
                )
              }
              placeholder={`Option One\nOption Two\nOption Three`}
              disabled={
                pending
              }
              className="min-h-32"
            />

            <p className="text-xs text-slate-400">
              Enter one option per line. Comma-separated values are also accepted.
            </p>
          </div>


          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <input
              type="checkbox"
              checked={
                state.allowOther
              }
              onChange={(
                event,
              ) =>
                set(
                  "allowOther",
                  event.target.checked,
                )
              }
              disabled={
                pending
              }
              className="mt-1 h-4 w-4 rounded"
            />

            <div className="flex-1">
              <p className="text-sm font-medium text-blue-950">
                Allow Other
              </p>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                Customers can enter their own answer if none of the configured options apply.
              </p>
            </div>
          </label>


          {state.allowOther && (
            <div className="mt-4 max-w-md space-y-2">
              <Label>
                Other Label
              </Label>

              <Input
                value={
                  state.otherLabel
                }
                onChange={(
                  event,
                ) =>
                  set(
                    "otherLabel",
                    event.target.value,
                  )
                }
                placeholder="Other"
                disabled={
                  pending
                }
              />
            </div>
          )}
        </EditorSection>
      )}


      {/* CONDITIONAL */}

      <EditorSection
        title="Conditional Visibility"
        description="Optionally show this field only when another answer matches a condition."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label>
              Controlled By
            </Label>

            <select
              value={
                state.conditionFieldId
              }
              onChange={(
                event,
              ) => {
                setState(
                  (
                    current,
                  ) => ({
                    ...current,

                    conditionFieldId:
                      event.target.value,

                    conditionOperator:
                      event.target.value
                        ? current.conditionOperator
                        : "",

                    conditionValue:
                      event.target.value
                        ? current.conditionValue
                        : "",
                  }),
                );
              }}
              disabled={
                pending
              }
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Always visible
              </option>

              {availableConditionFields.map(
                (
                  field,
                ) => (
                  <option
                    key={
                      field.id
                    }
                    value={
                      field.id
                    }
                  >
                    {
                      field.label
                    }
                  </option>
                ),
              )}
            </select>
          </div>


          {state.conditionFieldId && (
            <div className="space-y-2">
              <Label>
                Condition
              </Label>

              <select
                value={
                  state.conditionOperator
                }
                onChange={(
                  event,
                ) =>
                  set(
                    "conditionOperator",
                    event.target.value as
                      | ""
                      | ServiceFormFieldConditionOperator,
                  )
                }
                disabled={
                  pending
                }
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select condition
                </option>

                {serviceFormFieldConditionOperators.map(
                  (
                    operator,
                  ) => (
                    <option
                      key={
                        operator
                      }
                      value={
                        operator
                      }
                    >
                      {
                        humanize(
                          operator,
                        )
                      }
                    </option>
                  ),
                )}
              </select>
            </div>
          )}
        </div>


        {state.conditionOperator &&
          conditionValueOperators.has(
            state.conditionOperator,
          ) && (
          <div className="mt-5 space-y-2">
            <Label>
              Conditional Value
            </Label>

            <Input
              value={
                state.conditionValue
              }
              onChange={(
                event,
              ) =>
                set(
                  "conditionValue",
                  event.target.value,
                )
              }
              placeholder={
                state.conditionOperator ===
                  "IN" ||
                state.conditionOperator ===
                  "NOT_IN"
                  ? "Value A, Value B, Value C"
                  : "Expected value"
              }
              disabled={
                pending
              }
            />

            {(state.conditionOperator ===
              "IN" ||
              state.conditionOperator ===
                "NOT_IN") && (
              <p className="text-xs text-slate-400">
                Separate multiple values using commas.
              </p>
            )}
          </div>
        )}
      </EditorSection>


      {/* VALIDATION */}

      {(textValidation ||
        numericValidation ||
        fileField) && (
        <EditorSection
          title="Validation Rules"
          description="Apply additional validation beyond the required setting."
        >
          {textValidation && (
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberSetting
                label="Minimum Length"
                value={
                  state.minLength
                }
                onChange={(
                  value,
                ) =>
                  set(
                    "minLength",
                    value,
                  )
                }
                pending={
                  pending
                }
              />

              <NumberSetting
                label="Maximum Length"
                value={
                  state.maxLength
                }
                onChange={(
                  value,
                ) =>
                  set(
                    "maxLength",
                    value,
                  )
                }
                pending={
                  pending
                }
              />
            </div>
          )}


          {numericValidation && (
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberSetting
                label="Minimum Value"
                value={
                  state.min
                }
                onChange={(
                  value,
                ) =>
                  set(
                    "min",
                    value,
                  )
                }
                pending={
                  pending
                }
                allowDecimal
              />

              <NumberSetting
                label="Maximum Value"
                value={
                  state.max
                }
                onChange={(
                  value,
                ) =>
                  set(
                    "max",
                    value,
                  )
                }
                pending={
                  pending
                }
                allowDecimal
              />
            </div>
          )}


          {fileField && (
            <>
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
                <div className="flex gap-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />

                  <p>
                    These settings define the upload requirement. Actual secure customer file storage is completed in Phase 13E.
                  </p>
                </div>
              </div>


              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <NumberSetting
                  label="Maximum Files"
                  value={
                    state.maxFiles
                  }
                  onChange={(
                    value,
                  ) =>
                    set(
                      "maxFiles",
                      value,
                    )
                  }
                  pending={
                    pending
                  }
                />

                <NumberSetting
                  label="Maximum Size Per File (MB)"
                  value={
                    state.maxFileSizeMb
                  }
                  onChange={(
                    value,
                  ) =>
                    set(
                      "maxFileSizeMb",
                      value,
                    )
                  }
                  pending={
                    pending
                  }
                  allowDecimal
                />
              </div>


              <div className="mt-5 space-y-2">
                <Label>
                  Accepted File Types
                </Label>

                <Input
                  value={
                    state.acceptText
                  }
                  onChange={(
                    event,
                  ) =>
                    set(
                      "acceptText",
                      event.target.value,
                    )
                  }
                  placeholder=".pdf, image/jpeg, image/png"
                  disabled={
                    pending
                  }
                />

                <p className="text-xs text-slate-400">
                  Separate MIME types or extensions with commas.
                </p>
              </div>
            </>
          )}
        </EditorSection>
      )}
    </div>
  );
}


// =========================================================
// EDITOR COMPONENTS
// =========================================================

function EditorSection({
  title,
  description,
  children,
}: {
  title:
    string;

  description:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 p-5">
      <div className="mb-5">
        <h3 className="font-semibold text-slate-900">
          {
            title
          }
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {
            description
          }
        </p>
      </div>

      {
        children
      }
    </section>
  );
}


function NumberSetting({
  label,
  value,
  onChange,
  pending,
  allowDecimal = false,
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

  pending:
    boolean;

  allowDecimal?:
    boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {
          label
        }
      </Label>

      <Input
        type="number"
        step={
          allowDecimal
            ? "0.01"
            : "1"
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
        disabled={
          pending
        }
      />
    </div>
  );
}


// =========================================================
// BADGES / MESSAGES
// =========================================================

function Badge({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-500">
      {
        children
      }
    </span>
  );
}


function BlueBadge({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase text-blue-700">
      {
        children
      }
    </span>
  );
}


function AmberBadge({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase text-amber-700">
      {
        children
      }
    </span>
  );
}


function StatusBadge({
  active,
}: {
  active:
    boolean;
}) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {active
        ? "Active"
        : "Disabled"}
    </span>
  );
}


function ErrorMessage({
  message,
}: {
  message:
    string;
}) {
  return (
    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {
        message
      }
    </div>
  );
}


function SuccessMessage({
  message,
}: {
  message:
    string;
}) {
  return (
    <div className="mx-5 mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 sm:mx-6">
      <CheckCircle2 className="h-4 w-4" />

      {
        message
      }
    </div>
  );
}


// =========================================================
// STATE HELPERS
// =========================================================

function emptyEditorState():
  EditorState {
  return {
    fieldKey:
      "",

    label:
      "",

    fieldType:
      "text",

    placeholder:
      "",

    helpText:
      "",

    required:
      true,

    optionsText:
      "",

    allowOther:
      false,

    otherLabel:
      "Other",

    conditionFieldId:
      "",

    conditionOperator:
      "",

    conditionValue:
      "",

    minLength:
      "",

    maxLength:
      "",

    min:
      "",

    max:
      "",

    maxFiles:
      "",

    maxFileSizeMb:
      "10",

    acceptText:
      "",
  };
}


function editorStateFromField(
  field:
    ServiceFormFieldItem,
):
  EditorState {
  const rules =
    field.validation_rules ??
    {};


  return {
    fieldKey:
      field.field_key,

    label:
      field.label,

    fieldType:
      field.field_type,

    placeholder:
      field.placeholder ??
      "",

    helpText:
      field.help_text ??
      "",

    required:
      field.required,

    optionsText:
      (
        field.options ??
        []
      ).join(
        "\n",
      ),

    allowOther:
      field.allow_other,

    otherLabel:
      field.other_label ??
      "Other",

    conditionFieldId:
      field.condition_field_id ??
      "",

    conditionOperator:
      field.condition_operator ??
      "",

    conditionValue:
      conditionValueToText(
        field.condition_value,
      ),

    minLength:
      numberToInput(
        rules.minLength,
      ),

    maxLength:
      numberToInput(
        rules.maxLength,
      ),

    min:
      numberToInput(
        rules.min,
      ),

    max:
      numberToInput(
        rules.max,
      ),

    maxFiles:
      numberToInput(
        rules.maxFiles,
      ),

    maxFileSizeMb:
      numberToInput(
        rules.maxFileSizeMb,
      ),

    acceptText:
      (
        rules.accept ??
        []
      ).join(
        ", ",
      ),
  };
}


// =========================================================
// ACTION INPUT
// =========================================================

function buildActionInput(
  state:
    EditorState,
):
  UpdateServiceFormFieldInput {
  return {
    label:
      state.label,

    fieldType:
      state.fieldType,

    placeholder:
      state.placeholder,

    helpText:
      state.helpText,

    required:
      state.required,

    options:
      parseOptions(
        state.optionsText,
      ),

    allowOther:
      state.allowOther,

    otherLabel:
      state.otherLabel,

    conditionFieldId:
      state.conditionFieldId,

    conditionOperator:
      state.conditionOperator,

    conditionValue:
      state.conditionValue,

    validationRules: {
      minLength:
        parseOptionalNumber(
          state.minLength,
        ),

      maxLength:
        parseOptionalNumber(
          state.maxLength,
        ),

      min:
        parseOptionalNumber(
          state.min,
        ),

      max:
        parseOptionalNumber(
          state.max,
        ),

      maxFiles:
        parseOptionalNumber(
          state.maxFiles,
        ),

      maxFileSizeMb:
        parseOptionalNumber(
          state.maxFileSizeMb,
        ),

      accept:
        parseOptions(
          state.acceptText,
        ),
    },
  };
}


// =========================================================
// HELPERS
// =========================================================

function parseOptions(
  value:
    string,
) {
  const result:
    string[] =
    [];


  const seen =
    new Set<string>();


  for (
    const raw of
    value.split(
      /[\n,]+/,
    )
  ) {
    const option =
      raw.trim();


    if (
      !option
    ) {
      continue;
    }


    const key =
      option.toLowerCase();


    if (
      seen.has(
        key,
      )
    ) {
      continue;
    }


    seen.add(
      key,
    );

    result.push(
      option,
    );
  }


  return result;
}


function parseOptionalNumber(
  value:
    string,
):
  number | null {
  if (
    !value.trim()
  ) {
    return null;
  }


  const number =
    Number(
      value,
    );


  return Number.isFinite(
    number,
  )
    ? number
    : null;
}


function numberToInput(
  value:
    number | undefined,
) {
  return value ===
    undefined
    ? ""
    : String(
        value,
      );
}


function normalizeFieldKey(
  value:
    string,
) {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "_",
    )
    .replace(
      /^_+|_+$/g,
      "",
    )
    .replace(
      /^[0-9_]+/,
      "",
    );
}


function conditionValueToText(
  value:
    unknown,
) {
  if (
    Array.isArray(
      value,
    )
  ) {
    return value
      .filter(
        (
          item,
        ): item is string =>
          typeof item ===
          "string",
      )
      .join(
        ", ",
      );
  }


  if (
    typeof value ===
    "string"
  ) {
    return value;
  }


  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return "";
  }


  return String(
    value,
  );
}


function formatConditionValue(
  value:
    unknown,
) {
  const text =
    conditionValueToText(
      value,
    );


  return text
    ? `"${text}"`
    : "";
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
    .toLowerCase()
    .replace(
      /\b\w/g,
      (
        letter,
      ) =>
        letter.toUpperCase(),
    );
}