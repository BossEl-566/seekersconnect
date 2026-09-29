import {
  randomBytes,
  randomInt,
} from "crypto";

import {
  NextResponse,
} from "next/server";

import {
  getCurrentAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    requestId: string;
  }>;
};

function createTrackingNumber(
  universityCode: string,
) {
  const suffix = randomBytes(5)
    .toString("hex")
    .toUpperCase();

  return `SC247-${universityCode}-${suffix}`;
}

function createTrackingPin() {
  return randomInt(
    100000,
    1000000,
  ).toString();
}

export async function POST(
  _request: Request,
  context: RouteContext,
) {
  try {
    const admin =
      await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json(
        {
          message:
            "You are not authorized to perform this action.",
        },
        {
          status: 401,
        },
      );
    }

    const {
      requestId,
    } = await context.params;

    const supabase =
      createAdminClient();

    const {
      data: requestRecord,
      error: requestError,
    } = await supabase
      .from("requests")
      .select(`
        id,
        request_number,
        status,
        universities (
          code
        )
      `)
      .eq("id", requestId)
      .single();

    if (
      requestError ||
      !requestRecord
    ) {
      return NextResponse.json(
        {
          message:
            "The request could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    const university =
      requestRecord.universities as unknown as
        | {
            code: string;
          }
        | null;

    if (!university?.code) {
      return NextResponse.json(
        {
          message:
            "The request university could not be determined.",
        },
        {
          status: 400,
        },
      );
    }

    const trackingNumber =
      createTrackingNumber(
        university.code,
      );

    const trackingPin =
      createTrackingPin();

    const {
      error,
    } = await supabase.rpc(
      "review_request_payment",
      {
        p_request_id:
          requestId,

        p_admin_id:
          admin.id,

        p_action:
          "CONFIRM",

        p_rejection_reason:
          null,

        p_tracking_number:
          trackingNumber,

        p_tracking_pin:
          trackingPin,
      },
    );

    if (error) {
      console.error(
        "Payment confirmation failed:",
        error,
      );

      return NextResponse.json(
        {
          message:
            "Payment could not be confirmed. Please try again.",
        },
        {
          status: 500,
        },
      );
    }

    /*
     * IMPORTANT:
     *
     * Do NOT call revalidatePath()
     * Do NOT call redirect()
     * Do NOT call router.refresh()
     *
     * The plaintext PIN only exists here
     * and in the response returned to this
     * admin screen.
     */

    return NextResponse.json({
      success: true,

      tracking: {
        number:
          trackingNumber,

        pin:
          trackingPin,
      },
    });
  } catch (error) {
    console.error(
      "Payment confirmation request failed:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Something went wrong while confirming the payment.",
      },
      {
        status: 500,
      },
    );
  }
}