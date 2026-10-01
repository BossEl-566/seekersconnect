import {
  z,
} from "zod";


const passwordSchema =
  z
    .string()
    .min(
      10,
      "Password must contain at least 10 characters.",
    )
    .max(
      128,
      "Password is too long.",
    )
    .regex(
      /[a-z]/,
      "Password must contain a lowercase letter.",
    )
    .regex(
      /[A-Z]/,
      "Password must contain an uppercase letter.",
    )
    .regex(
      /\d/,
      "Password must contain a number.",
    )
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain a symbol.",
    );


export const changeAdminPasswordSchema =
  z
    .object({
      currentPassword:
        z
          .string()
          .min(
            1,
            "Enter your current password.",
          ),

      newPassword:
        passwordSchema,

      confirmPassword:
        z
          .string()
          .min(
            1,
            "Confirm your new password.",
          ),
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          value.newPassword !==
          value.confirmPassword
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode.custom,

            path: [
              "confirmPassword",
            ],

            message:
              "The passwords do not match.",
          });
        }


        if (
          value.currentPassword ===
          value.newPassword
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode.custom,

            path: [
              "newPassword",
            ],

            message:
              "Your new password must be different from your current password.",
          });
        }
      },
    );


export const updateAdminProfileSchema =
  z.object({
    fullName:
      z
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
  });


export type ChangeAdminPasswordInput =
  z.infer<
    typeof changeAdminPasswordSchema
  >;