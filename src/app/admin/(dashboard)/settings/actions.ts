"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  requireSuperAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  companyProfileSchema,
  paymentDetailsSchema,
  requestNoticesSchema,
  supportContactsSchema,
  type CompanyProfileSettings,
  type PaymentDetailsSettings,
  type RequestNoticesSettings,
  type SupportContactsSettings,
} from "@/lib/validation/system-settings";


export type SettingsActionResult = {
  success:
    boolean;

  error:
    string;
};


// =========================================================
// GENERIC STORAGE HELPER
// =========================================================

async function saveSetting({
  adminId,
  key,
  value,
  description,
}: {
  adminId:
    string;

  key:
    string;

  value:
    unknown;

  description:
    string;
}) {
  const supabase =
    createAdminClient();


  const {
    error:
      updateError,
  } =
    await supabase
      .from(
        "system_settings",
      )
      .upsert(
        {
          setting_key:
            key,

          setting_value:
            value,

          description,

          updated_by:
            adminId,

          updated_at:
            new Date()
              .toISOString(),
        },
        {
          onConflict:
            "setting_key",
        },
      );


  if (
    updateError
  ) {
    throw updateError;
  }


  const {
    error:
      auditError,
  } =
    await supabase
      .from(
        "activity_logs",
      )
      .insert({
        actor_id:
          adminId,

        action:
          "SYSTEM_SETTINGS_UPDATED",

        entity_type:
          "system_settings",

        entity_id:
          null,

        metadata: {
          setting_key:
            key,
        },
      });


  if (
    auditError
  ) {
    console.error(
      "System settings audit failed:",
      auditError,
    );
  }
}


// =========================================================
// REVALIDATE PAGES USING SETTINGS
// =========================================================

function refreshSettingsPages() {
  revalidatePath(
    "/admin/settings",
  );

  revalidatePath(
    "/",
  );

  revalidatePath(
    "/request",
  );

  revalidatePath(
    "/contact",
  );

  revalidatePath(
    "/track",
  );

  revalidatePath(
    "/services",
  );
}


// =========================================================
// COMPANY
// =========================================================

export async function updateCompanyProfile(
  input:
    CompanyProfileSettings,
): Promise<SettingsActionResult> {
  const admin =
    await requireSuperAdmin();


  const validation =
    companyProfileSchema.safeParse(
      input,
    );


  if (
    !validation.success
  ) {
    return {
      success:
        false,

      error:
        validation.error
          .issues[0]
          ?.message ??
        "Invalid company information.",
    };
  }


  try {
    await saveSetting({
      adminId:
        admin.id,

      key:
        "company_profile",

      value:
        validation.data,

      description:
        "Public company identity and contact information.",
    });


    refreshSettingsPages();


    return {
      success:
        true,

      error:
        "",
    };
  } catch (
    error
  ) {
    console.error(
      "Update company profile settings failed:",
      error,
    );


    return {
      success:
        false,

      error:
        "The company settings could not be saved.",
    };
  }
}


// =========================================================
// PAYMENT DETAILS
// =========================================================

export async function updatePaymentDetails(
  input:
    PaymentDetailsSettings,
): Promise<SettingsActionResult> {
  const admin =
    await requireSuperAdmin();


  const validation =
    paymentDetailsSchema.safeParse(
      input,
    );


  if (
    !validation.success
  ) {
    return {
      success:
        false,

      error:
        validation.error
          .issues[0]
          ?.message ??
        "Invalid payment information.",
    };
  }


  try {
    await saveSetting({
      adminId:
        admin.id,

      key:
        "payment_details",

      value:
        validation.data,

      description:
        "Public payment instructions used during request submission.",
    });


    refreshSettingsPages();


    return {
      success:
        true,

      error:
        "",
    };
  } catch (
    error
  ) {
    console.error(
      "Update payment settings failed:",
      error,
    );


    return {
      success:
        false,

      error:
        "The payment settings could not be saved.",
    };
  }
}


// =========================================================
// SUPPORT
// =========================================================

export async function updateSupportContacts(
  input:
    SupportContactsSettings,
): Promise<SettingsActionResult> {
  const admin =
    await requireSuperAdmin();


  const validation =
    supportContactsSchema.safeParse(
      input,
    );


  if (
    !validation.success
  ) {
    return {
      success:
        false,

      error:
        validation.error
          .issues[0]
          ?.message ??
        "Invalid support contact information.",
    };
  }


  try {
    await saveSetting({
      adminId:
        admin.id,

      key:
        "support_contacts",

      value:
        validation.data,

      description:
        "Public customer-support contact details.",
    });


    refreshSettingsPages();


    return {
      success:
        true,

      error:
        "",
    };
  } catch (
    error
  ) {
    console.error(
      "Update support settings failed:",
      error,
    );


    return {
      success:
        false,

      error:
        "The support settings could not be saved.",
    };
  }
}


// =========================================================
// REQUEST NOTICES
// =========================================================

export async function updateRequestNotices(
  input:
    RequestNoticesSettings,
): Promise<SettingsActionResult> {
  const admin =
    await requireSuperAdmin();


  const validation =
    requestNoticesSchema.safeParse(
      input,
    );


  if (
    !validation.success
  ) {
    return {
      success:
        false,

      error:
        validation.error
          .issues[0]
          ?.message ??
        "Invalid request notices.",
    };
  }


  try {
    await saveSetting({
      adminId:
        admin.id,

      key:
        "request_notices",

      value:
        validation.data,

      description:
        "Customer-facing notices used during the academic request workflow.",
    });


    refreshSettingsPages();


    return {
      success:
        true,

      error:
        "",
    };
  } catch (
    error
  ) {
    console.error(
      "Update request notice settings failed:",
      error,
    );


    return {
      success:
        false,

      error:
        "The request notices could not be saved.",
    };
  }
}