import {
  randomUUID,
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


export const runtime =
  "nodejs";


type RouteContext = {
  params: Promise<{
    requestId: string;
  }>;
};


const MAX_FILE_SIZE =
  10 * 1024 * 1024;


const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);


const ALLOWED_DOCUMENT_TYPES =
  new Set([
    "SCANNED_TRANSCRIPT",
    "ATTESTATION",
    "PROFICIENCY_LETTER",
    "OTHER",
  ]);


function getExtension(
  mimeType: string,
) {
  switch (mimeType) {
    case "application/pdf":
      return "pdf";

    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    default:
      return null;
  }
}


export async function POST(
  request: Request,
  context: RouteContext,
) {
  let uploadedStoragePath:
    | string
    | null = null;

  try {
    // -----------------------------------------------------
    // Authenticate administrator
    // -----------------------------------------------------

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


    const formData =
      await request.formData();


    const documentFile =
      formData.get(
        "document",
      );


    const documentType =
      formData.get(
        "documentType",
      );


    // -----------------------------------------------------
    // Validate form fields
    // -----------------------------------------------------

    if (
      !(documentFile instanceof File)
    ) {
      return NextResponse.json(
        {
          message:
            "Select a document to upload.",
        },
        {
          status: 400,
        },
      );
    }


    if (
      typeof documentType !==
      "string"
    ) {
      return NextResponse.json(
        {
          message:
            "Select the type of document.",
        },
        {
          status: 400,
        },
      );
    }


    if (
      !ALLOWED_DOCUMENT_TYPES.has(
        documentType,
      )
    ) {
      return NextResponse.json(
        {
          message:
            "The selected document type is invalid.",
        },
        {
          status: 400,
        },
      );
    }


    if (
      !ALLOWED_TYPES.has(
        documentFile.type,
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Only PDF, JPEG and PNG documents are allowed.",
        },
        {
          status: 400,
        },
      );
    }


    if (
      documentFile.size === 0
    ) {
      return NextResponse.json(
        {
          message:
            "The selected document is empty.",
        },
        {
          status: 400,
        },
      );
    }


    if (
      documentFile.size >
      MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          message:
            "The document must not exceed 10 MB.",
        },
        {
          status: 400,
        },
      );
    }


    const supabase =
      createAdminClient();


    // -----------------------------------------------------
    // Verify request status before uploading
    // -----------------------------------------------------

    const {
      data: requestRecord,
      error: requestError,
    } = await supabase
      .from("requests")
      .select(`
        id,
        request_number,
        status
      `)
      .eq(
        "id",
        requestId,
      )
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


    if (
      requestRecord.status !==
      "DOCUMENT_READY"
    ) {
      return NextResponse.json(
        {
          message:
            "Documents can only be uploaded when the request is marked Document Ready.",
        },
        {
          status: 409,
        },
      );
    }


    // -----------------------------------------------------
    // Generate private storage path
    // -----------------------------------------------------

    const extension =
      getExtension(
        documentFile.type,
      );


    if (!extension) {
      return NextResponse.json(
        {
          message:
            "The document file type could not be determined.",
        },
        {
          status: 400,
        },
      );
    }


    uploadedStoragePath =
      `requests/${requestId}/${randomUUID()}.${extension}`;


    // -----------------------------------------------------
    // Upload private file
    // -----------------------------------------------------

    const fileBuffer =
      await documentFile.arrayBuffer();


    const {
      error: uploadError,
    } = await supabase.storage
      .from(
        "request-documents",
      )
      .upload(
        uploadedStoragePath,
        fileBuffer,
        {
          contentType:
            documentFile.type,

          upsert: false,
        },
      );


    if (uploadError) {
      console.error(
        "Document upload failed:",
        uploadError,
      );

      return NextResponse.json(
        {
          message:
            "The document could not be uploaded. Please try again.",
        },
        {
          status: 500,
        },
      );
    }


    // -----------------------------------------------------
    // Register DB record + advance workflow
    // -----------------------------------------------------

    const {
      data,
      error,
    } = await supabase.rpc(
      "register_scanned_document",
      {
        p_request_id:
          requestId,

        p_admin_id:
          admin.id,

        p_document_type:
          documentType,

        p_storage_path:
          uploadedStoragePath,

        p_original_filename:
          documentFile.name,

        p_mime_type:
          documentFile.type,

        p_size_bytes:
          documentFile.size,
      },
    );


    if (error) {
      console.error(
        "Document registration failed:",
        error,
      );


      // Remove uploaded file because DB transaction failed
      await supabase.storage
        .from(
          "request-documents",
        )
        .remove([
          uploadedStoragePath,
        ]);


      uploadedStoragePath =
        null;


      return NextResponse.json(
        {
          message:
            "The document could not be registered. Please try again.",
        },
        {
          status: 500,
        },
      );
    }


    const result =
      Array.isArray(data)
        ? data[0]
        : data;


    return NextResponse.json(
      {
        success: true,

        documentId:
          result?.document_id,

        status:
          result?.new_status ??
          "DOCUMENT_SCANNED",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Document upload request failed:",
      error,
    );


    // Best-effort cleanup
    if (
      uploadedStoragePath
    ) {
      try {
        const supabase =
          createAdminClient();

        await supabase.storage
          .from(
            "request-documents",
          )
          .remove([
            uploadedStoragePath,
          ]);
      } catch (
        cleanupError
      ) {
        console.error(
          "Document cleanup failed:",
          cleanupError,
        );
      }
    }


    return NextResponse.json(
      {
        message:
          "Something went wrong while uploading the document.",
      },
      {
        status: 500,
      },
    );
  }
}