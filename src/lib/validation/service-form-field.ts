import {
  z,
} from "zod";


// =========================================================
// FIELD TYPES
// =========================================================

export const serviceFormFieldTypes = [
  "text",
  "email",
  "tel",
  "number",
  "currency",
  "date",
  "textarea",

  "select",
  "radio",
  "checkbox",
  "multi_select",

  "file",
  "image",
  "document",
] as const;


export type ServiceFormFieldType =
  (typeof serviceFormFieldTypes)[number];


// =========================================================
// CONDITIONAL OPERATORS
// =========================================================

export const serviceFormFieldConditionOperators = [
  "EQUALS",
  "NOT_EQUALS",

  "IN",
  "NOT_IN",

  "IS_CHECKED",
  "IS_NOT_CHECKED",

  "HAS_VALUE",
  "HAS_NO_VALUE",
] as const;


export type ServiceFormFieldConditionOperator =
  (typeof serviceFormFieldConditionOperators)[number];


// =========================================================
// VALIDATION RULES
// =========================================================

export const serviceFormFieldValidationRulesSchema =
  z
    .object({
      minLength:
        z
          .number()
          .int()
          .nonnegative()
          .nullable(),

      maxLength:
        z
          .number()
          .int()
          .positive()
          .nullable(),

      min:
        z
          .number()
          .finite()
          .nullable(),

      max:
        z
          .number()
          .finite()
          .nullable(),

      maxFiles:
        z
          .number()
          .int()
          .positive()
          .max(
            20,
            "Maximum file count cannot exceed 20.",
          )
          .nullable(),

      maxFileSizeMb:
        z
          .number()
          .positive()
          .max(
            50,
            "Maximum file size cannot exceed 50 MB.",
          )
          .nullable(),

      accept:
        z
          .array(
            z
              .string()
              .trim()
              .min(1)
              .max(150),
          )
          .max(30),
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          value.minLength !==
            null &&
          value.maxLength !==
            null &&
          value.minLength >
            value.maxLength
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode.custom,

            path: [
              "maxLength",
            ],

            message:
              "Maximum length must be greater than or equal to minimum length.",
          });
        }


        if (
          value.min !==
            null &&
          value.max !==
            null &&
          value.min >
            value.max
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode.custom,

            path: [
              "max",
            ],

            message:
              "Maximum value must be greater than or equal to minimum value.",
          });
        }
      },
    );


export type ServiceFormFieldValidationRules =
  z.infer<
    typeof serviceFormFieldValidationRulesSchema
  >;


// =========================================================
// SHARED CONFIGURATION
// =========================================================

const sharedFieldShape = {
  label:
    z
      .string()
      .trim()
      .min(
        2,
        "Field label is required.",
      )
      .max(
        150,
        "Field label is too long.",
      ),

  fieldType:
    z.enum(
      serviceFormFieldTypes,
    ),

  placeholder:
    z
      .string()
      .trim()
      .max(
        200,
        "Placeholder is too long.",
      ),

  helpText:
    z
      .string()
      .trim()
      .max(
        1000,
        "Help text is too long.",
      ),

  required:
    z.boolean(),

  options:
    z.array(
      z
        .string()
        .trim()
        .min(1)
        .max(150),
    ),

  allowOther:
    z.boolean(),

  otherLabel:
    z
      .string()
      .trim()
      .max(
        100,
        "Other label is too long.",
      ),

  conditionFieldId:
    z.union([
      z.literal(""),

      z
        .string()
        .uuid(
          "Invalid conditional field.",
        ),
    ]),

  conditionOperator:
    z.union([
      z.literal(""),

      z.enum(
        serviceFormFieldConditionOperators,
      ),
    ]),

  conditionValue:
    z
      .string()
      .trim()
      .max(
        1000,
        "Conditional value is too long.",
      ),

  validationRules:
    serviceFormFieldValidationRulesSchema,
};


// =========================================================
// ADVANCED VALIDATION
// =========================================================

function validateAdvancedField(
  value: {
    fieldType:
      ServiceFormFieldType;

    options:
      string[];

    allowOther:
      boolean;

    conditionFieldId:
      string;

    conditionOperator:
      ""
      | ServiceFormFieldConditionOperator;

    conditionValue:
      string;
  },

  context:
    z.RefinementCtx,
) {
  const optionField =
    [
      "select",
      "radio",
      "multi_select",
    ].includes(
      value.fieldType,
    );


  if (
    optionField &&
    value.options.length ===
      0
  ) {
    context.addIssue({
      code:
        z.ZodIssueCode.custom,

      path: [
        "options",
      ],

      message:
        "This field type must have at least one option.",
    });
  }


  if (
    value.allowOther &&
    !optionField
  ) {
    context.addIssue({
      code:
        z.ZodIssueCode.custom,

      path: [
        "allowOther",
      ],

      message:
        "Other can only be enabled for select, radio or multi-select fields.",
    });
  }


  if (
    value.conditionFieldId &&
    !value.conditionOperator
  ) {
    context.addIssue({
      code:
        z.ZodIssueCode.custom,

      path: [
        "conditionOperator",
      ],

      message:
        "Select a conditional operator.",
    });
  }


  if (
    !value.conditionFieldId &&
    value.conditionOperator
  ) {
    context.addIssue({
      code:
        z.ZodIssueCode.custom,

      path: [
        "conditionFieldId",
      ],

      message:
        "Select the field that controls this condition.",
    });
  }


  if (
    value.conditionFieldId &&
    [
      "EQUALS",
      "NOT_EQUALS",
      "IN",
      "NOT_IN",
    ].includes(
      value.conditionOperator,
    ) &&
    !value.conditionValue
  ) {
    context.addIssue({
      code:
        z.ZodIssueCode.custom,

      path: [
        "conditionValue",
      ],

      message:
        "Enter the value used by this condition.",
    });
  }
}


// =========================================================
// CREATE
// =========================================================

export const createServiceFormFieldSchema =
  z
    .object({
      fieldKey:
        z
          .string()
          .trim()
          .min(
            1,
            "Field key is required.",
          )
          .max(
            80,
            "Field key is too long.",
          )
          .regex(
            /^[A-Za-z][A-Za-z0-9_-]*$/,
            "Field key must start with a letter and contain only letters, numbers, underscores and hyphens.",
          ),

      ...sharedFieldShape,
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        validateAdvancedField(
          value,
          context,
        );
      },
    );


// =========================================================
// UPDATE
// =========================================================

export const updateServiceFormFieldSchema =
  z
    .object({
      ...sharedFieldShape,
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        validateAdvancedField(
          value,
          context,
        );
      },
    );


export type CreateServiceFormFieldInput =
  z.infer<
    typeof createServiceFormFieldSchema
  >;


export type UpdateServiceFormFieldInput =
  z.infer<
    typeof updateServiceFormFieldSchema
  >;