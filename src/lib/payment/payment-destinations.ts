import type {
  CurrencyPaymentDestinationSettings,
  PaymentDetailsSettings,
} from "@/lib/validation/system-settings";


export type PaymentMethod =
  | "momo"
  | "bank";


export type SupportedPaymentCurrency =
  | "GHS"
  | "USD";


// =========================================================
// CURRENCY
// =========================================================

export function normalizeSupportedPaymentCurrency(
  currency:
    string,
):
  SupportedPaymentCurrency
  | null {
  const normalized =
    currency
      .trim()
      .toUpperCase();


  if (
    normalized ===
    "GHS"
  ) {
    return "GHS";
  }


  if (
    normalized ===
    "USD"
  ) {
    return "USD";
  }


  return null;
}


// =========================================================
// DESTINATION
// =========================================================

export function getCurrencyPaymentDestination(
  settings:
    PaymentDetailsSettings,

  currency:
    string,
):
  CurrencyPaymentDestinationSettings
  | null {
  const normalized =
    normalizeSupportedPaymentCurrency(
      currency,
    );


  if (
    !normalized
  ) {
    return null;
  }


  return settings
    .currencies[
      normalized
    ];
}


// =========================================================
// AVAILABLE METHODS
// =========================================================

export function getAvailablePaymentMethods(
  settings:
    PaymentDetailsSettings,

  currency:
    string,
):
  PaymentMethod[] {
  const destination =
    getCurrencyPaymentDestination(
      settings,
      currency,
    );


  if (
    !destination
  ) {
    return [];
  }


  const methods:
    PaymentMethod[] =
    [];


  if (
    destination
      .momo
      .enabled
  ) {
    methods.push(
      "momo",
    );
  }


  if (
    destination
      .bank
      .enabled
  ) {
    methods.push(
      "bank",
    );
  }


  return methods;
}


// =========================================================
// METHOD CHECK
// =========================================================

export function isPaymentMethodAvailable(
  settings:
    PaymentDetailsSettings,

  currency:
    string,

  method:
    string,
) {
  if (
    method !==
      "momo" &&
    method !==
      "bank"
  ) {
    return false;
  }


  return getAvailablePaymentMethods(
    settings,
    currency,
  ).includes(
    method,
  );
}