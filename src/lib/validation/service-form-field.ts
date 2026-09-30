import {
  z,
} from "zod";


export const serviceFormFieldTypes = [
  "text",
  "email",
  "tel",
  "number",
  "date",
  "textarea",
  "select",
] as const;


export type ServiceFormFieldType =
  (typeof serviceFormFieldTypes)[number];


export const createServiceFormFieldSchema =
  z
    .object({
      fieldKey: z
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
          "Field key must start with a letter and can only contain letters, numbers, underscores and hyphens.",
        ),

      label: z
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

      fieldType: z.enum(
        serviceFormFieldTypes,
      ),

      placeholder: z
        .string()
        .trim()
        .max(
          200,
          "Placeholder is too long.",
        ),

      required:
        z.boolean(),

      options: z.array(
        z
          .string()
          .trim()
          .min(1)
          .max(150),
      ),
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          value.fieldType ===
            "select" &&
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
              "A select field must have at least one option.",
          });
        }
      },
    );


export const updateServiceFormFieldSchema =
  z
    .object({
      label: z
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

      fieldType: z.enum(
        serviceFormFieldTypes,
      ),

      placeholder: z
        .string()
        .trim()
        .max(
          200,
          "Placeholder is too long.",
        ),

      required:
        z.boolean(),

      options: z.array(
        z
          .string()
          .trim()
          .min(1)
          .max(150),
      ),
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          value.fieldType ===
            "select" &&
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
              "A select field must have at least one option.",
          });
        }
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