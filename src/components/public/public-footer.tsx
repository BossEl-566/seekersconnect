import Image from "next/image";
import Link from "next/link";

import {
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import {
  getSystemSettings,
} from "@/lib/settings/system-settings";


function normalisePhoneForLink(
  phone:
    string,
) {
  const cleaned =
    phone.replace(
      /\D/g,
      "",
    );


  if (
    cleaned.startsWith(
      "0",
    )
  ) {
    return `233${cleaned.slice(
      1,
    )}`;
  }


  return cleaned;
}


export async function PublicFooter() {
  const settings =
    await getSystemSettings();


  const {
    company,
    support,
  } =
    settings;


  const primaryPhone =
    support.phones[0] ??
    "";


  const whatsappNumber =
    normalisePhoneForLink(
      company.whatsapp,
    );


  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* COMPANY */}

          <div>
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11 overflow-hidden rounded-xl border">
                <Image
                  src="/seekersconnect-logo.jpg"
                  alt={
                    company.shortName
                  }
                  fill
                  className="object-contain p-1"
                />
              </div>


              <div>
                <p className="font-semibold text-slate-950">
                  {
                    company.shortName
                  }
                </p>

                <p className="text-xs text-slate-500">
                  Academic Request Services
                </p>
              </div>
            </div>


            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-500">
              Helping students and graduates request, process and
              receive academic documents from supported universities.
            </p>
          </div>


          {/* LINKS */}

          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Quick Links
            </h3>


            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
              <Link
                href="/request"
                className="hover:text-blue-600"
              >
                Start a Request
              </Link>

              <Link
                href="/track"
                className="hover:text-blue-600"
              >
                Track Request
              </Link>

              <Link
                href="/services"
                className="hover:text-blue-600"
              >
                Services
              </Link>

              <Link
                href="/contact"
                className="hover:text-blue-600"
              >
                Contact Us
              </Link>
            </div>
          </div>


          {/* CONTACT */}

          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Contact
            </h3>


            <div className="mt-4 space-y-3 text-sm text-slate-500">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                <span>
                  University of Cape Coast, Ghana
                </span>
              </div>


              <a
                href={`mailto:${company.email}`}
                className="flex gap-3 hover:text-blue-600"
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                <span className="break-all">
                  {
                    company.email
                  }
                </span>
              </a>


              {primaryPhone && (
                <a
                  href={`tel:${primaryPhone}`}
                  className="flex gap-3 hover:text-blue-600"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                  <span>
                    {
                      primaryPhone
                    }
                  </span>
                </a>
              )}


              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="flex gap-3 hover:text-blue-600"
              >
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                <span>
                  {
                    company.whatsapp
                  }
                </span>
              </a>
            </div>
          </div>


          {/* SUPPORT */}

          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Customer Support
            </h3>


            <div className="mt-4 space-y-2">
              {support.phones.map(
                (
                  phone,
                ) => (
                  <a
                    key={
                      phone
                    }
                    href={`tel:${phone}`}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Phone className="h-3.5 w-3.5" />

                    {
                      phone
                    }
                  </a>
                ),
              )}
            </div>
          </div>
        </div>


        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            ©{" "}
            {
              new Date()
                .getFullYear()
            }{" "}
            {
              company.name
            }
            . All rights reserved.
          </p>

          <p>
            Academic document request and delivery services.
          </p>
        </div>
      </div>
    </footer>
  );
}