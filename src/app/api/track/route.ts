import {
  NextResponse,
} from "next/server";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  trackingLookupSchema,
} from "@/lib/validation/tracking";

export const runtime =
  "nodejs";

export async function POST(
  request: Request,
) {
  try {
    const body =
      await request.json();

    const validation =
      trackingLookupSchema.safeParse(
        body,
      );

    if (!validation.success) {
      return NextResponse.json(
        {
          message:
            "Enter a valid tracking number and 6-digit PIN.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      trackingNumber,
      trackingPin,
    } = validation.data;

    const supabase =
      createAdminClient();

    const {
      data,
      error,
    } = await supabase.rpc(
      "verify_request_tracking",
      {
        p_tracking_number:
          trackingNumber,

        p_tracking_pin:
          trackingPin,
      },
    );

    if (error) {
      console.error(
        "Tracking lookup failed:",
        error,
      );

      return NextResponse.json(
        {
          message:
            "We could not check your request right now. Please try again.",
        },
        {
          status: 500,
        },
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          message:
            "The tracking details could not be verified. Check your tracking number and PIN.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      tracking: data,
    });
  } catch (error) {
    console.error(
      "Tracking request failed:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while checking your request.",
      },
      {
        status: 500,
      },
    );
  }
}