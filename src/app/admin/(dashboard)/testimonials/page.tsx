import {
  requireSuperAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  TestimonialsManager,
  type TestimonialAdminItem,
} from "@/components/admin/testimonials-manager";


export default async function TestimonialsAdminPage() {
  await requireSuperAdmin();


  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "testimonials",
      )
      .select(`
        id,
        customer_name,
        customer_title,
        organization,
        testimonial,
        rating,
        source,
        status,
        featured,
        customer_email,
        customer_phone,
        admin_note,
        moderated_at,
        created_at
      `)
      .order(
        "created_at",
        {
          ascending:
            false,
        },
      );


  if (
    error
  ) {
    console.error(
      "Testimonials admin query failed:",
      error,
    );
  }


  const testimonials =
    (
      data ??
      []
    ) as TestimonialAdminItem[];


  return (
    <>
      <div>
        <p className="text-sm font-medium text-blue-600">
          Content
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          Testimonials
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Review customer submissions, approve public testimonials,
          feature selected feedback and add verified testimonials
          manually.
        </p>
      </div>


      <div className="mt-7">
        <TestimonialsManager
          testimonials={
            testimonials
          }
        />
      </div>
    </>
  );
}