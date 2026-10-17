import {
  NextResponse,
} from "next/server";

import {
  getPublishedSitePage,
} from "@/lib/content/site-pages";


type RouteContext = {
  params:
    Promise<{
      slug:
        string;
    }>;
};


const PUBLIC_PAGE_SLUGS =
  new Set([
    "about",
    "privacy",
    "terms",
    "disclaimer",
  ]);


export async function GET(
  _request:
    Request,

  context:
    RouteContext,
) {
  const {
    slug,
  } =
    await context.params;


  if (
    !PUBLIC_PAGE_SLUGS.has(
      slug,
    )
  ) {
    return NextResponse.json(
      {
        success:
          false,

        message:
          "Page not found.",
      },
      {
        status:
          404,
      },
    );
  }


  const page =
    await getPublishedSitePage(
      slug,
    );


  if (
    !page
  ) {
    return NextResponse.json(
      {
        success:
          false,

        message:
          "Page not found.",
      },
      {
        status:
          404,
      },
    );
  }


  return NextResponse.json({
    success:
      true,

    page,
  });
}