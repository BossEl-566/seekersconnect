import {
  createHash,
} from "crypto";

import {
  NextResponse,
} from "next/server";

import {
  createAdminClient,
} from "@/lib/supabase/admin";


export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";


function hashToken(
  token:
    string,
) {
  return createHash(
    "sha256",
  )
    .update(
      token,
    )
    .digest(
      "hex",
    );
}


function validToken(
  value:
    unknown,
): value is string {
  return (
    typeof value ===
      "string" &&
    /^[0-9a-f]{64}$/i.test(
      value,
    )
  );
}


export async function POST(
  request:
    Request,
) {
  try {
    const body =
      await request.json();


    if (
      !validToken(
        body?.token,
      )
    ) {
      return NextResponse.json(
        {
          message:
            "This payment link is invalid or no longer available.",
        },
        {
          status:
            404,
        },
      );
    }


    const tokenHash =
      hashToken(
        body.token,
      );


    const supabase =
      createAdminClient();


    const {
      data,
      error,
    } =
      await supabase
        .from(
          "requests",
        )
        .select(`
          id,
          request_number,
          status,

          pricing_mode_snapshot,
          pricing_currency_snapshot,
          pricing_total_snapshot,
          pricing_note_snapshot,

          payment_access_used_at,

          services (
            name,
            short_name
          )
        `)
        .eq(
          "payment_access_token_hash",
          tokenHash,
        )
        .eq(
          "status",
          "AWAITING_PAYMENT",
        )
        .is(
          "payment_access_used_at",
          null,
        )
        .maybeSingle();


    if (
      error
    ) {
      console.error(
        "Payment access lookup failed:",
        error,
      );


      return NextResponse.json(
        {
          message:
            "We could not load this payment request right now.",
        },
        {
          status:
            500,
        },
      );
    }


    if (
      !data
    ) {
      return NextResponse.json(
        {
          message:
            "This payment link is invalid, expired or has already been used.",
        },
        {
          status:
            404,
        },
      );
    }


    const totalAmount =
      Number(
        data.pricing_total_snapshot,
      );


    if (
      !Number.isFinite(
        totalAmount,
      ) ||
      totalAmount <=
        0
    ) {
      return NextResponse.json(
        {
          message:
            "This request does not currently have a valid payment amount.",
        },
        {
          status:
            409,
        },
      );
    }


    const serviceRelation =
      data.services;


    const service =
      Array.isArray(
        serviceRelation,
      )
        ? serviceRelation[0]
        : serviceRelation;


    return NextResponse.json(
      {
        success:
          true,

        payment: {
          requestNumber:
            data.request_number,

          serviceName:
            service?.name ??
            "Seekers Connect Service",

          serviceShortName:
            service?.short_name ??
            service?.name ??
            "Service",

          pricingMode:
            data.pricing_mode_snapshot ??
            "MANUAL_PRICE",

          currency:
            data.pricing_currency_snapshot ??
            "GHS",

          totalAmount,

          displayNote:
            data.pricing_note_snapshot ??
            null,
        },
      },
      {
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (
    error
  ) {
    console.error(
      "Payment lookup request failed:",
      error,
    );


    return NextResponse.json(
      {
        message:
          "Something went wrong while loading the payment request.",
      },
      {
        status:
          500,
      },
    );
  }
}