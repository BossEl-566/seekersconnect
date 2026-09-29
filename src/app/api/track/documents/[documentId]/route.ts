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


type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};


type VerifiedTrackingResult = {
  documents?: {
    id: string;
  }[];
};


export async function POST(
  request: Request,
  context: RouteContext,
) {
  try {
    const {
      documentId,
    } = await context.params;


    const body =
      await request.json();


    const validation =
      trackingLookupSchema.safeParse(
        body,
      );


    if (
      !validation.success
    ) {
      return NextResponse.json(
        {
          message:
            "The tracking details could not be verified.",
        },
        {
          status: 400,
        },
      );
    }


    const {
      trackingNumber,
      trackingPin,
    } =
      validation.data;


    const supabase =
      createAdminClient();


    // -----------------------------------------------------
    // Re-verify customer credentials
    // -----------------------------------------------------

    const {
      data:
        trackingData,
      error:
        trackingError,
    } = await supabase.rpc(
      "verify_request_tracking",
      {
        p_tracking_number:
          trackingNumber,

        p_tracking_pin:
          trackingPin,
      },
    );


    if (
      trackingError ||
      !trackingData
    ) {
      return NextResponse.json(
        {
          message:
            "The tracking details could not be verified.",
        },
        {
          status: 404,
        },
      );
    }


    const verified =
      trackingData as
        VerifiedTrackingResult;


    // -----------------------------------------------------
    // Ensure this document belongs to the verified request
    // and is customer-visible.
    // -----------------------------------------------------

    const documentIsAllowed =
      verified.documents?.some(
        (document) =>
          document.id ===
          documentId,
      );


    if (
      !documentIsAllowed
    ) {
      return NextResponse.json(
        {
          message:
            "The document could not be found.",
        },
        {
          status: 404,
        },
      );
    }


    // -----------------------------------------------------
    // Retrieve the PRIVATE storage path server-side
    // -----------------------------------------------------

    const {
      data:
        documentRecord,
      error:
        documentError,
    } = await supabase
      .from(
        "request_documents",
      )
      .select(`
        id,
        storage_path,
        visible_to_customer
      `)
      .eq(
        "id",
        documentId,
      )
      .eq(
        "visible_to_customer",
        true,
      )
      .single();


    if (
      documentError ||
      !documentRecord
    ) {
      return NextResponse.json(
        {
          message:
            "The document could not be found.",
        },
        {
          status: 404,
        },
      );
    }


    // -----------------------------------------------------
    // Generate short-lived URL: 5 minutes
    // -----------------------------------------------------

    const {
      data:
        signedData,
      error:
        signedError,
    } = await supabase.storage
      .from(
        "request-documents",
      )
      .createSignedUrl(
        documentRecord.storage_path,
        60 * 5,
      );


    if (
      signedError ||
      !signedData
        ?.signedUrl
    ) {
      console.error(
        "Document signed URL failed:",
        signedError,
      );


      return NextResponse.json(
        {
          message:
            "The document could not be opened right now.",
        },
        {
          status: 500,
        },
      );
    }


    return NextResponse.json({
      success: true,

      url:
        signedData.signedUrl,

      expiresIn:
        300,
    });
  } catch (error) {
    console.error(
      "Customer document access failed:",
      error,
    );


    return NextResponse.json(
      {
        message:
          "Something went wrong while opening the document.",
      },
      {
        status: 500,
      },
    );
  }
}