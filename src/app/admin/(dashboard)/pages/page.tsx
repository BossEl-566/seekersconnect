import {
  requireSuperAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  SitePagesManager,
  type AdminSitePage,
} from "@/components/admin/site-pages-manager";


export default async function AdminPagesPage() {
  await requireSuperAdmin();


  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "site_pages",
      )
      .select(`
        id,
        slug,
        title,
        eyebrow,
        summary,
        content,
        status,
        version,
        seo_title,
        seo_description,
        updated_at
      `)
      .in(
        "slug",
        [
          "about",
          "privacy",
          "terms",
          "disclaimer",
        ],
      )
      .order(
        "slug",
        {
          ascending:
            true,
        },
      );


  if (
    error
  ) {
    console.error(
      "Admin site pages query failed:",
      error,
    );
  }


  return (
    <>
      <div>
        <p className="text-sm font-medium text-blue-600">
          Website Content
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          Pages
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage the About page and customer-facing legal policies.
          Terms version changes are recorded against future requests.
        </p>
      </div>


      <div className="mt-7">
        <SitePagesManager
          pages={
            (
              data ??
              []
            ) as AdminSitePage[]
          }
        />
      </div>
    </>
  );
}