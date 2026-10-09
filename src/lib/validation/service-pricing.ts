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
// VALIDATION
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
        // -------------------------------------------------
        // MODES REQUIRING AN AMOUNT
        // -------------------------------------------------

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


        // -------------------------------------------------
        // PER UNIT REQUIRES UNIT
        // -------------------------------------------------

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


        // -------------------------------------------------
        // QUANTITY RANGE
        // -------------------------------------------------

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