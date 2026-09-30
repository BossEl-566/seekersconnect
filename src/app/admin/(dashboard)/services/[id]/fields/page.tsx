import {
  notFound,
} from "next/navigation";

import {
  requireSuperAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  ServiceFormFieldsManager,
  type FormBuilderService,
  type ServiceFormFieldItem,
} from "@/components/admin/service-form-fields-manager";


type PageProps = {
  params: Promise<{
    id: string;
  }>;
};


export default async function ServiceFieldsPage({
  params,
}: PageProps) {
  await requireSuperAdmin();


  const {
    id,
  } = await params;


  const supabase =
    createAdminClient();


  const [
    serviceResult,
    fieldsResult,
  ] =
    await Promise.all([
      supabase
        .from("services")
        .select(`
          id,
          name,
          short_name,
          slug,
          active,

          universities (
            code,
            name
          )
        `)
        .eq(
          "id",
          id,
        )
        .single(),

      supabase
        .from(
          "service_form_fields",
        )
        .select(`
          id,
          service_id,
          field_key,
          label,
          field_type,
          placeholder,
          required,
          options,
          sort_order,
          active,
          created_at
        `)
        .eq(
          "service_id",
          id,
        )
        .order(
          "sort_order",
          {
            ascending: true,
          },
        )
        .order(
          "created_at",
          {
            ascending: true,
          },
        ),
    ]);


  if (
    serviceResult.error ||
    !serviceResult.data
  ) {
    notFound();
  }


  if (
    fieldsResult.error
  ) {
    console.error(
      "Service form fields query failed:",
      fieldsResult.error,
    );
  }


  const service =
    serviceResult.data as unknown as
      FormBuilderService;


  const rawFields =
    fieldsResult.data ??
    [];


  const fields =
    rawFields.map(
      (field) => ({
        ...field,

        options:
          Array.isArray(
            field.options,
          )
            ? field.options.filter(
                (
                  option,
                ): option is string =>
                  typeof option ===
                  "string",
              )
            : null,
      }),
    ) as ServiceFormFieldItem[];


  return (
    <ServiceFormFieldsManager
      service={
        service
      }
      fields={
        fields
      }
    />
  );
}