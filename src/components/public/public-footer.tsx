import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { COMPANY } from "@/constants/company";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11 overflow-hidden rounded-xl border">
                <Image
                  src="/seekersconnect-logo.jpg"
                  alt="Seekers Connect 247"
                  fill
                  className="object-contain p-1"
                />
              </div>

              <div>
                <p className="font-semibold text-slate-950">
                  Seekers Connect 247
                </p>
                <p className="text-xs text-slate-500">
                  Academic Request Services
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-500">
              Helping students and graduates request, process and receive
              academic documents from supported universities.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Quick Links
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
              <Link href="/request" className="hover:text-blue-600">
                Start a Request
              </Link>
              <Link href="/track" className="hover:text-blue-600">
                Track Request
              </Link>
              <Link href="/services" className="hover:text-blue-600">
                Services
              </Link>
              <Link href="/contact" className="hover:text-blue-600">
                Contact Us
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Contact
            </h3>

            <div className="mt-4 space-y-3 text-sm text-slate-500">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>University of Cape Coast, Ghana</span>
              </div>

              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span className="break-all">{COMPANY.email}</span>
              </div>

              <div className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>{COMPANY.supportPhones[0]}</span>
              </div>

              <div className="flex gap-3">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>{COMPANY.whatsapp}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Supported Universities
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {["UCC", "UEW", "UG", "KNUST"].map((university) => (
                <div
                  key={university}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-slate-700"
                >
                  {university}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>

          <p>Academic document request and delivery services.</p>
        </div>
      </div>
    </footer>
  );
}