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
  updateServicePricingSchema,
  type UpdateServicePricingInput,
} from "@/lib/validation/service-pricing";


export type ServicePricingActionResult = {
  success:
    boolean;

  error:
    string;
};


// =========================================================
// UPDATE SERVICE PRICING
// =========================================================

export async function updateServicePricing(
  serviceId:
    string,

  input:
    UpdateServicePricingInput,
): Promise<ServicePricingActionResult> {
  const admin =
    await requireSuperAdmin();


  const validation =
    updateServicePricingSchema.safeParse(
      input,
    );


  if (
    !validation.success
  ) {
    return {
      success:
        false,

      error:
        validation
          .error
          .issues[0]
          ?.message ??
        "Invalid pricing information.",
    };
  }


  const supabase =
    createAdminClient();


  // =======================================================
  // SERVICE MUST EXIST
  // =======================================================

  const {
    data:
      service,

    error:
      serviceError,
  } =
    await supabase
      .from(
        "services",
      )
      .select(`
        id,
        name,
        slug,
        service_scope
      `)
      .eq(
        "id",
        serviceId,
      )
      .maybeSingle();


  if (
    serviceError ||
    !service
  ) {
    return {
      success:
        false,

      error:
        "The service could not be found.",
    };
  }


  const {
    pricingMode,
    currency,
    amount,
    unitLabel,
    minimumQuantity,
    maximumQuantity,
    displayNote,
    active,
  } =
    validation.data;


  // =======================================================
  // NORMALIZE VALUES
  // =======================================================

  const storesAmount =
    pricingMode ===
      "FIXED" ||
    pricingMode ===
      "PER_UNIT" ||
    pricingMode ===
      "STARTING_FROM";


  const normalizedAmount =
    pricingMode ===
    "FREE"
      ? 0
      : storesAmount
        ? amount
        : null;


  const normalizedUnitLabel =
    pricingMode ===
    "PER_UNIT"
      ? unitLabel ||
        null
      : null;


  const normalizedMinimumQuantity =
    pricingMode ===
    "PER_UNIT"
      ? minimumQuantity
      : null;


  const normalizedMaximumQuantity =
    pricingMode ===
    "PER_UNIT"
      ? maximumQuantity
      : null;


  // =======================================================
  // UPSERT PRICING
  // =======================================================

  const {
    data:
      pricing,

    error:
      pricingError,
  } =
    await supabase
      .from(
        "service_pricing",
      )
      .upsert(
        {
          service_id:
            serviceId,

          pricing_mode:
            pricingMode,

          currency,

          amount:
            normalizedAmount,

          unit_label:
            normalizedUnitLabel,

          minimum_quantity:
            normalizedMinimumQuantity,

          maximum_quantity:
            normalizedMaximumQuantity,

          display_note:
            displayNote ||
            null,

          active,
        },
        {
          onConflict:
            "service_id",
        },
      )
      .select(`
        id,
        service_id,
        pricing_mode,
        currency,
        amount,
        unit_label,
        minimum_quantity,
        maximum_quantity,
        display_note,
        active
      `)
      .single();


  if (
    pricingError ||
    !pricing
  ) {
    console.error(
      "Service pricing update failed:",
      pricingError,
    );


    return {
      success:
        false,

      error:
        "The service pricing could not be saved.",
    };
  }


  // =======================================================
  // AUDIT
  // =======================================================

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
          admin.id,

        action:
          "SERVICE_PRICING_UPDATED",

        entity_type:
          "service",

        entity_id:
          serviceId,

        metadata: {
          service_name:
            service.name,

          service_slug:
            service.slug,

          service_scope:
            service.service_scope,

          pricing_mode:
            pricing.pricing_mode,

          currency:
            pricing.currency,

          amount:
            pricing.amount,

          unit_label:
            pricing.unit_label,

          minimum_quantity:
            pricing.minimum_quantity,

          maximum_quantity:
            pricing.maximum_quantity,

          display_note:
            pricing.display_note,

          pricing_active:
            pricing.active,
        },
      });


  if (
    auditError
  ) {
    console.error(
      "Service pricing audit failed:",
      auditError,
    );
  }


  // =======================================================
  // REVALIDATE
  // =======================================================

  revalidatePath(
    "/admin/services",
  );

  revalidatePath(
    `/admin/services/${serviceId}/pricing`,
  );

  revalidatePath(
    "/services",
  );

  revalidatePath(
    "/request",
  );


  return {
    success:
      true,

    error:
      "",
  };
}