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
  pricingModeSupportsOptions,
  servicePricingOptionSchema,
  servicePricingTierSchema,
  type ServicePricingMode,
  type ServicePricingOptionInput,
  type ServicePricingTierInput,
} from "@/lib/validation/service-pricing";


export type PricingOptionActionResult = {
  success:
    boolean;

  error:
    string;
};


// =========================================================
// TYPES
// =========================================================

type PricingContext = {
  id:
    string;

  service_id:
    string;

  pricing_mode:
    ServicePricingMode;

  currency:
    string;

  unit_label:
    string | null;
};


// =========================================================
// CREATE OPTION
// =========================================================

export async function createPricingOption(
  serviceId:
    string,

  input:
    ServicePricingOptionInput,
): Promise<PricingOptionActionResult> {
  const admin =
    await requireSuperAdmin();


  const validation =
    servicePricingOptionSchema.safeParse(
      input,
    );


  if (
    !validation.success
  ) {
    return validationFailure(
      validation.error.issues[0]
        ?.message,
    );
  }


  const supabase =
    createAdminClient();


  const pricing =
    await getPricingContext(
      serviceId,
    );


  if (
    !pricing
  ) {
    return {
      success:
        false,

      error:
        "Save the main pricing configuration before creating pricing options.",
    };
  }


  if (
    !pricingModeSupportsOptions(
      pricing.pricing_mode,
    )
  ) {
    return {
      success:
        false,

      error:
        "Pricing options are only available for Fixed Price, Per Unit and Starting From services.",
    };
  }


  const value =
    validation.data;


  const code =
    slugify(
      value.code ||
      value.label,
    );


  if (
    !code
  ) {
    return {
      success:
        false,

      error:
        "Enter a valid option code or option name.",
    };
  }


  const unitLabel =
    pricing.pricing_mode ===
    "PER_UNIT"
      ? (
          value.unitLabel ||
          pricing.unit_label ||
          ""
        ).trim()
      : null;


  if (
    pricing.pricing_mode ===
      "PER_UNIT" &&
    !unitLabel
  ) {
    return {
      success:
        false,

      error:
        "A unit label is required for a per-unit pricing option.",
    };
  }


  const {
    data:
      option,

    error,
  } =
    await supabase
      .from(
        "service_pricing_options",
      )
      .insert({
        service_pricing_id:
          pricing.id,

        code,

        label:
          value.label,

        description:
          value.description ||
          null,

        unit_label:
          unitLabel,

        display_order:
          value.displayOrder,

        active:
          value.active,
      })
      .select(`
        id,
        code,
        label,
        display_order,
        active
      `)
      .single();


  if (
    error ||
    !option
  ) {
    console.error(
      "Create pricing option failed:",
      error,
    );


    return {
      success:
        false,

      error:
        friendlyDatabaseError(
          error?.message,
        ),
    };
  }


  await writeAudit({
    adminId:
      admin.id,

    action:
      "SERVICE_PRICING_OPTION_CREATED",

    serviceId,

    metadata: {
      option_id:
        option.id,

      option_code:
        option.code,

      option_label:
        option.label,

      display_order:
        option.display_order,

      active:
        option.active,
    },
  });


  revalidatePricing(
    serviceId,
  );


  return successResult();
}


// =========================================================
// UPDATE OPTION
// =========================================================

export async function updatePricingOption(
  serviceId:
    string,

  optionId:
    string,

  input:
    ServicePricingOptionInput,
): Promise<PricingOptionActionResult> {
  const admin =
    await requireSuperAdmin();


  const validation =
    servicePricingOptionSchema.safeParse(
      input,
    );


  if (
    !validation.success
  ) {
    return validationFailure(
      validation.error.issues[0]
        ?.message,
    );
  }


  const supabase =
    createAdminClient();


  const pricing =
    await getPricingContext(
      serviceId,
    );


  if (
    !pricing
  ) {
    return {
      success:
        false,

      error:
        "Pricing configuration could not be found.",
    };
  }


  if (
    !pricingModeSupportsOptions(
      pricing.pricing_mode,
    )
  ) {
    return {
      success:
        false,

      error:
        "The current pricing mode does not support options.",
    };
  }


  const existing =
    await getOwnedOption(
      pricing.id,
      optionId,
    );


  if (
    !existing
  ) {
    return {
      success:
        false,

      error:
        "Pricing option could not be found.",
    };
  }


  const value =
    validation.data;


  const code =
    slugify(
      value.code ||
      value.label,
    );


  if (
    !code
  ) {
    return {
      success:
        false,

      error:
        "Enter a valid option code or option name.",
    };
  }


  const unitLabel =
    pricing.pricing_mode ===
    "PER_UNIT"
      ? (
          value.unitLabel ||
          pricing.unit_label ||
          ""
        ).trim()
      : null;


  if (
    pricing.pricing_mode ===
      "PER_UNIT" &&
    !unitLabel
  ) {
    return {
      success:
        false,

      error:
        "A unit label is required for a per-unit pricing option.",
    };
  }


  const {
    data:
      updated,

    error,
  } =
    await supabase
      .from(
        "service_pricing_options",
      )
      .update({
        code,

        label:
          value.label,

        description:
          value.description ||
          null,

        unit_label:
          unitLabel,

        display_order:
          value.displayOrder,

        active:
          value.active,
      })
      .eq(
        "id",
        optionId,
      )
      .eq(
        "service_pricing_id",
        pricing.id,
      )
      .select(`
        id,
        code,
        label,
        display_order,
        active
      `)
      .maybeSingle();


  if (
    error ||
    !updated
  ) {
    console.error(
      "Update pricing option failed:",
      error,
    );


    return {
      success:
        false,

      error:
        friendlyDatabaseError(
          error?.message,
        ),
    };
  }


  await writeAudit({
    adminId:
      admin.id,

    action:
      "SERVICE_PRICING_OPTION_UPDATED",

    serviceId,

    metadata: {
      option_id:
        updated.id,

      option_code:
        updated.code,

      option_label:
        updated.label,

      display_order:
        updated.display_order,

      active:
        updated.active,
    },
  });


  revalidatePricing(
    serviceId,
  );


  return successResult();
}


// =========================================================
// OPTION ACTIVE
// =========================================================

export async function setPricingOptionActive(
  serviceId:
    string,

  optionId:
    string,

  active:
    boolean,
): Promise<PricingOptionActionResult> {
  const admin =
    await requireSuperAdmin();


  const supabase =
    createAdminClient();


  const pricing =
    await getPricingContext(
      serviceId,
    );


  if (
    !pricing
  ) {
    return {
      success:
        false,

      error:
        "Pricing configuration could not be found.",
    };
  }


  const existing =
    await getOwnedOption(
      pricing.id,
      optionId,
    );


  if (
    !existing
  ) {
    return {
      success:
        false,

      error:
        "Pricing option could not be found.",
    };
  }


  const {
    error,
  } =
    await supabase
      .from(
        "service_pricing_options",
      )
      .update({
        active,
      })
      .eq(
        "id",
        optionId,
      )
      .eq(
        "service_pricing_id",
        pricing.id,
      );


  if (
    error
  ) {
    console.error(
      "Pricing option status update failed:",
      error,
    );


    return {
      success:
        false,

      error:
        friendlyDatabaseError(
          error.message,
        ),
    };
  }


  await writeAudit({
    adminId:
      admin.id,

    action:
      active
        ? "SERVICE_PRICING_OPTION_ENABLED"
        : "SERVICE_PRICING_OPTION_DISABLED",

    serviceId,

    metadata: {
      option_id:
        optionId,

      option_label:
        existing.label,

      active,
    },
  });


  revalidatePricing(
    serviceId,
  );


  return successResult();
}


// =========================================================
// DELETE OPTION
// =========================================================

export async function deletePricingOption(
  serviceId:
    string,

  optionId:
    string,
): Promise<PricingOptionActionResult> {
  const admin =
    await requireSuperAdmin();


  const supabase =
    createAdminClient();


  const pricing =
    await getPricingContext(
      serviceId,
    );


  if (
    !pricing
  ) {
    return {
      success:
        false,

      error:
        "Pricing configuration could not be found.",
    };
  }


  const existing =
    await getOwnedOption(
      pricing.id,
      optionId,
    );


  if (
    !existing
  ) {
    return {
      success:
        false,

      error:
        "Pricing option could not be found.",
    };
  }


  const {
    error,
  } =
    await supabase
      .from(
        "service_pricing_options",
      )
      .delete()
      .eq(
        "id",
        optionId,
      )
      .eq(
        "service_pricing_id",
        pricing.id,
      );


  if (
    error
  ) {
    console.error(
      "Delete pricing option failed:",
      error,
    );


    return {
      success:
        false,

      error:
        "The pricing option could not be deleted.",
    };
  }


  await writeAudit({
    adminId:
      admin.id,

    action:
      "SERVICE_PRICING_OPTION_DELETED",

    serviceId,

    metadata: {
      option_id:
        optionId,

      option_code:
        existing.code,

      option_label:
        existing.label,
    },
  });


  revalidatePricing(
    serviceId,
  );


  return successResult();
}


// =========================================================
// CREATE TIER
// =========================================================

export async function createPricingTier(
  serviceId:
    string,

  optionId:
    string,

  input:
    ServicePricingTierInput,
): Promise<PricingOptionActionResult> {
  const admin =
    await requireSuperAdmin();


  const validation =
    servicePricingTierSchema.safeParse(
      input,
    );


  if (
    !validation.success
  ) {
    return validationFailure(
      validation.error.issues[0]
        ?.message,
    );
  }


  const supabase =
    createAdminClient();


  const pricing =
    await getPricingContext(
      serviceId,
    );


  if (
    !pricing
  ) {
    return {
      success:
        false,

      error:
        "Pricing configuration could not be found.",
    };
  }


  if (
    !pricingModeSupportsOptions(
      pricing.pricing_mode,
    )
  ) {
    return {
      success:
        false,

      error:
        "The current pricing mode does not support price tiers.",
    };
  }


  const option =
    await getOwnedOption(
      pricing.id,
      optionId,
    );


  if (
    !option
  ) {
    return {
      success:
        false,

      error:
        "Pricing option could not be found.",
    };
  }


  const value =
    validation.data;


  if (
    pricing.pricing_mode ===
      "PER_UNIT" &&
    value.minimumQuantity ===
      null
  ) {
    return {
      success:
        false,

      error:
        "Minimum quantity is required for a per-unit pricing tier.",
    };
  }


  const minimumQuantity =
    pricing.pricing_mode ===
    "PER_UNIT"
      ? value.minimumQuantity
      : null;


  const maximumQuantity =
    pricing.pricing_mode ===
    "PER_UNIT"
      ? value.maximumQuantity
      : null;


  const {
    data:
      tier,

    error,
  } =
    await supabase
      .from(
        "service_pricing_tiers",
      )
      .insert({
        pricing_option_id:
          optionId,

        label:
          value.label ||
          null,

        amount:
          value.amount,

        minimum_quantity:
          minimumQuantity,

        maximum_quantity:
          maximumQuantity,

        display_order:
          value.displayOrder,

        active:
          value.active,
      })
      .select(`
        id,
        label,
        amount,
        minimum_quantity,
        maximum_quantity,
        display_order,
        active
      `)
      .single();


  if (
    error ||
    !tier
  ) {
    console.error(
      "Create pricing tier failed:",
      error,
    );


    return {
      success:
        false,

      error:
        friendlyDatabaseError(
          error?.message,
        ),
    };
  }


  await writeAudit({
    adminId:
      admin.id,

    action:
      "SERVICE_PRICING_TIER_CREATED",

    serviceId,

    metadata: {
      option_id:
        optionId,

      option_label:
        option.label,

      tier_id:
        tier.id,

      tier_label:
        tier.label,

      amount:
        tier.amount,

      minimum_quantity:
        tier.minimum_quantity,

      maximum_quantity:
        tier.maximum_quantity,

      display_order:
        tier.display_order,

      active:
        tier.active,
    },
  });


  revalidatePricing(
    serviceId,
  );


  return successResult();
}


// =========================================================
// UPDATE TIER
// =========================================================

export async function updatePricingTier(
  serviceId:
    string,

  optionId:
    string,

  tierId:
    string,

  input:
    ServicePricingTierInput,
): Promise<PricingOptionActionResult> {
  const admin =
    await requireSuperAdmin();


  const validation =
    servicePricingTierSchema.safeParse(
      input,
    );


  if (
    !validation.success
  ) {
    return validationFailure(
      validation.error.issues[0]
        ?.message,
    );
  }


  const supabase =
    createAdminClient();


  const pricing =
    await getPricingContext(
      serviceId,
    );


  if (
    !pricing
  ) {
    return {
      success:
        false,

      error:
        "Pricing configuration could not be found.",
    };
  }


  const option =
    await getOwnedOption(
      pricing.id,
      optionId,
    );


  if (
    !option
  ) {
    return {
      success:
        false,

      error:
        "Pricing option could not be found.",
    };
  }


  const tier =
    await getOwnedTier(
      optionId,
      tierId,
    );


  if (
    !tier
  ) {
    return {
      success:
        false,

      error:
        "Pricing tier could not be found.",
    };
  }


  const value =
    validation.data;


  if (
    pricing.pricing_mode ===
      "PER_UNIT" &&
    value.minimumQuantity ===
      null
  ) {
    return {
      success:
        false,

      error:
        "Minimum quantity is required for a per-unit pricing tier.",
    };
  }


  const {
    error,
  } =
    await supabase
      .from(
        "service_pricing_tiers",
      )
      .update({
        label:
          value.label ||
          null,

        amount:
          value.amount,

        minimum_quantity:
          pricing.pricing_mode ===
          "PER_UNIT"
            ? value.minimumQuantity
            : null,

        maximum_quantity:
          pricing.pricing_mode ===
          "PER_UNIT"
            ? value.maximumQuantity
            : null,

        display_order:
          value.displayOrder,

        active:
          value.active,
      })
      .eq(
        "id",
        tierId,
      )
      .eq(
        "pricing_option_id",
        optionId,
      );


  if (
    error
  ) {
    console.error(
      "Update pricing tier failed:",
      error,
    );


    return {
      success:
        false,

      error:
        friendlyDatabaseError(
          error.message,
        ),
    };
  }


  await writeAudit({
    adminId:
      admin.id,

    action:
      "SERVICE_PRICING_TIER_UPDATED",

    serviceId,

    metadata: {
      option_id:
        optionId,

      tier_id:
        tierId,

      tier_label:
        value.label,

      amount:
        value.amount,

      minimum_quantity:
        value.minimumQuantity,

      maximum_quantity:
        value.maximumQuantity,

      display_order:
        value.displayOrder,

      active:
        value.active,
    },
  });


  revalidatePricing(
    serviceId,
  );


  return successResult();
}


// =========================================================
// TIER ACTIVE
// =========================================================

export async function setPricingTierActive(
  serviceId:
    string,

  optionId:
    string,

  tierId:
    string,

  active:
    boolean,
): Promise<PricingOptionActionResult> {
  const admin =
    await requireSuperAdmin();


  const supabase =
    createAdminClient();


  const pricing =
    await getPricingContext(
      serviceId,
    );


  if (
    !pricing
  ) {
    return {
      success:
        false,

      error:
        "Pricing configuration could not be found.",
    };
  }


  const option =
    await getOwnedOption(
      pricing.id,
      optionId,
    );


  if (
    !option
  ) {
    return {
      success:
        false,

      error:
        "Pricing option could not be found.",
    };
  }


  const tier =
    await getOwnedTier(
      optionId,
      tierId,
    );


  if (
    !tier
  ) {
    return {
      success:
        false,

      error:
        "Pricing tier could not be found.",
    };
  }


  const {
    error,
  } =
    await supabase
      .from(
        "service_pricing_tiers",
      )
      .update({
        active,
      })
      .eq(
        "id",
        tierId,
      )
      .eq(
        "pricing_option_id",
        optionId,
      );


  if (
    error
  ) {
    console.error(
      "Pricing tier status update failed:",
      error,
    );


    return {
      success:
        false,

      error:
        friendlyDatabaseError(
          error.message,
        ),
    };
  }


  await writeAudit({
    adminId:
      admin.id,

    action:
      active
        ? "SERVICE_PRICING_TIER_ENABLED"
        : "SERVICE_PRICING_TIER_DISABLED",

    serviceId,

    metadata: {
      option_id:
        optionId,

      tier_id:
        tierId,

      tier_label:
        tier.label,

      active,
    },
  });


  revalidatePricing(
    serviceId,
  );


  return successResult();
}


// =========================================================
// DELETE TIER
// =========================================================

export async function deletePricingTier(
  serviceId:
    string,

  optionId:
    string,

  tierId:
    string,
): Promise<PricingOptionActionResult> {
  const admin =
    await requireSuperAdmin();


  const supabase =
    createAdminClient();


  const pricing =
    await getPricingContext(
      serviceId,
    );


  if (
    !pricing
  ) {
    return {
      success:
        false,

      error:
        "Pricing configuration could not be found.",
    };
  }


  const option =
    await getOwnedOption(
      pricing.id,
      optionId,
    );


  if (
    !option
  ) {
    return {
      success:
        false,

      error:
        "Pricing option could not be found.",
    };
  }


  const tier =
    await getOwnedTier(
      optionId,
      tierId,
    );


  if (
    !tier
  ) {
    return {
      success:
        false,

      error:
        "Pricing tier could not be found.",
    };
  }


  const {
    error,
  } =
    await supabase
      .from(
        "service_pricing_tiers",
      )
      .delete()
      .eq(
        "id",
        tierId,
      )
      .eq(
        "pricing_option_id",
        optionId,
      );


  if (
    error
  ) {
    console.error(
      "Delete pricing tier failed:",
      error,
    );


    return {
      success:
        false,

      error:
        "The pricing tier could not be deleted.",
    };
  }


  await writeAudit({
    adminId:
      admin.id,

    action:
      "SERVICE_PRICING_TIER_DELETED",

    serviceId,

    metadata: {
      option_id:
        optionId,

      tier_id:
        tierId,

      tier_label:
        tier.label,

      amount:
        tier.amount,
    },
  });


  revalidatePricing(
    serviceId,
  );


  return successResult();
}


// =========================================================
// HELPERS
// =========================================================

async function getPricingContext(
  serviceId:
    string,
): Promise<PricingContext | null> {
  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "service_pricing",
      )
      .select(`
        id,
        service_id,
        pricing_mode,
        currency,
        unit_label
      `)
      .eq(
        "service_id",
        serviceId,
      )
      .maybeSingle();


  if (
    error ||
    !data
  ) {
    if (
      error
    ) {
      console.error(
        "Pricing context lookup failed:",
        error,
      );
    }


    return null;
  }


  return {
    id:
      data.id,

    service_id:
      data.service_id,

    pricing_mode:
      data
        .pricing_mode as ServicePricingMode,

    currency:
      data.currency,

    unit_label:
      data.unit_label,
  };
}


async function getOwnedOption(
  pricingId:
    string,

  optionId:
    string,
) {
  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "service_pricing_options",
      )
      .select(`
        id,
        service_pricing_id,
        code,
        label,
        unit_label,
        active
      `)
      .eq(
        "id",
        optionId,
      )
      .eq(
        "service_pricing_id",
        pricingId,
      )
      .maybeSingle();


  if (
    error
  ) {
    console.error(
      "Pricing option lookup failed:",
      error,
    );


    return null;
  }


  return data;
}


async function getOwnedTier(
  optionId:
    string,

  tierId:
    string,
) {
  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "service_pricing_tiers",
      )
      .select(`
        id,
        pricing_option_id,
        label,
        amount,
        active
      `)
      .eq(
        "id",
        tierId,
      )
      .eq(
        "pricing_option_id",
        optionId,
      )
      .maybeSingle();


  if (
    error
  ) {
    console.error(
      "Pricing tier lookup failed:",
      error,
    );


    return null;
  }


  return data;
}


function slugify(
  value:
    string,
) {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9_-]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}


function friendlyDatabaseError(
  message:
    string | undefined,
) {
  const normalized =
    (
      message ??
      ""
    ).toLowerCase();


  if (
    normalized.includes(
      "overlaps another active pricing tier",
    )
  ) {
    return "This quantity range overlaps another active pricing tier.";
  }


  if (
    normalized.includes(
      "can only have one active price",
    )
  ) {
    return "This option can only have one active price for the current pricing mode.";
  }


  if (
    normalized.includes(
      "duplicate key",
    ) ||
    normalized.includes(
      "unique constraint",
    )
  ) {
    return "Another pricing option already uses this code.";
  }


  if (
    normalized.includes(
      "minimum quantity is required",
    )
  ) {
    return "Minimum quantity is required for a per-unit pricing tier.";
  }


  return (
    message ||
    "The pricing change could not be saved."
  );
}


async function writeAudit({
  adminId,
  action,
  serviceId,
  metadata,
}: {
  adminId:
    string;

  action:
    string;

  serviceId:
    string;

  metadata:
    Record<
      string,
      unknown
    >;
}) {
  const supabase =
    createAdminClient();


  const {
    error,
  } =
    await supabase
      .from(
        "activity_logs",
      )
      .insert({
        actor_id:
          adminId,

        action,

        entity_type:
          "service",

        entity_id:
          serviceId,

        metadata,
      });


  if (
    error
  ) {
    console.error(
      `${action} audit failed:`,
      error,
    );
  }
}


function revalidatePricing(
  serviceId:
    string,
) {
  revalidatePath(
    "/admin/services",
  );

  revalidatePath(
    `/admin/services/${serviceId}/pricing`,
  );

  revalidatePath(
    "/request",
  );

  revalidatePath(
    "/services",
  );
}


function validationFailure(
  message:
    string | undefined,
): PricingOptionActionResult {
  return {
    success:
      false,

    error:
      message ||
      "Invalid pricing information.",
  };
}


function successResult():
  PricingOptionActionResult {
  return {
    success:
      true,

    error:
      "",
  };
}