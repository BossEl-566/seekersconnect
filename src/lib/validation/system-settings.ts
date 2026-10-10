import {
  z,
} from "zod";


// =========================================================
// COMMON
// =========================================================

const requiredText = (
  label:
    string,

  maximum =
    200,
) =>
  z
    .string()
    .trim()
    .min(
      1,
      `${label} is required.`,
    )
    .max(
      maximum,
      `${label} is too long.`,
    );


const optionalText = (
  maximum =
    200,
) =>
  z
    .string()
    .trim()
    .max(
      maximum,
      "Value is too long.",
    );


const phoneSchema =
  z
    .string()
    .trim()
    .min(
      8,
      "Enter a valid phone number.",
    )
    .max(
      20,
      "Phone number is too long.",
    );


// =========================================================
// COMPANY
// =========================================================

export const companyProfileSchema =
  z.object({
    name:
      requiredText(
        "Company name",
        200,
      ),

    shortName:
      requiredText(
        "Short name",
        100,
      ),

    website:
      requiredText(
        "Website",
        200,
      ),

    email:
      z
        .string()
        .trim()
        .email(
          "Enter a valid company email address.",
        )
        .max(
          200,
        ),

    whatsapp:
      phoneSchema,
  });


// =========================================================
// PAYMENT — MOBILE MONEY
// =========================================================

export const momoPaymentDestinationSchema =
  z
    .object({
      enabled:
        z.boolean(),

      number:
        optionalText(
          30,
        ),

      accountName:
        optionalText(
          150,
        ),
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          !value.enabled
        ) {
          return;
        }


        if (
          value.number.length <
          3
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "number",
            ],

            message:
              "Mobile Money number is required when Mobile Money is enabled.",
          });
        }


        if (
          !value.accountName
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "accountName",
            ],

            message:
              "Mobile Money account name is required when Mobile Money is enabled.",
          });
        }
      },
    );


// =========================================================
// PAYMENT — BANK
// =========================================================

export const bankPaymentDestinationSchema =
  z
    .object({
      enabled:
        z.boolean(),

      bankName:
        optionalText(
          150,
        ),

      accountNumber:
        optionalText(
          100,
        ),

      accountName:
        optionalText(
          150,
        ),

      branch:
        optionalText(
          150,
        ),

      swiftBic:
        optionalText(
          50,
        ),

      instructions:
        optionalText(
          1000,
        ),
    })
    .superRefine(
      (
        value,
        context,
      ) => {
        if (
          !value.enabled
        ) {
          return;
        }


        if (
          !value.bankName
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "bankName",
            ],

            message:
              "Bank name is required when bank transfer is enabled.",
          });
        }


        if (
          !value.accountNumber
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "accountNumber",
            ],

            message:
              "Bank account number is required when bank transfer is enabled.",
          });
        }


        if (
          !value.accountName
        ) {
          context.addIssue({
            code:
              "custom",

            path: [
              "accountName",
            ],

            message:
              "Bank account name is required when bank transfer is enabled.",
          });
        }
      },
    );


// =========================================================
// PAYMENT — ONE CURRENCY
// =========================================================

export const currencyPaymentDestinationSchema =
  z.object({
    momo:
      momoPaymentDestinationSchema,

    bank:
      bankPaymentDestinationSchema,
  });


// =========================================================
// PAYMENT DETAILS
//
// We deliberately support GHS and USD in the Admin UI now.
//
// service_pricing.currency remains a generic ISO-style
// three-character code so more currencies can be added later.
// =========================================================

export const paymentDetailsSchema =
  z.object({
    currencies:
      z.object({
        GHS:
          currencyPaymentDestinationSchema,

        USD:
          currencyPaymentDestinationSchema,
      }),
  });


// =========================================================
// SUPPORT
// =========================================================

export const supportContactsSchema =
  z.object({
    phones:
      z
        .array(
          phoneSchema,
        )
        .min(
          1,
          "Provide at least one support phone number.",
        )
        .max(
          5,
          "A maximum of five support numbers is allowed.",
        ),

    supportEmail:
      z
        .string()
        .trim()
        .email(
          "Enter a valid support email address.",
        )
        .max(
          200,
        ),
  });


// =========================================================
// REQUEST NOTICES
// =========================================================

export const requestNoticesSchema =
  z.object({
    requestNotice:
      requiredText(
        "Request notice",
        1000,
      ),

    paymentInstructions:
      requiredText(
        "Payment instructions",
        1000,
      ),

    paymentProofNotice:
      requiredText(
        "Payment proof notice",
        1000,
      ),

    trackingNotice:
      requiredText(
        "Tracking notice",
        1000,
      ),
  });


// =========================================================
// TYPES
// =========================================================

export type CompanyProfileSettings =
  z.infer<
    typeof companyProfileSchema
  >;


export type MomoPaymentDestinationSettings =
  z.infer<
    typeof momoPaymentDestinationSchema
  >;


export type BankPaymentDestinationSettings =
  z.infer<
    typeof bankPaymentDestinationSchema
  >;


export type CurrencyPaymentDestinationSettings =
  z.infer<
    typeof currencyPaymentDestinationSchema
  >;


export type PaymentDetailsSettings =
  z.infer<
    typeof paymentDetailsSchema
  >;


export type SupportContactsSettings =
  z.infer<
    typeof supportContactsSchema
  >;


export type RequestNoticesSettings =
  z.infer<
    typeof requestNoticesSchema
  >;


export type SystemSettings = {
  company:
    CompanyProfileSettings;

  payment:
    PaymentDetailsSettings;

  support:
    SupportContactsSettings;

  request:
    RequestNoticesSettings;
};