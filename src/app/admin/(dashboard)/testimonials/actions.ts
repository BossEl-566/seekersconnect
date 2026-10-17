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


export type TestimonialStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ARCHIVED";


export type TestimonialActionResult = {
  success:
    boolean;

  error:
    string;
};


export type CreateTestimonialInput = {
  customerName:
    string;

  customerTitle:
    string;

  organization:
    string;

  testimonial:
    string;

  rating:
    number | null;

  featured:
    boolean;
};


// =========================================================
// CREATE ADMIN TESTIMONIAL
// =========================================================

export async function createAdminTestimonial(
  input:
    CreateTestimonialInput,
): Promise<TestimonialActionResult> {
  const admin =
    await requireSuperAdmin();


  const customerName =
    input.customerName
      .trim();


  const customerTitle =
    input.customerTitle
      .trim();


  const organization =
    input.organization
      .trim();


  const testimonial =
    input.testimonial
      .trim();


  if (
    !customerName
  ) {
    return {
      success:
        false,

      error:
        "Customer name is required.",
    };
  }


  if (
    testimonial.length <
    10
  ) {
    return {
      success:
        false,

      error:
        "The testimonial must contain at least 10 characters.",
    };
  }


  if (
    testimonial.length >
    3000
  ) {
    return {
      success:
        false,

      error:
        "The testimonial is too long.",
    };
  }


  if (
    input.rating !==
      null &&
    (
      !Number.isInteger(
        input.rating,
      ) ||
      input.rating <
        1 ||
      input.rating >
        5
    )
  ) {
    return {
      success:
        false,

      error:
        "Rating must be between 1 and 5.",
    };
  }


  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "testimonials",
      )
      .insert({
        customer_name:
          customerName,

        customer_title:
          customerTitle ||
          null,

        organization:
          organization ||
          null,

        testimonial,

        rating:
          input.rating,

        source:
          "ADMIN",

        status:
          "APPROVED",

        featured:
          input.featured,

        moderated_by:
          admin.id,

        moderated_at:
          new Date()
            .toISOString(),

        created_by:
          admin.id,
      })
      .select(
        "id",
      )
      .single();


  if (
    error ||
    !data
  ) {
    console.error(
      "Admin testimonial creation failed:",
      error,
    );


    return {
      success:
        false,

      error:
        "The testimonial could not be created.",
    };
  }


  await auditTestimonial({
    adminId:
      admin.id,

    testimonialId:
      data.id,

    action:
      "TESTIMONIAL_CREATED",

    metadata: {
      source:
        "ADMIN",

      featured:
        input.featured,
    },
  });


  revalidateTestimonials();


  return {
    success:
      true,

    error:
      "",
  };
}


// =========================================================
// MODERATE
// =========================================================

export async function moderateTestimonial(
  testimonialId:
    string,

  status:
    TestimonialStatus,

  adminNote =
    "",
): Promise<TestimonialActionResult> {
  const admin =
    await requireSuperAdmin();


  if (
    ![
      "PENDING",
      "APPROVED",
      "REJECTED",
      "ARCHIVED",
    ].includes(
      status,
    )
  ) {
    return {
      success:
        false,

      error:
        "Invalid testimonial status.",
    };
  }


  const supabase =
    createAdminClient();


  const updatePayload:
    Record<
      string,
      unknown
    > =
  {
    status,

    admin_note:
      adminNote.trim() ||
      null,
  };


  if (
    status ===
    "PENDING"
  ) {
    updatePayload.moderated_by =
      null;

    updatePayload.moderated_at =
      null;

    updatePayload.featured =
      false;
  } else {
    updatePayload.moderated_by =
      admin.id;

    updatePayload.moderated_at =
      new Date()
        .toISOString();


    if (
      status !==
      "APPROVED"
    ) {
      updatePayload.featured =
        false;
    }
  }


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "testimonials",
      )
      .update(
        updatePayload,
      )
      .eq(
        "id",
        testimonialId,
      )
      .select(
        "id, status",
      )
      .maybeSingle();


  if (
    error ||
    !data
  ) {
    console.error(
      "Testimonial moderation failed:",
      error,
    );


    return {
      success:
        false,

      error:
        "The testimonial status could not be changed.",
    };
  }


  await auditTestimonial({
    adminId:
      admin.id,

    testimonialId,

    action:
      "TESTIMONIAL_MODERATED",

    metadata: {
      status,
    },
  });


  revalidateTestimonials();


  return {
    success:
      true,

    error:
      "",
  };
}


// =========================================================
// FEATURE
// =========================================================

export async function setTestimonialFeatured(
  testimonialId:
    string,

  featured:
    boolean,
): Promise<TestimonialActionResult> {
  const admin =
    await requireSuperAdmin();


  const supabase =
    createAdminClient();


  const {
    data:
      testimonial,

    error:
      lookupError,
  } =
    await supabase
      .from(
        "testimonials",
      )
      .select(
        "id, status",
      )
      .eq(
        "id",
        testimonialId,
      )
      .maybeSingle();


  if (
    lookupError ||
    !testimonial
  ) {
    return {
      success:
        false,

      error:
        "The testimonial could not be found.",
    };
  }


  if (
    featured &&
    testimonial.status !==
      "APPROVED"
  ) {
    return {
      success:
        false,

      error:
        "Only approved testimonials can be featured.",
    };
  }


  const {
    error,
  } =
    await supabase
      .from(
        "testimonials",
      )
      .update({
        featured,
      })
      .eq(
        "id",
        testimonialId,
      );


  if (
    error
  ) {
    return {
      success:
        false,

      error:
        "The testimonial could not be updated.",
    };
  }


  await auditTestimonial({
    adminId:
      admin.id,

    testimonialId,

    action:
      featured
        ? "TESTIMONIAL_FEATURED"
        : "TESTIMONIAL_UNFEATURED",

    metadata: {
      featured,
    },
  });


  revalidateTestimonials();


  return {
    success:
      true,

    error:
      "",
  };
}


// =========================================================
// AUDIT
// =========================================================

async function auditTestimonial({
  adminId,
  testimonialId,
  action,
  metadata,
}: {
  adminId:
    string;

  testimonialId:
    string;

  action:
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
          "testimonial",

        entity_id:
          testimonialId,

        metadata,
      });


  if (
    error
  ) {
    console.error(
      "Testimonial audit failed:",
      error,
    );
  }
}


function revalidateTestimonials() {
  revalidatePath(
    "/admin/testimonials",
  );

  revalidatePath(
    "/",
  );

  revalidatePath(
    "/testimonials",
  );
}