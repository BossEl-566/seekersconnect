export type RequestCatalogFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "currency"
  | "date"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "multi_select"
  | "file"
  | "image"
  | "document";


export type RequestCatalogConditionOperator =
  | "EQUALS"
  | "NOT_EQUALS"
  | "IN"
  | "NOT_IN"
  | "IS_CHECKED"
  | "IS_NOT_CHECKED"
  | "HAS_VALUE"
  | "HAS_NO_VALUE";


export type RequestCatalogFieldValidationRules = {
  minLength:
    number | null;

  maxLength:
    number | null;

  min:
    number | null;

  max:
    number | null;

  maxFiles:
    number | null;

  maxFileSizeMb:
    number | null;

  accept:
    string[];
};


// =========================================================
// DYNAMIC FIELD
// =========================================================

export type RequestCatalogField = {
  id:
    string;

  key:
    string;

  label:
    string;

  type:
    RequestCatalogFieldType;

  placeholder:
    string | null;

  helpText:
    string | null;

  required:
    boolean;

  options:
    string[];

  allowOther:
    boolean;

  otherLabel:
    string | null;

  conditionFieldId:
    string | null;

  conditionOperator:
    RequestCatalogConditionOperator | null;

  conditionValue:
    unknown;

  validationRules:
    RequestCatalogFieldValidationRules;

  sortOrder:
    number;
};


// =========================================================
// PRICING
// =========================================================

export type RequestCatalogPricingMode =
  | "FIXED"
  | "PER_UNIT"
  | "STARTING_FROM"
  | "QUOTE_REQUIRED"
  | "FREE"
  | "MANUAL_PRICE";


export type RequestCatalogPricingTier = {
  id:
    string;

  label:
    string | null;

  amount:
    number;

  minimumQuantity:
    number | null;

  maximumQuantity:
    number | null;

  displayOrder:
    number;
};


export type RequestCatalogPricingOption = {
  id:
    string;

  code:
    string;

  label:
    string;

  description:
    string | null;

  unitLabel:
    string | null;

  displayOrder:
    number;

  tiers:
    RequestCatalogPricingTier[];
};


export type RequestCatalogPricing = {
  mode:
    RequestCatalogPricingMode;

  currency:
    string;

  amount:
    number | null;

  unitLabel:
    string | null;

  minimumQuantity:
    number | null;

  maximumQuantity:
    number | null;

  displayNote:
    string | null;

  options:
    RequestCatalogPricingOption[];
};


// =========================================================
// CATEGORY SUMMARY
// =========================================================

export type RequestCatalogServiceCategorySummary = {
  id:
    string;

  slug:
    string;

  name:
    string;

  description:
    string | null;

  iconKey:
    string | null;

  displayOrder:
    number;
};
// =========================================================
// SERVICE MEDIA
// =========================================================

export type RequestCatalogServiceMediaKind =
  | "HERO_IMAGE"
  | "GALLERY_IMAGE"
  | "DOWNLOAD";


export type RequestCatalogServiceMedia = {
  id:
    string;

  kind:
    RequestCatalogServiceMediaKind;

  title:
    string;

  description:
    string | null;

  altText:
    string | null;

  url:
    string;

  originalFilename:
    string;

  mimeType:
    string;

  sizeBytes:
    number;

  displayOrder:
    number;
};

// =========================================================
// SERVICE
// =========================================================

export type RequestCatalogService = {
  id:
    string;

  universityId:
    string | null;

  serviceCategoryId:
    string;

  serviceScope:
    | "general"
    | "academic";

  slug:
    string;

  name:
    string;

  shortName:
    string;

  description:
    string | null;

  /**
   * Legacy compatibility only.
   */
  category:
    string;

  serviceCategory:
    RequestCatalogServiceCategorySummary;

  /**
   * Legacy compatibility only.
   *
   * Generic services must not depend on this value.
   */
  formType:
    string;

  displayOrder:
    number;

  featured:
    boolean;

imageUrl:
  string | null;

media:
  RequestCatalogServiceMedia[];

pricing:
  RequestCatalogPricing | null;
  fields:
    RequestCatalogField[];
};


// =========================================================
// UNIVERSITY
// =========================================================

export type RequestCatalogUniversity = {
  id:
    string;

  code:
    string;

  name:
    string;

  location:
    string;

  services:
    RequestCatalogService[];
};


// =========================================================
// CATEGORY
// =========================================================

export type RequestCatalogCategory = {
  id:
    string;

  slug:
    string;

  name:
    string;

  description:
    string | null;

  iconKey:
    string | null;

  displayOrder:
    number;

  generalServices:
    RequestCatalogService[];

  academicServiceCount:
    number;
};


// =========================================================
// COMPLETE CATALOG
// =========================================================

export type RequestCatalog = {
  categories:
    RequestCatalogCategory[];

  generalServices:
    RequestCatalogService[];

  universities:
    RequestCatalogUniversity[];
};