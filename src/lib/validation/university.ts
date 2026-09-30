import {
  z,
} from "zod";


export const createUniversitySchema =
  z.object({
    code: z
      .string()
      .trim()
      .min(
        2,
        "University code must contain at least 2 characters.",
      )
      .max(
        12,
        "University code must not exceed 12 characters.",
      )
      .regex(
        /^[A-Za-z0-9-]+$/,
        "University code can only contain letters, numbers and hyphens.",
      )
      .transform(
        (value) =>
          value.toUpperCase(),
      ),

    name: z
      .string()
      .trim()
      .min(
        3,
        "University name is required.",
      )
      .max(
        150,
        "University name is too long.",
      ),

    location: z
      .string()
      .trim()
      .min(
        2,
        "University location is required.",
      )
      .max(
        150,
        "University location is too long.",
      ),
  });


export const updateUniversitySchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        3,
        "University name is required.",
      )
      .max(
        150,
        "University name is too long.",
      ),

    location: z
      .string()
      .trim()
      .min(
        2,
        "University location is required.",
      )
      .max(
        150,
        "University location is too long.",
      ),
  });


export type CreateUniversityInput =
  z.infer<
    typeof createUniversitySchema
  >;


export type UpdateUniversityInput =
  z.infer<
    typeof updateUniversitySchema
  >;