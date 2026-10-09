export type RequestCatalogFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "textarea"
  | "select";


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
    | string
    | null;

  required:
    boolean;

  options:
    string[];

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


export type RequestCatalogPricing = {
  mode:
    RequestCatalogPricingMode;

  /**
   * Current admin UI supports GHS and USD.
   *
   * Keep this as a string so the public catalog does not
   * require a TypeScript migration if another ISO currency
   * is supported later.
   */
  currency:
    string;

  amount:
    | number
    | null;

  unitLabel:
    | string
    | null;

  minimumQuantity:
    | number
    | null;

  maximumQuantity:
    | number
    | null;

  displayNote:
    | string
    | null;
};


// =========================================================
// SERVICE CATEGORY SUMMARY
// =========================================================

export type RequestCatalogServiceCategorySummary = {
  id:
    string;

  slug:
    string;

  name:
    string;

  description:
    | string
    | null;

  iconKey:
    | string
    | null;

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
    | string
    | null;

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
    | string
    | null;

  /**
   * Legacy compatibility column.
   */
  category:
    string;

  serviceCategory:
    RequestCatalogServiceCategorySummary;

  formType:
    string;

  displayOrder:
    number;

  featured:
    boolean;

  imageUrl:
    | string
    | null;

  /**
   * Null means pricing is currently not published.
   */
  pricing:
    | RequestCatalogPricing
    | null;

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
    | string
    | null;

  iconKey:
    | string
    | null;

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