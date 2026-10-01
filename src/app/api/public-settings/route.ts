import {
  NextResponse,
} from "next/server";

import {
  getSystemSettings,
} from "@/lib/settings/system-settings";


export const runtime =
  "nodejs";


export const dynamic =
  "force-dynamic";


export async function GET() {
  try {
    const settings =
      await getSystemSettings();


    return NextResponse.json(
      {
        success:
          true,

        settings,
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
      "Public settings request failed:",
      error,
    );


    return NextResponse.json(
      {
        success:
          false,

        message:
          "Settings could not be loaded.",
      },
      {
        status:
          500,
      },
    );
  }
}