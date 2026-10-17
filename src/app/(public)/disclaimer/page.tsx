import type {
  Metadata,
} from "next";

import {
  notFound,
} from "next/navigation";

import {
  SitePageView,
} from "@/components/public/site-page-view";

import {
  getPublishedSitePage,
} from "@/lib/content/site-pages";


export const metadata:
  Metadata =
{
  title:
    "Disclaimer | Seekers Connect 247",
};


export default async function DisclaimerPage() {
  const page =
    await getPublishedSitePage(
      "disclaimer",
    );


  if (
    !page
  ) {
    notFound();
  }


  return (
    <SitePageView
      page={
        page
      }
    />
  );
}