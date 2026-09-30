import {
  z,
} from "zod";


export const adminRoles = [
  "SUPER_ADMIN",
  "OPERATIONS_ADMIN",
] as const;


export type AdminRole =
  (typeof adminRoles)[number];


export const createAdminAccountSchema =
  z.object({
    fullName: z
      .string()
      .trim()
      .min(
        2,
        "Full name is required.",
      )
      .max(
        150,
        "Full name is too long.",
      ),

    email: z
      .string()
      .trim()
      .email(
        "Enter a valid email address.",
      )
      .max(
        200,
        "Email address is too long.",
      )
      .transform(
        (value) =>
          value.toLowerCase(),
      ),

    role:
      z.enum(
        adminRoles,
      ),
  });


export const updateAdminRoleSchema =
  z.object({
    role:
      z.enum(
        adminRoles,
      ),
  });


export type CreateAdminAccountInput =
  z.infer<
    typeof createAdminAccountSchema
  >;