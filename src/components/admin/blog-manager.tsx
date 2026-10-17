"use client";

import {
  type FormEvent,
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  Archive,
  CheckCircle2,
  FileImage,
  FileText,
  Loader2,
  Newspaper,
  Pencil,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  createBlogPost,
  deleteBlogPost,
  updateBlogPost,
  type BlogPostInput,
  type BlogStatus,
} from "@/app/admin/(dashboard)/blog/actions";


export type BlogMediaAdminItem = {
  id:
    string;

  media_kind:
    "COVER_IMAGE"
    | "CONTENT_IMAGE";

  title:
    string | null;

  alt_text:
    string | null;

  storage_path:
    string;

  original_filename:
    string;

  mime_type:
    string;

  size_bytes:
    number;

  display_order:
    number;

  active:
    boolean;

  publicUrl:
    string;
};


export type BlogPostAdminItem = {
  id:
    string;

  slug:
    string;

  title:
    string;

  excerpt:
    string | null;

  content:
    string;

  status:
    BlogStatus;

  featured:
    boolean;

  published_at:
    string | null;

  seo_title:
    string | null;

  seo_description:
    string | null;

  created_at:
    string;

  updated_at:
    string;

  authorName:
    string | null;

  media:
    BlogMediaAdminItem[];
};


export function BlogManager({
  posts,
}: {
  posts:
    BlogPostAdminItem[];
}) {
  const router =
    useRouter();


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  const firstPost =
    posts[0] ??
    null;


  const [
    editingId,
    setEditingId,
  ] =
    useState<
      string | null
    >(
      firstPost?.id ??
      null,
    );


  const [
    title,
    setTitle,
  ] =
    useState(
      firstPost?.title ??
      "",
    );


  const [
    slug,
    setSlug,
  ] =
    useState(
      firstPost?.slug ??
      "",
    );


  const [
    excerpt,
    setExcerpt,
  ] =
    useState(
      firstPost?.excerpt ??
      "",
    );


  const [
    content,
    setContent,
  ] =
    useState(
      firstPost?.content ??
      "",
    );


  const [
    status,
    setStatus,
  ] =
    useState<BlogStatus>(
      firstPost?.status ??
      "DRAFT",
    );


  const [
    featured,
    setFeatured,
  ] =
    useState(
      firstPost?.featured ??
      false,
    );


  const [
    seoTitle,
    setSeoTitle,
  ] =
    useState(
      firstPost?.seo_title ??
      "",
    );


  const [
    seoDescription,
    setSeoDescription,
  ] =
    useState(
      firstPost
        ?.seo_description ??
      "",
    );


  const [
    search,
    setSearch,
  ] =
    useState(
      "",
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


  const selectedPost =
    posts.find(
      (
        post,
      ) =>
        post.id ===
        editingId,
    ) ??
    null;


  const filteredPosts =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();


        if (
          !query
        ) {
          return posts;
        }


        return posts.filter(
          (
            post,
          ) =>
            post.title
              .toLowerCase()
              .includes(
                query,
              ) ||
            post.slug
              .toLowerCase()
              .includes(
                query,
              ),
        );
      },
      [
        posts,
        search,
      ],
    );


  const publishedCount =
    posts.filter(
      (
        post,
      ) =>
        post.status ===
        "PUBLISHED",
    ).length;


  const draftCount =
    posts.filter(
      (
        post,
      ) =>
        post.status ===
        "DRAFT",
    ).length;


  function choosePost(
    post:
      BlogPostAdminItem,
  ) {
    setEditingId(
      post.id,
    );

    setTitle(
      post.title,
    );

    setSlug(
      post.slug,
    );

    setExcerpt(
      post.excerpt ??
      "",
    );

    setContent(
      post.content,
    );

    setStatus(
      post.status,
    );

    setFeatured(
      post.featured,
    );

    setSeoTitle(
      post.seo_title ??
      "",
    );

    setSeoDescription(
      post.seo_description ??
      "",
    );

    setError(
      "",
    );

    setSuccess(
      "",
    );
  }


  function startNewPost() {
    setEditingId(
      null,
    );

    setTitle(
      "",
    );

    setSlug(
      "",
    );

    setExcerpt(
      "",
    );

    setContent(
      "",
    );

    setStatus(
      "DRAFT",
    );

    setFeatured(
      false,
    );

    setSeoTitle(
      "",
    );

    setSeoDescription(
      "",
    );

    setError(
      "",
    );

    setSuccess(
      "",
    );
  }


  function savePost() {
    setError(
      "",
    );

    setSuccess(
      "",
    );


    const input:
      BlogPostInput =
    {
      id:
        editingId ??
        undefined,

      title,

      slug,

      excerpt,

      content,

      status,

      featured,

      seoTitle,

      seoDescription,
    };


    startTransition(
      async () => {
        const result =
          editingId
            ? await updateBlogPost(
                input,
              )
            : await createBlogPost(
                input,
              );


        if (
          !result.success
        ) {
          setError(
            result.error,
          );

          return;
        }


        if (
          result.id
        ) {
          setEditingId(
            result.id,
          );
        }


        setSuccess(
          editingId
            ? "Blog post updated successfully."
            : "Blog post created successfully.",
        );


        router.refresh();
      },
    );
  }


  function removePost() {
    if (
      !editingId
    ) {
      return;
    }


    if (
      !window.confirm(
        "Delete this blog post and all of its uploaded images permanently?",
      )
    ) {
      return;
    }


    setError(
      "",
    );


    startTransition(
      async () => {
        const result =
          await deleteBlogPost(
            editingId,
          );


        if (
          !result.success
        ) {
          setError(
            result.error,
          );

          return;
        }


        startNewPost();

        router.refresh();
      },
    );
  }


  return (
    <>
      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-3">
        <Summary
          icon={
            Newspaper
          }
          label="Total Posts"
          value={
            posts.length
          }
        />

        <Summary
          icon={
            CheckCircle2
          }
          label="Published"
          value={
            publishedCount
          }
        />

        <Summary
          icon={
            FileText
          }
          label="Drafts"
          value={
            draftCount
          }
        />
      </div>


      <div className="mt-6 grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        {/* ===============================================
            POSTS
        =============================================== */}

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-950">
              Blog Posts
            </h2>


            <button
              type="button"
              onClick={
                startNewPost
              }
              className="inline-flex h-9 items-center rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-3.5 w-3.5" />

              New
            </button>
          </div>


          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={
                search
              }
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target
                    .value,
                )
              }
              placeholder="Search posts..."
              className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
            />
          </div>


          <div className="mt-4 max-h-[720px] space-y-2 overflow-y-auto">
            {filteredPosts.length ===
            0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-400">
                No blog posts found.
              </p>
            ) : (
              filteredPosts.map(
                (
                  post,
                ) => (
                  <button
                    key={
                      post.id
                    }
                    type="button"
                    onClick={() =>
                      choosePost(
                        post,
                      )
                    }
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      editingId ===
                      post.id
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                        {
                          post.title
                        }
                      </p>

                      <StatusBadge
                        status={
                          post.status
                        }
                      />
                    </div>


                    <p className="mt-2 truncate text-xs text-slate-400">
                      /
                      {
                        post.slug
                      }
                    </p>


                    {post.featured && (
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                        Featured
                      </p>
                    )}
                  </button>
                ),
              )
            )}
          </div>
        </section>


        {/* ===============================================
            EDITOR
        =============================================== */}

        <div className="space-y-6">
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">
                  {editingId
                    ? "Edit Post"
                    : "New Post"}
                </p>

                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  {editingId
                    ? title ||
                      "Untitled Post"
                    : "Create Blog Post"}
                </h2>
              </div>


              <div className="flex gap-2">
                {editingId && (
                  <button
                    type="button"
                    disabled={
                      pending
                    }
                    onClick={
                      removePost
                    }
                    className="inline-flex h-10 items-center rounded-xl border border-red-200 px-4 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />

                    Delete
                  </button>
                )}


                <button
                  type="button"
                  disabled={
                    pending
                  }
                  onClick={
                    savePost
                  }
                  className="inline-flex h-10 items-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {pending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}

                  Save
                </button>
              </div>
            </div>


            <div className="mt-6 grid gap-5">
              <Field
                label="Title"
                required
              >
                <input
                  value={
                    title
                  }
                  onChange={(
                    event,
                  ) => {
                    const value =
                      event.target
                        .value;


                    setTitle(
                      value,
                    );


                    if (
                      !slug
                    ) {
                      setSlug(
                        slugify(
                          value,
                        ),
                      );
                    }
                  }}
                  maxLength={
                    250
                  }
                  className="input-admin"
                />
              </Field>


              <Field
                label="Slug"
                required
              >
                <div className="flex gap-2">
                  <input
                    value={
                      slug
                    }
                    onChange={(
                      event,
                    ) =>
                      setSlug(
                        slugify(
                          event.target
                            .value,
                        ),
                      )
                    }
                    maxLength={
                      180
                    }
                    className="input-admin flex-1"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setSlug(
                        slugify(
                          title,
                        ),
                      )
                    }
                    className="rounded-xl border border-slate-200 px-4 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Generate
                  </button>
                </div>
              </Field>


              <Field label="Excerpt">
                <textarea
                  value={
                    excerpt
                  }
                  onChange={(
                    event,
                  ) =>
                    setExcerpt(
                      event.target
                        .value,
                    )
                  }
                  rows={
                    3
                  }
                  maxLength={
                    1000
                  }
                  className="textarea-admin"
                />
              </Field>


              <Field
                label="Content"
                required
              >
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
                    18
                  }
                  className="textarea-admin font-mono"
                  placeholder="Write the article content here..."
                />

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Paragraphs and line breaks will be preserved on the public article page.
                </p>
              </Field>


              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Status">
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
                          BlogStatus,
                      )
                    }
                    className="input-admin"
                  >
                    <option value="DRAFT">
                      Draft
                    </option>

                    <option value="PUBLISHED">
                      Published
                    </option>

                    <option value="ARCHIVED">
                      Archived
                    </option>
                  </select>
                </Field>


                <Field label="Homepage">
                  <label className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 px-4">
                    <input
                      type="checkbox"
                      checked={
                        featured
                      }
                      onChange={(
                        event,
                      ) =>
                        setFeatured(
                          event.target
                            .checked,
                        )
                      }
                    />

                    <span className="text-sm text-slate-700">
                      Feature this post
                    </span>
                  </label>
                </Field>
              </div>


              <div className="border-t border-slate-100 pt-5">
                <p className="font-semibold text-slate-900">
                  Search Metadata
                </p>


                <div className="mt-4 grid gap-5">
                  <Field label="SEO Title">
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
                      maxLength={
                        250
                      }
                      className="input-admin"
                    />
                  </Field>


                  <Field label="SEO Description">
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
                      maxLength={
                        500
                      }
                      className="textarea-admin"
                    />
                  </Field>
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
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  {
                    success
                  }
                </div>
              )}
            </div>
          </section>


          {/* =============================================
              MEDIA
          ============================================= */}

          {editingId &&
          selectedPost ? (
            <BlogMediaManager
              post={
                selectedPost
              }
            />
          ) : (
            <section className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <FileImage className="mx-auto h-7 w-7 text-slate-400" />

              <p className="mt-3 font-medium text-slate-700">
                Save the post first
              </p>

              <p className="mt-1 text-sm text-slate-400">
                You can upload the cover and supporting images after the blog post has been created.
              </p>
            </section>
          )}
        </div>
      </div>


      <style jsx global>{`
        .input-admin {
          height: 44px;
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgb(226 232 240);
          padding: 0 12px;
          font-size: 14px;
          outline: none;
          background: white;
        }

        .input-admin:focus,
        .textarea-admin:focus {
          border-color: rgb(96 165 250);
          box-shadow: 0 0 0 2px rgb(219 234 254);
        }

        .textarea-admin {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgb(226 232 240);
          padding: 12px;
          font-size: 14px;
          outline: none;
          background: white;
          resize: vertical;
        }
      `}</style>
    </>
  );
}


// =========================================================
// BLOG MEDIA MANAGER
// =========================================================

function BlogMediaManager({
  post,
}: {
  post:
    BlogPostAdminItem;
}) {
  const router =
    useRouter();


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  const [
    mediaKind,
    setMediaKind,
  ] =
    useState<
      "COVER_IMAGE"
      | "CONTENT_IMAGE"
    >(
      "COVER_IMAGE",
    );


  const [
    message,
    setMessage,
  ] =
    useState(
      "",
    );


  const [
    error,
    setError,
  ] =
    useState(
      "",
    );


  const cover =
    post.media.find(
      (
        item,
      ) =>
        item.media_kind ===
        "COVER_IMAGE",
    ) ??
    null;


  const contentImages =
    post.media.filter(
      (
        item,
      ) =>
        item.media_kind ===
        "CONTENT_IMAGE",
    );


  function uploadImage(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();


    const form =
      event.currentTarget;


    const formData =
      new FormData(
        form,
      );


    formData.set(
      "mediaKind",
      mediaKind,
    );


    setError(
      "",
    );

    setMessage(
      "",
    );


    startTransition(
      async () => {
        try {
          const response =
            await fetch(
              `/api/admin/blog/${post.id}/media`,
              {
                method:
                  "POST",

                body:
                  formData,
              },
            );


          const result =
            await response.json();


          if (
            !response.ok ||
            !result.success
          ) {
            setError(
              result.message ||
              "Image upload failed.",
            );

            return;
          }


          setMessage(
            result.message,
          );


          form.reset();

          router.refresh();
        } catch {
          setError(
            "Image upload failed.",
          );
        }
      },
    );
  }


  function deleteImage(
    mediaId:
      string,
  ) {
    if (
      !window.confirm(
        "Delete this image?",
      )
    ) {
      return;
    }


    startTransition(
      async () => {
        const response =
          await fetch(
            `/api/admin/blog/${post.id}/media?mediaId=${encodeURIComponent(
              mediaId,
            )}`,
            {
              method:
                "DELETE",
            },
          );


        const result =
          await response.json();


        if (
          !response.ok
        ) {
          setError(
            result.message ||
            "Image deletion failed.",
          );

          return;
        }


        router.refresh();
      },
    );
  }


  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <FileImage className="h-4 w-4" />
        </div>

        <div>
          <h3 className="font-semibold text-slate-950">
            Blog Images
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Manage the cover and supporting images for this article.
          </p>
        </div>
      </div>


      <form
        onSubmit={
          uploadImage
        }
        className="mt-5 grid gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <select
            value={
              mediaKind
            }
            onChange={(
              event,
            ) =>
              setMediaKind(
                event.target
                  .value as
                  | "COVER_IMAGE"
                  | "CONTENT_IMAGE",
              )
            }
            className="input-admin"
          >
            <option value="COVER_IMAGE">
              Cover Image
            </option>

            <option value="CONTENT_IMAGE">
              Content Image
            </option>
          </select>


          <input
            name="displayOrder"
            type="number"
            min="0"
            defaultValue="0"
            placeholder="Display order"
            className="input-admin"
          />
        </div>


        <input
          name="title"
          placeholder="Image title (optional)"
          className="input-admin"
        />


        <input
          name="altText"
          placeholder="Alternative text"
          className="input-admin"
        />


        <input
          name="file"
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          required
          className="block w-full rounded-xl border border-slate-200 p-3 text-sm"
        />


        <button
          type="submit"
          disabled={
            pending
          }
          className="inline-flex h-10 w-fit items-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}

          Upload Image
        </button>


        {error && (
          <p className="text-sm text-red-600">
            {
              error
            }
          </p>
        )}


        {message && (
          <p className="text-sm text-emerald-600">
            {
              message
            }
          </p>
        )}
      </form>


      {cover && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-slate-800">
            Cover
          </p>

          <ImageCard
            item={
              cover
            }
            onDelete={() =>
              deleteImage(
                cover.id,
              )
            }
          />
        </div>
      )}


      {contentImages.length >
        0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-slate-800">
            Content Images
          </p>


          <div className="grid gap-4 sm:grid-cols-2">
            {contentImages.map(
              (
                item,
              ) => (
                <ImageCard
                  key={
                    item.id
                  }
                  item={
                    item
                  }
                  onDelete={() =>
                    deleteImage(
                      item.id,
                    )
                  }
                />
              ),
            )}
          </div>
        </div>
      )}
    </section>
  );
}


// =========================================================
// IMAGE CARD
// =========================================================

function ImageCard({
  item,
  onDelete,
}: {
  item:
    BlogMediaAdminItem;

  onDelete:
    () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      {/* eslint-disable-next-line @next/next/no-img-element */}

      <img
        src={
          item.publicUrl
        }
        alt={
          item.alt_text ||
          item.title ||
          "Blog image"
        }
        className="h-52 w-full object-cover"
      />


      <div className="flex items-center justify-between gap-3 p-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-700">
            {
              item.original_filename
            }
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            {
              formatFileSize(
                item.size_bytes,
              )
            }
          </p>
        </div>


        <button
          type="button"
          onClick={
            onDelete
          }
          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}


// =========================================================
// SHARED
// =========================================================

function Field({
  label,
  required,
  children,
}: {
  label:
    string;

  required?:
    boolean;

  children:
    React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {
          label
        }

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      <div className="mt-2">
        {
          children
        }
      </div>
    </label>
  );
}


function Summary({
  icon:
    Icon,

  label,

  value,
}: {
  icon:
    React.ElementType;

  label:
    string;

  value:
    number;
}) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">
            {
              label
            }
          </p>

          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {
              value
            }
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}


function StatusBadge({
  status,
}: {
  status:
    BlogStatus;
}) {
  const className =
    status ===
    "PUBLISHED"
      ? "bg-emerald-50 text-emerald-700"
      : status ===
          "ARCHIVED"
        ? "bg-slate-100 text-slate-500"
        : "bg-amber-50 text-amber-700";


  return (
    <span
      className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase ${className}`}
    >
      {
        status
      }
    </span>
  );
}


function slugify(
  value:
    string,
) {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}


function formatFileSize(
  bytes:
    number,
) {
  if (
    bytes <
    1024
  ) {
    return `${bytes} B`;
  }


  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes /
      1024
    ).toFixed(
      1,
    )} KB`;
  }


  return `${(
    bytes /
    1024 /
    1024
  ).toFixed(
    2,
  )} MB`;
}