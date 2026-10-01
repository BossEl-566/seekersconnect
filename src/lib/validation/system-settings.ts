import {
  z,
} from "zod";


const requiredText = (
  label:
    string,

  maximum = 200,
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
// PAYMENT
// =========================================================

export const paymentDetailsSchema =
  z.object({
    momoNumber:
      phoneSchema,

    momoAccountName:
      requiredText(
        "Mobile Money account name",
        150,
      ),

    bankName:
      requiredText(
        "Bank name",
        150,
      ),

    bankAccountNumber:
      requiredText(
        "Bank account number",
        100,
      ),

    bankAccountName:
      requiredText(
        "Bank account name",
        150,
      ),
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