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
    "Privacy Policy | Seekers Connect 247",
};


export default async function PrivacyPage() {
  const page =
    await getPublishedSitePage(
      "privacy",
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