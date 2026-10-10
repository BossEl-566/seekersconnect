import type {
  Metadata,
} from "next";

import {
  QuotePaymentForm,
} from "@/components/public/quote-payment-form";


export const metadata:
  Metadata =
{
  title:
    "Complete Payment | Seekers Connect 247",

  robots: {
    index:
      false,

    follow:
      false,
  },
};


type PageProps = {
  params: Promise<{
    token:
      string;
  }>;
};


export default async function QuotePaymentPage({
  params,
}: PageProps) {
  const {
    token,
  } =
    await params;


  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-14">
      <QuotePaymentForm
        token={
          token
        }
      />
    </main>
  );
}