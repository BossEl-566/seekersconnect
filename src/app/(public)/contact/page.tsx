import {
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import {
  getSystemSettings,
} from "@/lib/settings/system-settings";


function whatsappLink(
  value:
    string,
) {
  const cleaned =
    value.replace(
      /\D/g,
      "",
    );


  if (
    cleaned.startsWith(
      "0",
    )
  ) {
    return `https://wa.me/233${cleaned.slice(
      1,
    )}`;
  }


  return `https://wa.me/${cleaned}`;
}


export default async function ContactPage() {
  const settings =
    await getSystemSettings();


  const {
    company,
    support,
  } =
    settings;


  return (
    <>
      {/* HERO */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-sm font-medium text-blue-600">
            Support
          </p>


          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Contact{" "}
            {
              company.shortName
            }
          </h1>


          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Need help with an academic document request, payment
            verification, tracking or delivery? Our support team is
            available to assist you.
          </p>
        </div>
      </section>


      {/* CONTACT METHODS */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {/* WHATSAPP */}

          <a
            href={
              whatsappLink(
                company.whatsapp,
              )
            }
            target="_blank"
            rel="noreferrer"
            className="group rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <MessageCircle className="h-5 w-5" />
            </div>


            <h2 className="mt-6 text-lg font-semibold text-slate-950">
              WhatsApp Support
            </h2>


            <p className="mt-2 text-sm leading-6 text-slate-500">
              Send us a WhatsApp message for assistance with your
              request.
            </p>


            <p className="mt-5 font-semibold text-blue-600">
              {
                company.whatsapp
              }
            </p>
          </a>


          {/* EMAIL */}

          <a
            href={`mailto:${support.supportEmail}`}
            className="group rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Mail className="h-5 w-5" />
            </div>


            <h2 className="mt-6 text-lg font-semibold text-slate-950">
              Email Support
            </h2>


            <p className="mt-2 text-sm leading-6 text-slate-500">
              Email our support team with questions or information
              relating to an existing request.
            </p>


            <p className="mt-5 break-all font-semibold text-blue-600">
              {
                support.supportEmail
              }
            </p>
          </a>


          {/* LOCATION */}

          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <MapPin className="h-5 w-5" />
            </div>


            <h2 className="mt-6 text-lg font-semibold text-slate-950">
              Location
            </h2>


            <p className="mt-2 text-sm leading-6 text-slate-500">
              Seekers Connect 247 Enterprise
            </p>


            <p className="mt-5 font-semibold text-slate-800">
              University of Cape Coast, Ghana
            </p>
          </div>
        </div>


        {/* PHONE NUMBERS */}

        <div className="mt-10 rounded-[28px] border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex max-w-xl gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <Headphones className="h-5 w-5" />
              </div>


              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Customer Support Lines
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Call any of the support numbers below if you need
                  help with your request, payment verification,
                  university processing or delivery.
                </p>
              </div>
            </div>


            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[390px]">
              {support.phones.map(
                (
                  phone,
                ) => (
                  <a
                    key={
                      phone
                    }
                    href={`tel:${phone}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-800 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Phone className="h-4 w-4" />
                    </div>

                    {
                      phone
                    }
                  </a>
                ),
              )}
            </div>
          </div>
        </div>


        {/* GENERAL EMAIL */}

        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex gap-3">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

            <div>
              <p className="font-semibold text-blue-950">
                General enquiries
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                For general business enquiries, contact{" "}

                <a
                  href={`mailto:${company.email}`}
                  className="font-semibold underline underline-offset-2"
                >
                  {
                    company.email
                  }
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}