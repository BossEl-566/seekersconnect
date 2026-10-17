import {
  NextResponse,
} from "next/server";

import {
  z,
} from "zod";

import {
  createAdminClient,
} from "@/lib/supabase/admin";


export const runtime =
  "nodejs";


// =========================================================
// VALIDATION
// =========================================================

const testimonialSubmissionSchema =
  z.object({
    customerName:
      z
        .string()
        .trim()
        .min(
          2,
          "Enter your name.",
        )
        .max(
          200,
        ),

    customerTitle:
      z
        .string()
        .trim()
        .max(
          200,
        )
        .default(
          "",
        ),

    organization:
      z
        .string()
        .trim()
        .max(
          250,
        )
        .default(
          "",
        ),

    testimonial:
      z
        .string()
        .trim()
        .min(
          10,
          "Please provide a little more detail in your testimonial.",
        )
        .max(
          3000,
        ),

    rating:
      z
        .number()
        .int()
        .min(
          1,
        )
        .max(
          5,
        )
        .nullable(),

    email:
      z
        .string()
        .trim()
        .email(
          "Enter a valid email address.",
        )
        .max(
          250,
        ),

    phone:
      z
        .string()
        .trim()
        .max(
          40,
        )
        .default(
          "",
        ),

    consent:
      z.literal(
        true,
        {
          error:
            "You must confirm that the testimonial may be reviewed for publication.",
        },
      ),

    // -----------------------------------------------------
    // Honeypot.
    // Human users never need to complete this field.
    // -----------------------------------------------------

    website:
      z
        .string()
        .max(
          500,
        )
        .default(
          "",
        ),
  });


// =========================================================
// POST
// =========================================================

export async function POST(
  request:
    Request,
) {
  let body:
    unknown;


  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        success:
          false,

        message:
          "Invalid testimonial submission.",
      },
      {
        status:
          400,
      },
    );
  }


  const parsed =
    testimonialSubmissionSchema.safeParse(
      body,
    );


  if (
    !parsed.success
  ) {
    return NextResponse.json(
      {
        success:
          false,

        message:
          parsed.error.issues[0]
            ?.message ??
          "Check the testimonial information and try again.",
      },
      {
        status:
          400,
      },
    );
  }


  const data =
    parsed.data;


  // =======================================================
  // HONEYPOT
  //
  // Return a normal-looking success response without writing
  // obvious automated spam.
  // =======================================================

  if (
    data.website
  ) {
    return NextResponse.json(
      {
        success:
          true,

        message:
          "Thank you. Your testimonial has been received for review.",
      },
      {
        status:
          201,
      },
    );
  }


  const supabase =
    createAdminClient();


  const {
    error,
  } =
    await supabase
      .from(
        "testimonials",
      )
      .insert({
        customer_name:
          data.customerName,

        customer_title:
          data.customerTitle ||
          null,

        organization:
          data.organization ||
          null,

        testimonial:
          data.testimonial,

        rating:
          data.rating,

        source:
          "PUBLIC",

        status:
          "PENDING",

        featured:
          false,

        customer_email:
          data.email,

        customer_phone:
          data.phone ||
          null,

        admin_note:
          null,

        moderated_by:
          null,

        moderated_at:
          null,

        created_by:
          null,
      });


  if (
    error
  ) {
    console.error(
      "Public testimonial submission failed:",
      error,
    );


    return NextResponse.json(
      {
        success:
          false,

        message:
          "Your testimonial could not be submitted. Please try again.",
      },
      {
        status:
          500,
      },
    );
  }


  return NextResponse.json(
    {
      success:
        true,

      message:
        "Thank you. Your testimonial has been received and will appear after review.",
    },
    {
      status:
        201,
    },
  );
}