"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  CheckCircle2,
  FileText,
  Loader2,
  Save,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  updateSitePage,
  type SitePageStatus,
} from "@/app/admin/(dashboard)/pages/actions";


export type AdminSitePage = {
  id:
    string;

  slug:
    string;

  title:
    string;

  eyebrow:
    string | null;

  summary:
    string | null;

  content:
    string;

  status:
    SitePageStatus;

  version:
    number;

  seo_title:
    string | null;

  seo_description:
    string | null;

  updated_at:
    string;
};


export function SitePagesManager({
  pages,
}: {
  pages:
    AdminSitePage[];
}) {
  const router =
    useRouter();


  const first =
    pages[0] ??
    null;


  const [
    selectedId,
    setSelectedId,
  ] =
    useState(
      first?.id ??
      "",
    );


  const [
    title,
    setTitle,
  ] =
    useState(
      first?.title ??
      "",
    );


  const [
    eyebrow,
    setEyebrow,
  ] =
    useState(
      first?.eyebrow ??
      "",
    );


  const [
    summary,
    setSummary,
  ] =
    useState(
      first?.summary ??
      "",
    );


  const [
    content,
    setContent,
  ] =
    useState(
      first?.content ??
      "",
    );


  const [
    status,
    setStatus,
  ] =
    useState<SitePageStatus>(
      first?.status ??
      "DRAFT",
    );


  const [
    seoTitle,
    setSeoTitle,
  ] =
    useState(
      first?.seo_title ??
      "",
    );


  const [
    seoDescription,
    setSeoDescription,
  ] =
    useState(
      first?.seo_description ??
      "",
    );


  const [
    bumpTermsVersion,
    setBumpTermsVersion,
  ] =
    useState(
      first?.slug ===
        "terms",
    );


  const [
    error,
    setError,
  ] =
    useState(
      "",
    );


  const [
    success,
    setSuccess,
  ] =
    useState(
      "",
    );


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  const selectedPage =
    pages.find(
      (
        page,
      ) =>
        page.id ===
        selectedId,
    ) ??
    null;


  function selectPage(
    page:
      AdminSitePage,
  ) {
    setSelectedId(
      page.id,
    );

    setTitle(
      page.title,
    );

    setEyebrow(
      page.eyebrow ??
      "",
    );

    setSummary(
      page.summary ??
      "",
    );

    setContent(
      page.content,
    );

    setStatus(
      page.status,
    );

    setSeoTitle(
      page.seo_title ??
      "",
    );

    setSeoDescription(
      page.seo_description ??
      "",
    );

    setBumpTermsVersion(
      page.slug ===
      "terms",
    );

    setError(
      "",
    );

    setSuccess(
      "",
    );
  }


  function save() {
    if (
      !selectedPage
    ) {
      return;
    }


    setError(
      "",
    );

    setSuccess(
      "",
    );


    startTransition(
      async () => {
        const result =
          await updateSitePage({
            id:
              selectedPage.id,

            slug:
              selectedPage.slug,

            title,

            eyebrow,

            summary,

            content,

            status,

            seoTitle,

            seoDescription,

            bumpTermsVersion:
              selectedPage.slug ===
                "terms"
                ? bumpTermsVersion
                : false,
          });


        if (
          !result.success
        ) {
          setError(
            result.error,
          );

          return;
        }


        setSuccess(
          selectedPage.slug ===
            "terms" &&
          bumpTermsVersion
            ? `Terms saved as version ${result.version}.`
            : "Page saved successfully.",
        );


        if (
          selectedPage.slug ===
          "terms"
        ) {
          setBumpTermsVersion(
            false,
          );
        }


        router.refresh();
      },
    );
  }


  return (
    <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
      <section className="h-fit rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
        <p className="px-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          Website Pages
        </p>


        <div className="mt-3 space-y-2">
          {pages.map(
            (
              page,
            ) => (
              <button
                key={
                  page.id
                }
                type="button"
                onClick={() =>
                  selectPage(
                    page,
                  )
                }
                className={`w-full rounded-xl border p-4 text-left ${
                  selectedId ===
                  page.id
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-blue-600" />

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {
                        page.title
                      }
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      /
                      {
                        page.slug
                      }

                      {page.slug ===
                        "terms" &&
                        ` · v${page.version}`}
                    </p>
                  </div>
                </div>
              </button>
            ),
          )}
        </div>
      </section>


      {selectedPage && (
        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                /
                {
                  selectedPage.slug
                }
              </p>

              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                {
                  selectedPage.title
                }
              </h2>
            </div>


            <button
              type="button"
              onClick={
                save
              }
              disabled={
                pending
              }
              className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}

              Save Page
            </button>
          </div>


          <div className="mt-6 space-y-5">
            <EditorField label="Title">
              <input
                value={
                  title
                }
                onChange={(
                  event,
                ) =>
                  setTitle(
                    event.target
                      .value,
                  )
                }
                className="site-editor-input"
              />
            </EditorField>


            <EditorField label="Eyebrow">
              <input
                value={
                  eyebrow
                }
                onChange={(
                  event,
                ) =>
                  setEyebrow(
                    event.target
                      .value,
                  )
                }
                className="site-editor-input"
              />
            </EditorField>


            <EditorField label="Summary">
              <textarea
                value={
                  summary
                }
                onChange={(
                  event,
                ) =>
                  setSummary(
                    event.target
                      .value,
                  )
                }
                rows={
                  4
                }
                className="site-editor-textarea"
              />
            </EditorField>


            <EditorField label="Page Content">
              <textarea
                value={
                  content
                }
                onChange={(
                  event,
                ) =>
                  setContent(
                    event.target
                      .value,
                  )
                }
                rows={
                  24
                }
                className="site-editor-textarea font-mono"
              />
            </EditorField>


            <div className="grid gap-5 sm:grid-cols-2">
              <EditorField label="Status">
                <select
                  value={
                    status
                  }
                  onChange={(
                    event,
                  ) =>
                    setStatus(
                      event.target
                        .value as
                        SitePageStatus,
                    )
                  }
                  className="site-editor-input"
                >
                  <option value="DRAFT">
                    Draft
                  </option>

                  <option value="PUBLISHED">
                    Published
                  </option>
                </select>
              </EditorField>


              {selectedPage.slug ===
                "terms" && (
                <EditorField label="Terms Version">
                  <div className="rounded-xl border border-slate-200 p-3">
                    <p className="text-sm font-semibold text-slate-900">
                      Current version:{" "}
                      {
                        selectedPage.version
                      }
                    </p>


                    <label className="mt-3 flex items-start gap-3 text-xs leading-5 text-slate-600">
                      <input
                        type="checkbox"
                        checked={
                          bumpTermsVersion
                        }
                        onChange={(
                          event,
                        ) =>
                          setBumpTermsVersion(
                            event.target
                              .checked,
                          )
                        }
                        className="mt-1"
                      />

                      Publish this Terms edit as a new version.
                    </label>
                  </div>
                </EditorField>
              )}
            </div>


            <div className="border-t border-slate-100 pt-5">
              <p className="font-semibold text-slate-900">
                SEO
              </p>


              <div className="mt-4 space-y-5">
                <EditorField label="SEO Title">
                  <input
                    value={
                      seoTitle
                    }
                    onChange={(
                      event,
                    ) =>
                      setSeoTitle(
                        event.target
                          .value,
                      )
                    }
                    className="site-editor-input"
                  />
                </EditorField>


                <EditorField label="SEO Description">
                  <textarea
                    value={
                      seoDescription
                    }
                    onChange={(
                      event,
                    ) =>
                      setSeoDescription(
                        event.target
                          .value,
                      )
                    }
                    rows={
                      3
                    }
                    className="site-editor-textarea"
                  />
                </EditorField>
              </div>
            </div>


            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {
                  error
                }
              </div>
            )}


            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />

                {
                  success
                }
              </div>
            )}
          </div>
        </section>
      )}


      <style jsx global>{`
        .site-editor-input {
          height: 44px;
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgb(226 232 240);
          padding: 0 12px;
          font-size: 14px;
          outline: none;
        }

        .site-editor-textarea {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgb(226 232 240);
          padding: 12px;
          font-size: 14px;
          outline: none;
          resize: vertical;
        }

        .site-editor-input:focus,
        .site-editor-textarea:focus {
          border-color: rgb(96 165 250);
          box-shadow: 0 0 0 2px rgb(219 234 254);
        }
      `}</style>
    </div>
  );
}


function EditorField({
  label,
  children,
}: {
  label:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {
          label
        }
      </span>

      <div className="mt-2">
        {
          children
        }
      </div>
    </label>
  );
}