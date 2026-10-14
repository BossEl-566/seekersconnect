import type {
  RequestCatalogConditionOperator,
  RequestCatalogField,
  RequestCatalogFieldType,
} from "@/types/request-catalog";


// =========================================================
// INTERNAL OTHER VALUE
// =========================================================

export const OTHER_VALUE_PREFIX =
  "__sc247_other__:";


// =========================================================
// DATABASE FIELD SHAPE
// =========================================================

export type DatabaseDynamicFieldShape = {
  id:
    string;

  service_id:
    string;

  field_key:
    string;

  label:
    string;

  field_type:
    string;

  placeholder:
    string | null;

  help_text:
    string | null;

  required:
    boolean;

  options:
    unknown;

  allow_other:
    boolean;

  other_label:
    string | null;

  condition_field_id:
    string | null;

  condition_operator:
    string | null;

  condition_value:
    unknown;

  validation_rules:
    unknown;

  sort_order:
    number;
};


// =========================================================
// SUPPORTED TYPES
// =========================================================

const fieldTypes =
  new Set<RequestCatalogFieldType>([
    "text",
    "email",
    "tel",
    "number",
    "currency",
    "date",
    "textarea",

    "select",
    "radio",
    "checkbox",
    "multi_select",

    "file",
    "image",
    "document",
  ]);


const conditionOperators =
  new Set<RequestCatalogConditionOperator>([
    "EQUALS",
    "NOT_EQUALS",

    "IN",
    "NOT_IN",

    "IS_CHECKED",
    "IS_NOT_CHECKED",

    "HAS_VALUE",
    "HAS_NO_VALUE",
  ]);


// =========================================================
// TYPE HELPERS
// =========================================================

export function isUploadFieldType(
  type:
    RequestCatalogFieldType,
) {
  return (
    type ===
      "file" ||
    type ===
      "image" ||
    type ===
      "document"
  );
}


export function isOptionFieldType(
  type:
    RequestCatalogFieldType,
) {
  return (
    type ===
      "select" ||
    type ===
      "radio" ||
    type ===
      "multi_select"
  );
}


// =========================================================
// DATABASE -> PUBLIC FIELD
// =========================================================

export function catalogFieldFromDatabase(
  field:
    DatabaseDynamicFieldShape,
):
  RequestCatalogField {
  const type =
    fieldTypes.has(
      field.field_type as
        RequestCatalogFieldType,
    )
      ? field.field_type as
          RequestCatalogFieldType
      : "text";


  const conditionOperator =
    field.condition_operator &&
    conditionOperators.has(
      field.condition_operator as
        RequestCatalogConditionOperator,
    )
      ? field.condition_operator as
          RequestCatalogConditionOperator
      : null;


  return {
    id:
      field.id,

    key:
      field.field_key,

    label:
      field.label,

    type,

    placeholder:
      field.placeholder,

    helpText:
      field.help_text,

    required:
      field.required,

    options:
      normalizeStringArray(
        field.options,
      ),

    allowOther:
      Boolean(
        field.allow_other,
      ),

    otherLabel:
      field.other_label,

    conditionFieldId:
      field.condition_field_id,

    conditionOperator,

    conditionValue:
      field.condition_value,

    validationRules:
      normalizeValidationRules(
        field.validation_rules,
      ),

    sortOrder:
      field.sort_order,
  };
}


// =========================================================
// OPTIONS
// =========================================================

function normalizeStringArray(
  value:
    unknown,
):
  string[] {
  if (
    !Array.isArray(
      value,
    )
  ) {
    return [];
  }


  return value.filter(
    (
      item,
    ): item is string =>
      typeof item ===
        "string" &&
      item.trim().length >
        0,
  );
}


// =========================================================
// VALIDATION RULES
// =========================================================

function normalizeValidationRules(
  value:
    unknown,
) {
  const result = {
    minLength:
      null as number | null,

    maxLength:
      null as number | null,

    min:
      null as number | null,

    max:
      null as number | null,

    maxFiles:
      null as number | null,

    maxFileSizeMb:
      null as number | null,

    accept:
      [] as string[],
  };


  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(
      value,
    )
  ) {
    return result;
  }


  const record =
    value as
      Record<string, unknown>;


  result.minLength =
    nullableNumber(
      record.minLength,
    );

  result.maxLength =
    nullableNumber(
      record.maxLength,
    );

  result.min =
    nullableNumber(
      record.min,
    );

  result.max =
    nullableNumber(
      record.max,
    );

  result.maxFiles =
    nullableNumber(
      record.maxFiles,
    );

  result.maxFileSizeMb =
    nullableNumber(
      record.maxFileSizeMb,
    );

  result.accept =
    normalizeStringArray(
      record.accept,
    );


  return result;
}


function nullableNumber(
  value:
    unknown,
):
  number | null {
  if (
    value ===
      null ||
    value ===
      undefined ||
    value ===
      ""
  ) {
    return null;
  }


  const number =
    Number(
      value,
    );


  return Number.isFinite(
    number,
  )
    ? number
    : null;
}


// =========================================================
// OTHER VALUES
// =========================================================

export function encodeOtherValue(
  value:
    string,
) {
  return (
    OTHER_VALUE_PREFIX +
    value
  );
}


export function isOtherValue(
  value:
    string,
) {
  return value.startsWith(
    OTHER_VALUE_PREFIX,
  );
}


export function getOtherValue(
  value:
    string,
) {
  return isOtherValue(
    value,
  )
    ? value.slice(
        OTHER_VALUE_PREFIX.length,
      )
    : "";
}


function decodeChoice(
  value:
    string,
) {
  return isOtherValue(
    value,
  )
    ? getOtherValue(
        value,
      )
    : value;
}


// =========================================================
// MULTI SELECT
// =========================================================

export function parseMultiSelectValue(
  value:
    string,
):
  string[] {
  if (
    !value.trim()
  ) {
    return [];
  }


  try {
    const parsed =
      JSON.parse(
        value,
      );


    if (
      Array.isArray(
        parsed,
      )
    ) {
      return parsed.filter(
        (
          item,
        ): item is string =>
          typeof item ===
          "string",
      );
    }
  } catch {
    // Compatibility fallback below.
  }


  return value
    .split(
      ",",
    )
    .map(
      (
        item,
      ) =>
        item.trim(),
    )
    .filter(
      Boolean,
    );
}


export function encodeMultiSelectValue(
  values:
    string[],
) {
  return JSON.stringify(
    Array.from(
      new Set(
        values,
      ),
    ),
  );
}


// =========================================================
// VALUE PRESENCE
// =========================================================

export function dynamicFieldHasValue(
  field:
    RequestCatalogField,

  value:
    string,
) {
  if (
    isUploadFieldType(
      field.type,
    )
  ) {
    /*
     * Upload execution is Phase 13E.
     */
    return true;
  }


  if (
    field.type ===
    "checkbox"
  ) {
    return (
      value ===
      "true"
    );
  }


  if (
    field.type ===
    "multi_select"
  ) {
    return (
      parseMultiSelectValue(
        value,
      ).length >
      0
    );
  }


  if (
    isOtherValue(
      value,
    )
  ) {
    return Boolean(
      getOtherValue(
        value,
      ).trim(),
    );
  }


  return Boolean(
    value.trim(),
  );
}


// =========================================================
// CONDITIONS
// =========================================================

function expectedConditionValues(
  value:
    unknown,
):
  string[] {
  if (
    Array.isArray(
      value,
    )
  ) {
    return value
      .filter(
        (
          item,
        ): item is string =>
          typeof item ===
          "string",
      )
      .map(
        (
          item,
        ) =>
          item.trim(),
      );
  }


  if (
    typeof value ===
    "string"
  ) {
    return [
      value.trim(),
    ];
  }


  if (
    typeof value ===
      "boolean" ||
    typeof value ===
      "number"
  ) {
    return [
      String(
        value,
      ),
    ];
  }


  return [];
}


function responseValuesForCondition(
  field:
    RequestCatalogField,

  value:
    string,
) {
  if (
    field.type ===
    "multi_select"
  ) {
    return parseMultiSelectValue(
      value,
    ).map(
      decodeChoice,
    );
  }


  if (
    field.type ===
    "checkbox"
  ) {
    return [
      value ===
      "true"
        ? "true"
        : "false",
    ];
  }


  if (
    !value
  ) {
    return [];
  }


  return [
    decodeChoice(
      value,
    ),
  ];
}


export function isDynamicFieldVisible(
  field:
    RequestCatalogField,

  fields:
    RequestCatalogField[],

  responses:
    Record<
      string,
      string
    >,

  visited =
    new Set<string>(),
):
  boolean {
  if (
    !field.conditionFieldId ||
    !field.conditionOperator
  ) {
    return true;
  }


  if (
    visited.has(
      field.id,
    )
  ) {
    return false;
  }


  const nextVisited =
    new Set(
      visited,
    );


  nextVisited.add(
    field.id,
  );


  const parent =
    fields.find(
      (
        item,
      ) =>
        item.id ===
        field.conditionFieldId,
    );


  if (
    !parent
  ) {
    return false;
  }


  if (
    !isDynamicFieldVisible(
      parent,
      fields,
      responses,
      nextVisited,
    )
  ) {
    return false;
  }


  const raw =
    responses[
      parent.key
    ] ??
    "";


  const currentValues =
    responseValuesForCondition(
      parent,
      raw,
    );


  const expected =
    expectedConditionValues(
      field.conditionValue,
    );


  switch (
    field.conditionOperator
  ) {
    case "EQUALS":
      return (
        expected.length >
          0 &&
        currentValues.includes(
          expected[0],
        )
      );


    case "NOT_EQUALS":
      return (
        expected.length >
          0 &&
        !currentValues.includes(
          expected[0],
        )
      );


    case "IN":
      return expected.some(
        (
          value,
        ) =>
          currentValues.includes(
            value,
          ),
      );


    case "NOT_IN":
      return !expected.some(
        (
          value,
        ) =>
          currentValues.includes(
            value,
          ),
      );


    case "IS_CHECKED":
      return (
        raw ===
        "true"
      );


    case "IS_NOT_CHECKED":
      return (
        raw !==
        "true"
      );


    case "HAS_VALUE":
      return dynamicFieldHasValue(
        parent,
        raw,
      );


    case "HAS_NO_VALUE":
      return !dynamicFieldHasValue(
        parent,
        raw,
      );


    default:
      return true;
  }
}


export function getVisibleDynamicFields(
  fields:
    RequestCatalogField[],

  responses:
    Record<
      string,
      string
    >,
) {
  return fields.filter(
    (
      field,
    ) =>
      isDynamicFieldVisible(
        field,
        fields,
        responses,
      ),
  );
}


// =========================================================
// FIELD VALIDATION
// =========================================================

export function validateDynamicFieldValue(
  field:
    RequestCatalogField,

  value:
    string,
):
  string | null {
  /*
   * Phase 13E owns actual binary uploads.
   */
  if (
    isUploadFieldType(
      field.type,
    )
  ) {
    return null;
  }


  if (
    field.required &&
    !dynamicFieldHasValue(
      field,
      value,
    )
  ) {
    return `${field.label} is required.`;
  }


  if (
    !value.trim()
  ) {
    return null;
  }


  const rules =
    field.validationRules;


  if (
    field.type ===
    "checkbox"
  ) {
    if (
      value !==
        "true" &&
      value !==
        "false"
    ) {
      return `${field.label} contains an invalid value.`;
    }


    return null;
  }


  if (
    field.type ===
      "select" ||
    field.type ===
      "radio"
  ) {
    if (
      isOtherValue(
        value,
      )
    ) {
      if (
        !field.allowOther ||
        !getOtherValue(
          value,
        ).trim()
      ) {
        return `${field.label} contains an invalid Other value.`;
      }


      return null;
    }


    if (
      !field.options.includes(
        value,
      )
    ) {
      return `${field.label} contains an invalid selection.`;
    }


    return null;
  }


  if (
    field.type ===
    "multi_select"
  ) {
    const values =
      parseMultiSelectValue(
        value,
      );


    if (
      field.required &&
      values.length ===
        0
    ) {
      return `${field.label} is required.`;
    }


    for (
      const selected of
      values
    ) {
      if (
        isOtherValue(
          selected,
        )
      ) {
        if (
          !field.allowOther ||
          !getOtherValue(
            selected,
          ).trim()
        ) {
          return `${field.label} contains an invalid Other value.`;
        }


        continue;
      }


      if (
        !field.options.includes(
          selected,
        )
      ) {
        return `${field.label} contains an invalid selection.`;
      }
    }


    return null;
  }


  const trimmed =
    value.trim();


  if (
    field.type ===
    "email"
  ) {
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailPattern.test(
        trimmed,
      )
    ) {
      return `${field.label} must contain a valid email address.`;
    }
  }


  if (
    field.type ===
      "number" ||
    field.type ===
      "currency"
  ) {
    const number =
      Number(
        trimmed,
      );


    if (
      !Number.isFinite(
        number,
      )
    ) {
      return `${field.label} must contain a valid number.`;
    }


    if (
      rules.min !==
        null &&
      number <
        rules.min
    ) {
      return `${field.label} must be at least ${rules.min}.`;
    }


    if (
      rules.max !==
        null &&
      number >
        rules.max
    ) {
      return `${field.label} cannot exceed ${rules.max}.`;
    }
  }


  if (
    field.type ===
    "date"
  ) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        trimmed,
      )
    ) {
      return `${field.label} must contain a valid date.`;
    }
  }


  if (
    [
      "text",
      "email",
      "tel",
      "textarea",
    ].includes(
      field.type,
    )
  ) {
    if (
      rules.minLength !==
        null &&
      trimmed.length <
        rules.minLength
    ) {
      return `${field.label} must contain at least ${rules.minLength} characters.`;
    }


    if (
      rules.maxLength !==
        null &&
      trimmed.length >
        rules.maxLength
    ) {
      return `${field.label} cannot exceed ${rules.maxLength} characters.`;
    }
  }


  return null;
}


// =========================================================
// CONTINUE VALIDATION
// =========================================================

export function dynamicFieldIsValid(
  field:
    RequestCatalogField,

  value:
    string,
) {
  return (
    validateDynamicFieldValue(
      field,
      value,
    ) ===
    null
  );
}


// =========================================================
// STORAGE NORMALIZATION
// =========================================================

export function normalizeDynamicValueForStorage(
  field:
    RequestCatalogField,

  value:
    string,
) {
  if (
    field.type ===
    "checkbox"
  ) {
    return value ===
      "true"
      ? "Yes"
      : "No";
  }


  if (
    field.type ===
    "multi_select"
  ) {
    return parseMultiSelectValue(
      value,
    )
      .map(
        decodeChoice,
      )
      .filter(
        Boolean,
      )
      .join(
        ", ",
      );
  }


  if (
    isOtherValue(
      value,
    )
  ) {
    return getOtherValue(
      value,
    ).trim();
  }


  return value.trim();
}


// =========================================================
// DISPLAY
// =========================================================

export function formatDynamicResponse(
  field:
    RequestCatalogField,

  value:
    string,
) {
  const normalized =
    normalizeDynamicValueForStorage(
      field,
      value,
    );


  return normalized ||
    "—";
}