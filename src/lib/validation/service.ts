import {
  z,
} from "zod";


// =========================================================
// SHARED FIELDS
// =========================================================

const serviceScopeSchema =
  z.enum([
    "general",
    "academic",
  ]);


const optionalUniversitySchema =
  z
    .union([
      z
        .string()
        .uuid(),
      z.literal(""),
      z.null(),
    ])
    .transform(
      (
        value,
      ) =>
        value || null,
    );


const serviceCategoryIdSchema =
  z
    .string()
    .uuid(
      "Select a valid service category.",
    );


const serviceNameSchema =
  z
    .string()
    .trim()
    .min(
      2,
      "Enter the service name.",
    )
    .max(
      150,
      "Service name is too long.",
    );


const shortNameSchema =
  z
    .string()
    .trim()
    .min(
      2,
      "Enter a short name.",
    )
    .max(
      80,
      "Short name is too long.",
    );


const descriptionSchema =
  z
    .string()
    .trim()
    .max(
      3000,
      "Description is too long.",
    );


const slugSchema =
  z
    .string()
    .trim()
    .min(
      2,
      "Enter a service slug.",
    )
    .max(
      120,
      "Service slug is too long.",
    )
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers and hyphens only.",
    );


const formTypeSchema =
  z
    .string()
    .trim()
    .min(
      1,
      "Select a form type.",
    )
    .max(
      100,
      "Form type is too long.",
    );


const displayOrderSchema =
  z
    .coerce
    .number()
    .int()
    .min(0)
    .max(10000);


// =========================================================
// CREATE SERVICE
// =========================================================

export const createServiceSchema =
  z
    .object({
      serviceScope:
        serviceScopeSchema,

      universityId:
        optionalUniversitySchema,

      serviceCategoryId:
        serviceCategoryIdSchema,

      slug:
        slugSchema,

      name:
        serviceNameSchema,

      shortName:
        shortNameSchema,

      description:
        descriptionSchema,

      formType:
        formTypeSchema,

      displayOrder:
        displayOrderSchema,

      featured:
        z.boolean(),
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          value.serviceScope ===
            "academic" &&
          !value.universityId
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "universityId",
            ],

            message:
              "Select an institution for an academic service.",
          });
        }
      },
    );


export type CreateServiceInput =
  z.input<
    typeof createServiceSchema
  >;


// =========================================================
// UPDATE SERVICE
//
// Scope, institution and slug are intentionally excluded.
// Existing customer requests may already depend on them.
// =========================================================

export const updateServiceSchema =
  z.object({
    name:
      serviceNameSchema,

    shortName:
      shortNameSchema,

    description:
      descriptionSchema,

    serviceCategoryId:
      serviceCategoryIdSchema,

    formType:
      formTypeSchema,

    displayOrder:
      displayOrderSchema,

    featured:
      z.boolean(),
  });


export type UpdateServiceInput =
  z.input<
    typeof updateServiceSchema
  >;