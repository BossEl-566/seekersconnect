import {
  z,
} from "zod";


export const createServiceSchema =
  z.object({
    universityId: z
      .string()
      .uuid(
        "Select a valid university.",
      ),

    slug: z
      .string()
      .trim()
      .min(
        2,
        "Service slug must contain at least 2 characters.",
      )
      .max(
        80,
        "Service slug is too long.",
      )
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug can only contain lowercase letters, numbers and hyphens.",
      ),

    name: z
      .string()
      .trim()
      .min(
        2,
        "Service name is required.",
      )
      .max(
        150,
        "Service name is too long.",
      ),

    shortName: z
      .string()
      .trim()
      .min(
        2,
        "Short name is required.",
      )
      .max(
        80,
        "Short name is too long.",
      ),

    description: z
      .string()
      .trim()
      .max(
        1000,
        "Description is too long.",
      ),

    category: z
      .string()
      .trim()
      .min(
        1,
        "Select a service category.",
      )
      .max(
        100,
        "Category is invalid.",
      ),

    formType: z
      .string()
      .trim()
      .min(
        1,
        "Select a form type.",
      )
      .max(
        100,
        "Form type is invalid.",
      ),
  });


export const updateServiceSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Service name is required.",
      )
      .max(
        150,
        "Service name is too long.",
      ),

    shortName: z
      .string()
      .trim()
      .min(
        2,
        "Short name is required.",
      )
      .max(
        80,
        "Short name is too long.",
      ),

    description: z
      .string()
      .trim()
      .max(
        1000,
        "Description is too long.",
      ),

    category: z
      .string()
      .trim()
      .min(
        1,
        "Select a service category.",
      )
      .max(
        100,
        "Category is invalid.",
      ),

    formType: z
      .string()
      .trim()
      .min(
        1,
        "Select a form type.",
      )
      .max(
        100,
        "Form type is invalid.",
      ),
  });


export type CreateServiceInput =
  z.infer<
    typeof createServiceSchema
  >;


export type UpdateServiceInput =
  z.infer<
    typeof updateServiceSchema
  >;