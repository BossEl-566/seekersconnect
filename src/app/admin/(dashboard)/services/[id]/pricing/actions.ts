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
  // PROTECT EXISTING OPTIONS FROM MODE CHANGES
  //
  // A PER_UNIT option/tier structure cannot simply become a
  // FIXED structure, and vice versa, without redefining its
  // tiers.
  // =======================================================

  const {
    data:
      existingPricing,

    error:
      existingPricingError,
  } =
    await supabase
      .from(
        "service_pricing",
      )
      .select(`
        id,
        pricing_mode
      `)
      .eq(
        "service_id",
        serviceId,
      )
      .maybeSingle();


  if (
    existingPricingError
  ) {
    console.error(
      "Existing service pricing lookup failed:",
      existingPricingError,
    );


    return {
      success:
        false,

      error:
        "The current pricing configuration could not be checked.",
    };
  }


  if (
    existingPricing &&
    existingPricing.pricing_mode !==
      pricingMode
  ) {
    const {
      count,
      error:
        optionCountError,
    } =
      await supabase
        .from(
          "service_pricing_options",
        )
        .select(
          "id",
          {
            count:
              "exact",

            head:
              true,
          },
        )
        .eq(
          "service_pricing_id",
          existingPricing.id,
        );


    if (
      optionCountError
    ) {
      console.error(
        "Pricing option count failed:",
        optionCountError,
      );


      return {
        success:
          false,

        error:
          "Pricing options could not be checked before changing the pricing mode.",
      };
    }


    if (
      (
        count ??
        0
      ) >
      0
    ) {
      return {
        success:
          false,

        error:
          "This service already has pricing options. Delete the pricing options before changing the pricing mode.",
      };
    }
  }


  // =======================================================
  // NORMALIZE
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
  // UPSERT
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


  revalidatePricing(
    serviceId,
  );


  return {
    success:
      true,

    error:
      "",
  };
}


// =========================================================
// REVALIDATE
// =========================================================

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
    "/services",
  );

  revalidatePath(
    "/request",
  );
}