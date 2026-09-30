export type RequestCatalogFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "textarea"
  | "select";


export type RequestCatalogField = {
  id: string;

  key: string;

  label: string;

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


export type RequestCatalogService = {
  id: string;

  slug: string;

  name: string;

  shortName: string;

  description:
    | string
    | null;

  category: string;

  formType: string;

  fields:
    RequestCatalogField[];
};


export type RequestCatalogUniversity = {
  id: string;

  code: string;

  name: string;

  location: string;

  services:
    RequestCatalogService[];
};


export type RequestCatalog = {
  universities:
    RequestCatalogUniversity[];
};