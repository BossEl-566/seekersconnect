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
  type ServiceFormFieldValidationRules,
} from "@/components/admin/service-form-fields-manager";


type PageProps = {
  params:
    Promise<{
      id:
        string;
    }>;
};


export default async function ServiceFieldsPage({
  params,
}: PageProps) {
  await requireSuperAdmin();


  const {
    id,
  } =
    await params;


  const supabase =
    createAdminClient();


  const [
    serviceResult,
    fieldsResult,
  ] =
    await Promise.all([
      supabase
        .from(
          "services",
        )
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
          help_text,

          required,

          options,

          allow_other,
          other_label,

          condition_field_id,
          condition_operator,
          condition_value,

          validation_rules,

          sort_order,
          active,

          created_at,
          updated_at
        `)
        .eq(
          "service_id",
          id,
        )
        .order(
          "sort_order",
          {
            ascending:
              true,
          },
        )
        .order(
          "created_at",
          {
            ascending:
              true,
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
      (
        field,
      ) => ({
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

        validation_rules:
          normalizeValidationRules(
            field.validation_rules,
          ),
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


function normalizeValidationRules(
  value:
    unknown,
):
  ServiceFormFieldValidationRules {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(
      value,
    )
  ) {
    return {};
  }


  return value as
    ServiceFormFieldValidationRules;
}