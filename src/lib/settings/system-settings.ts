import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  companyProfileSchema,
  paymentDetailsSchema,
  requestNoticesSchema,
  supportContactsSchema,
  type PaymentDetailsSettings,
  type SystemSettings,
} from "@/lib/validation/system-settings";


// =========================================================
// SAFE FALLBACKS
// =========================================================

const DEFAULT_PAYMENT_SETTINGS:
  PaymentDetailsSettings =
{
  currencies: {
    // -----------------------------------------------------
    // Existing Seekers Connect GHS details
    // -----------------------------------------------------

    GHS: {
      momo: {
        enabled:
          true,

        number:
          "0550414522",

        accountName:
          "Seekers Connect",
      },

      bank: {
        enabled:
          true,

        bankName:
          "Stanbic Bank",

        accountNumber:
          "9040014522640",

        accountName:
          "Seekers Connect",

        branch:
          "",

        swiftBic:
          "",

        instructions:
          "",
      },
    },


    // -----------------------------------------------------
    // USD intentionally starts disabled.
    //
    // Do not assume that the existing GHS bank account can
    // receive USD.
    // -----------------------------------------------------

    USD: {
      momo: {
        enabled:
          false,

        number:
          "",

        accountName:
          "",
      },

      bank: {
        enabled:
          false,

        bankName:
          "",

        accountNumber:
          "",

        accountName:
          "",

        branch:
          "",

        swiftBic:
          "",

        instructions:
          "",
      },
    },
  },
};


const DEFAULT_SETTINGS:
  SystemSettings =
{
  company: {
    name:
      "Seekers Connect 247 Enterprise",

    shortName:
      "Seekers Connect 247",

    website:
      "seekersconnect247.com",

    email:
      "seekersconnect247@gmail.com",

    whatsapp:
      "0249914968",
  },


  payment:
    DEFAULT_PAYMENT_SETTINGS,


  support: {
    phones: [
      "0550414552",
      "0249914968",
      "0362297079",
    ],

    supportEmail:
      "seekersconnect247@gmail.com",
  },


  request: {
    requestNotice:
      "Enter your information carefully to avoid delays in processing.",

    paymentInstructions:
      "Make payment using the details provided, then upload a clear proof of payment.",

    paymentProofNotice:
      "Ensure the payment proof clearly shows the successful transaction. Your request will not begin processing until payment has been verified.",

    trackingNotice:
      "Keep your request number safe. Your tracking details will be issued after payment verification.",
  },
};


type SettingRow = {
  setting_key:
    string;

  setting_value:
    unknown;
};


// =========================================================
// GENERIC PARSER
// =========================================================

function parseSetting<T>(
  value:
    unknown,

  parser: {
    safeParse:
      (
        value:
          unknown,
      ) =>
        | {
            success:
              true;

            data:
              T;
          }
        | {
            success:
              false;
          };
  },

  fallback:
    T,
):
  T {
  const parsed =
    parser.safeParse(
      value,
    );


  if (
    !parsed.success
  ) {
    return fallback;
  }


  return parsed.data;
}


// =========================================================
// OBJECT HELPER
// =========================================================

function isRecord(
  value:
    unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value,
    )
  );
}


function stringValue(
  record:
    Record<
      string,
      unknown
    >,

  key:
    string,
) {
  const value =
    record[
      key
    ];


  return typeof value ===
    "string"
    ? value.trim()
    : "";
}


// =========================================================
// PAYMENT COMPATIBILITY
//
// Old database format:
//
// {
//   momoNumber,
//   momoAccountName,
//   bankName,
//   bankAccountNumber,
//   bankAccountName
// }
//
// New format:
//
// {
//   currencies: {
//     GHS: { momo, bank },
//     USD: { momo, bank }
//   }
// }
//
// The old database value continues working without a
// migration. Once the administrator saves Payment Settings,
// the new JSON structure will be stored.
// =========================================================

function parsePaymentSettings(
  value:
    unknown,
):
  PaymentDetailsSettings {
  // -------------------------------------------------------
  // Already using the new structure
  // -------------------------------------------------------

  const current =
    paymentDetailsSchema.safeParse(
      value,
    );


  if (
    current.success
  ) {
    return current.data;
  }


  // -------------------------------------------------------
  // Try legacy flat structure
  // -------------------------------------------------------

  if (
    !isRecord(
      value,
    )
  ) {
    return DEFAULT_PAYMENT_SETTINGS;
  }


  const hasLegacyFields =
    [
      "momoNumber",
      "momoAccountName",
      "bankName",
      "bankAccountNumber",
      "bankAccountName",
    ].some(
      (
        key,
      ) =>
        key in
        value,
    );


  if (
    !hasLegacyFields
  ) {
    return DEFAULT_PAYMENT_SETTINGS;
  }


  const momoNumber =
    stringValue(
      value,
      "momoNumber",
    );


  const momoAccountName =
    stringValue(
      value,
      "momoAccountName",
    );


  const bankName =
    stringValue(
      value,
      "bankName",
    );


  const bankAccountNumber =
    stringValue(
      value,
      "bankAccountNumber",
    );


  const bankAccountName =
    stringValue(
      value,
      "bankAccountName",
    );


  return {
    currencies: {
      GHS: {
        momo: {
          enabled:
            Boolean(
              momoNumber &&
              momoAccountName,
            ),

          number:
            momoNumber,

          accountName:
            momoAccountName,
        },

        bank: {
          enabled:
            Boolean(
              bankName &&
              bankAccountNumber &&
              bankAccountName,
            ),

          bankName,

          accountNumber:
            bankAccountNumber,

          accountName:
            bankAccountName,

          branch:
            "",

          swiftBic:
            "",

          instructions:
            "",
        },
      },


      USD: {
        ...DEFAULT_PAYMENT_SETTINGS
          .currencies
          .USD,
      },
    },
  };
}


// =========================================================
// GET SETTINGS
// =========================================================

export async function getSystemSettings():
  Promise<SystemSettings> {
  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "system_settings",
      )
      .select(`
        setting_key,
        setting_value
      `)
      .in(
        "setting_key",
        [
          "company_profile",
          "payment_details",
          "support_contacts",
          "request_notices",
        ],
      );


  if (
    error
  ) {
    console.error(
      "System settings query failed:",
      error,
    );


    return DEFAULT_SETTINGS;
  }


  const settings =
    new Map<
      string,
      unknown
    >(
      (
        data ??
        []
      ).map(
        (
          row:
            SettingRow,
        ) => [
          row.setting_key,
          row.setting_value,
        ],
      ),
    );


  return {
    company:
      parseSetting(
        settings.get(
          "company_profile",
        ),

        companyProfileSchema,

        DEFAULT_SETTINGS.company,
      ),


    payment:
      parsePaymentSettings(
        settings.get(
          "payment_details",
        ),
      ),


    support:
      parseSetting(
        settings.get(
          "support_contacts",
        ),

        supportContactsSchema,

        DEFAULT_SETTINGS.support,
      ),


    request:
      parseSetting(
        settings.get(
          "request_notices",
        ),

        requestNoticesSchema,

        DEFAULT_SETTINGS.request,
      ),
  };
}