import {
  BadgeDollarSign,
} from "lucide-react";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  RequestPriceActions,
} from "@/components/admin/request-price-actions";


type RequestPricingPanelProps = {
  requestId:
    string;
};


type PricingRequest = {
  id:
    string;

  status:
    string;

  pricing_mode_snapshot:
    string
    | null;

  pricing_currency_snapshot:
    string
    | null;

  pricing_unit_amount_snapshot:
    string
    | number
    | null;

  pricing_quantity_snapshot:
    string
    | number
    | null;

  pricing_total_snapshot:
    string
    | number
    | null;

  pricing_note_snapshot:
    string
    | null;

  price_finalized_at:
    string
    | null;
};


// =========================================================
// COMPONENT
// =========================================================

export async function RequestPricingPanel({
  requestId,
}: RequestPricingPanelProps) {
  const supabase =
    createAdminClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "requests",
      )
      .select(`
        id,
        status,

        pricing_mode_snapshot,
        pricing_currency_snapshot,
        pricing_unit_amount_snapshot,
        pricing_quantity_snapshot,
        pricing_total_snapshot,
        pricing_note_snapshot,
        price_finalized_at
      `)
      .eq(
        "id",
        requestId,
      )
      .maybeSingle();


  if (
    error
  ) {
    console.error(
      "Request pricing panel query failed:",
      error,
    );

    return null;
  }


  if (
    !data
  ) {
    return null;
  }


  const request =
    data as
      PricingRequest;


  const pricingMode =
    request
      .pricing_mode_snapshot ??
    "MANUAL_PRICE";


  const currency =
    request
      .pricing_currency_snapshot ??
    "GHS";


  const unitAmount =
    toNumber(
      request
        .pricing_unit_amount_snapshot,
    );


  const quantity =
    toNumber(
      request
        .pricing_quantity_snapshot,
    );


  const total =
    toNumber(
      request
        .pricing_total_snapshot,
    );


  const awaitingPayment =
    request.status ===
    "AWAITING_PAYMENT";


  return (
    <div className="space-y-5">
      {/* ===============================================
          PRICE SUMMARY
      =============================================== */}

      <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BadgeDollarSign className="h-5 w-5" />
          </div>


          <div>
            <p className="font-semibold text-slate-950">
              Request Pricing
            </p>


            <p className="mt-1 text-xs text-slate-400">
              {
                pricingModeLabel(
                  pricingMode,
                )
              }
            </p>
          </div>
        </div>


        <div className="mt-5 divide-y divide-slate-100">
          <PricingRow
            label="Currency"
            value={
              currency
            }
          />


          {pricingMode ===
            "PER_UNIT" && (
            <>
              <PricingRow
                label="Unit Price"
                value={
                  formatMoney(
                    currency,
                    unitAmount,
                  )
                }
              />


              <PricingRow
                label="Quantity"
                value={
                  quantity ===
                  null
                    ? "—"
                    : String(
                        quantity,
                      )
                }
              />
            </>
          )}


          {pricingMode ===
            "STARTING_FROM" && (
            <PricingRow
              label="Starting Price"
              value={
                formatMoney(
                  currency,
                  unitAmount,
                )
              }
            />
          )}


          {pricingMode ===
            "FIXED" && (
            <PricingRow
              label="Configured Price"
              value={
                formatMoney(
                  currency,
                  unitAmount,
                )
              }
            />
          )}


          <PricingRow
            label="Final Total"
            value={
              pricingMode ===
              "FREE"
                ? "Free"
                : total ===
                    null
                  ? "Not finalized"
                  : formatMoney(
                      currency,
                      total,
                    )
            }
          />


          <PricingRow
            label="Price Status"
            value={
              request
                .price_finalized_at
                ? "Finalized"
                : pricingMode ===
                    "FREE"
                  ? "No charge"
                  : "Pending / provisional"
            }
          />
        </div>


        {request
          .pricing_note_snapshot && (
          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Pricing Note
            </p>


            <p className="mt-1 text-xs leading-5 text-slate-600">
              {
                request
                  .pricing_note_snapshot
              }
            </p>
          </div>
        )}


        {awaitingPayment && (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
            <p className="text-sm font-semibold text-blue-950">
              Waiting for customer payment
            </p>


            <p className="mt-1 text-xs leading-5 text-blue-700">
              The final price has been confirmed. The customer must
              now pay and submit payment proof before processing can
              continue.
            </p>
          </div>
        )}
      </div>


      {/* ===============================================
          ACTION
      =============================================== */}

      <RequestPriceActions
        requestId={
          request.id
        }
        status={
          request.status
        }
        pricingMode={
          pricingMode
        }
        currency={
          currency
        }
        startingAmount={
          pricingMode ===
          "STARTING_FROM"
            ? unitAmount
            : null
        }
      />
    </div>
  );
}


// =========================================================
// ROW
// =========================================================

function PricingRow({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <p className="text-xs text-slate-400">
        {
          label
        }
      </p>


      <p className="text-right text-sm font-semibold text-slate-800">
        {
          value
        }
      </p>
    </div>
  );
}


// =========================================================
// NUMBER
// =========================================================

function toNumber(
  value:
    string
    | number
    | null,
):
  number | null {
  if (
    value ===
    null
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
// MONEY
// =========================================================

function formatMoney(
  currency:
    string,

  amount:
    number
    | null,
) {
  if (
    amount ===
    null
  ) {
    return "—";
  }


  return `${currency} ${amount.toFixed(
    2,
  )}`;
}


// =========================================================
// MODE LABEL
// =========================================================

function pricingModeLabel(
  mode:
    string,
) {
  switch (
    mode
  ) {
    case "FIXED":
      return "Fixed Price";

    case "PER_UNIT":
      return "Per Unit";

    case "STARTING_FROM":
      return "Starting From";

    case "QUOTE_REQUIRED":
      return "Quote Required";

    case "FREE":
      return "Free / No Charge";

    case "MANUAL_PRICE":
      return "Manual Price";

    default:
      return mode;
  }
}