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
// PRICING MODE
// =========================================================

export type RequestCatalogPricingMode =
  | "FIXED"
  | "PER_UNIT"
  | "STARTING_FROM"
  | "QUOTE_REQUIRED"
  | "FREE"
  | "MANUAL_PRICE";


// =========================================================
// PRICING TIER
//
// Example:
//
// Black & White
//   Standard 1–99     GHS 1.00
//   Bulk     100+     GHS 0.80
// =========================================================

export type RequestCatalogPricingTier = {
  id:
    string;

  label:
    | string
    | null;

  amount:
    number;

  minimumQuantity:
    | number
    | null;

  maximumQuantity:
    | number
    | null;

  displayOrder:
    number;
};


// =========================================================
// PRICING OPTION
//
// Examples:
//
// Black & White
// Colour
// Standard
// Express
// =========================================================

export type RequestCatalogPricingOption = {
  id:
    string;

  code:
    string;

  label:
    string;

  description:
    | string
    | null;

  unitLabel:
    | string
    | null;

  displayOrder:
    number;

  tiers:
    RequestCatalogPricingTier[];
};


// =========================================================
// PRICING
// =========================================================

export type RequestCatalogPricing = {
  mode:
    RequestCatalogPricingMode;

  /**
   * Current admin UI supports GHS and USD.
   *
   * Keep this as a string so the public catalog does not
   * require another TypeScript migration when additional
   * ISO currencies are supported later.
   */
  currency:
    string;

  /**
   * Parent/default price.
   *
   * Services without active usable options continue using
   * this value.
   */
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

  /**
   * Only active pricing options containing at least one
   * active valid tier are exposed publicly.
   *
   * Empty array means the normal parent/default pricing
   * workflow remains in effect.
   */
  options:
    RequestCatalogPricingOption[];
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