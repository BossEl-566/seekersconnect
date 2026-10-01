import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  companyProfileSchema,
  paymentDetailsSchema,
  requestNoticesSchema,
  supportContactsSchema,
  type SystemSettings,
} from "@/lib/validation/system-settings";


// =========================================================
// SAFE FALLBACKS
//
// These are used only if a database setting is missing or
// malformed. Supabase remains the source of truth once the
// seeded settings exist.
// =========================================================

const DEFAULT_SETTINGS:
  SystemSettings = {
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


    payment: {
      momoNumber:
        "0550414522",

      momoAccountName:
        "Seekers Connect",

      bankName:
        "Stanbic Bank",

      bankAccountNumber:
        "9040014522640",

      bankAccountName:
        "Seekers Connect",
    },


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
// PARSE ONE SETTING SAFELY
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
// GET ALL PUBLIC/OPERATIONAL SETTINGS
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
      parseSetting(
        settings.get(
          "payment_details",
        ),

        paymentDetailsSchema,

        DEFAULT_SETTINGS.payment,
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