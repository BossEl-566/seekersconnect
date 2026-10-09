export type RequestCatalogFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "textarea"
  | "select";


// =========================================================
// DYNAMIC FORM FIELD
// =========================================================

export type RequestCatalogField = {
  id: string;

  key: string;

  label: string;

  type: RequestCatalogFieldType;

  placeholder:
    | string
    | null;

  required: boolean;

  options: string[];

  sortOrder: number;
};


// =========================================================
// SERVICE CATEGORY SUMMARY
// =========================================================

export type RequestCatalogServiceCategorySummary = {
  id: string;

  slug: string;

  name: string;

  description:
    | string
    | null;

  iconKey:
    | string
    | null;

  displayOrder: number;
};


// =========================================================
// SERVICE
// =========================================================

export type RequestCatalogService = {
  id: string;

  universityId:
    | string
    | null;

  serviceCategoryId: string;

  serviceScope:
    | "general"
    | "academic";

  slug: string;

  name: string;

  shortName: string;

  description:
    | string
    | null;

  /**
   * Legacy compatibility value.
   */
  category: string;

  serviceCategory:
    RequestCatalogServiceCategorySummary;

  formType: string;

  displayOrder: number;

  featured: boolean;

  imageUrl:
    | string
    | null;

  fields:
    RequestCatalogField[];
};


// =========================================================
// UNIVERSITY / INSTITUTION
// =========================================================

export type RequestCatalogUniversity = {
  id: string;

  code: string;

  name: string;

  location: string;

  services:
    RequestCatalogService[];
};


// =========================================================
// SERVICE CATEGORY
// =========================================================

export type RequestCatalogCategory = {
  id: string;

  slug: string;

  name: string;

  description:
    | string
    | null;

  iconKey:
    | string
    | null;

  displayOrder: number;

  generalServices:
    RequestCatalogService[];

  academicServiceCount: number;
};


// =========================================================
// PUBLIC REQUEST CATALOG
// =========================================================

export type RequestCatalog = {
  /**
   * New Phase 13 category-driven catalog.
   */
  categories:
    RequestCatalogCategory[];


  /**
   * All active general services.
   */
  generalServices:
    RequestCatalogService[];


  /**
   * Academic institutions plus temporary SC247 compatibility.
   */
  universities:
    RequestCatalogUniversity[];
};