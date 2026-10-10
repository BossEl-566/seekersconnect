import {
  z,
} from "zod";


// =========================================================
// ENUMS
// =========================================================

export const servicePricingModeSchema =
  z.enum([
    "FIXED",
    "PER_UNIT",
    "STARTING_FROM",
    "QUOTE_REQUIRED",
    "FREE",
    "MANUAL_PRICE",
  ]);


export const servicePricingCurrencySchema =
  z.enum([
    "GHS",
    "USD",
  ]);


// =========================================================
// TYPES
// =========================================================

export type ServicePricingMode =
  z.infer<
    typeof servicePricingModeSchema
  >;


export type ServicePricingCurrency =
  z.infer<
    typeof servicePricingCurrencySchema
  >;


// =========================================================
// BASE PRICING VALIDATION
// =========================================================

export const updateServicePricingSchema =
  z
    .object({
      pricingMode:
        servicePricingModeSchema,

      currency:
        servicePricingCurrencySchema,

      amount:
        z
          .number()
          .finite(
            "Enter a valid amount.",
          )
          .nonnegative(
            "Amount cannot be negative.",
          )
          .nullable(),

      unitLabel:
        z
          .string()
          .trim()
          .max(
            80,
            "Unit label is too long.",
          ),

      minimumQuantity:
        z
          .number()
          .finite()
          .positive(
            "Minimum quantity must be greater than zero.",
          )
          .nullable(),

      maximumQuantity:
        z
          .number()
          .finite()
          .positive(
            "Maximum quantity must be greater than zero.",
          )
          .nullable(),

      displayNote:
        z
          .string()
          .trim()
          .max(
            500,
            "Pricing note is too long.",
          ),

      active:
        z.boolean(),
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          [
            "FIXED",
            "PER_UNIT",
            "STARTING_FROM",
          ].includes(
            value.pricingMode,
          )
        ) {
          if (
            value.amount ===
              null ||
            value.amount <=
              0
          ) {
            context.addIssue({
              code:
                "custom",

              path: [
                "amount",
              ],

              message:
                "Enter an amount greater than zero.",
            });
          }
        }


        if (
          value.pricingMode ===
            "PER_UNIT" &&
          !value.unitLabel
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "unitLabel",
            ],

            message:
              "Enter the unit used for per-unit pricing.",
          });
        }


        if (
          value.minimumQuantity !==
            null &&
          value.maximumQuantity !==
            null &&
          value.maximumQuantity <
            value.minimumQuantity
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "maximumQuantity",
            ],

            message:
              "Maximum quantity cannot be less than minimum quantity.",
          });
        }
      },
    );


export type UpdateServicePricingInput =
  z.input<
    typeof updateServicePricingSchema
  >;


// =========================================================
// PRICING OPTION
// =========================================================

export const servicePricingOptionSchema =
  z.object({
    code:
      z
        .string()
        .trim()
        .max(
          80,
          "Option code is too long.",
        ),

    label:
      z
        .string()
        .trim()
        .min(
          1,
          "Option name is required.",
        )
        .max(
          150,
          "Option name is too long.",
        ),

    description:
      z
        .string()
        .trim()
        .max(
          500,
          "Option description is too long.",
        ),

    unitLabel:
      z
        .string()
        .trim()
        .max(
          80,
          "Unit label is too long.",
        ),

    displayOrder:
      z
        .number()
        .int(
          "Display order must be a whole number.",
        )
        .min(
          0,
          "Display order cannot be negative.",
        )
        .max(
          100000,
          "Display order is too large.",
        ),

    active:
      z.boolean(),
  });


export type ServicePricingOptionInput =
  z.input<
    typeof servicePricingOptionSchema
  >;


// =========================================================
// PRICING TIER
// =========================================================

export const servicePricingTierSchema =
  z
    .object({
      label:
        z
          .string()
          .trim()
          .max(
            120,
            "Tier name is too long.",
          ),

      amount:
        z
          .number()
          .finite(
            "Enter a valid price.",
          )
          .positive(
            "Price must be greater than zero.",
          ),

      minimumQuantity:
        z
          .number()
          .finite()
          .positive(
            "Minimum quantity must be greater than zero.",
          )
          .nullable(),

      maximumQuantity:
        z
          .number()
          .finite()
          .positive(
            "Maximum quantity must be greater than zero.",
          )
          .nullable(),

      displayOrder:
        z
          .number()
          .int(
            "Display order must be a whole number.",
          )
          .min(
            0,
            "Display order cannot be negative.",
          )
          .max(
            100000,
            "Display order is too large.",
          ),

      active:
        z.boolean(),
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          value.minimumQuantity !==
            null &&
          value.maximumQuantity !==
            null &&
          value.maximumQuantity <
            value.minimumQuantity
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "maximumQuantity",
            ],

            message:
              "Maximum quantity cannot be lower than minimum quantity.",
          });
        }
      },
    );


export type ServicePricingTierInput =
  z.input<
    typeof servicePricingTierSchema
  >;


// =========================================================
// OPTION-CAPABLE MODES
// =========================================================

export function pricingModeSupportsOptions(
  mode:
    ServicePricingMode,
) {
  return (
    mode ===
      "FIXED" ||
    mode ===
      "PER_UNIT" ||
    mode ===
      "STARTING_FROM"
  );
}