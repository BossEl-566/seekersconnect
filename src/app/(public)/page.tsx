import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Headphones,
  MapPin,
  MessageCircle,
  PackageCheck,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";

import {
  getSystemSettings,
} from "@/lib/settings/system-settings";

import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getPublicUniversities,
} from "@/lib/catalog/public-universities";

const steps = [
  {
    number: "01",
    title: "Choose your university",
    description:
      "Select your institution and the academic document you want us to process.",
    icon: Building2,
  },
  {
    number: "02",
    title: "Complete your request",
    description:
      "Provide the required academic, applicant and delivery information.",
    icon: FileText,
  },
  {
    number: "03",
    title: "Submit payment proof",
    description:
      "Follow the payment instructions and securely upload your proof of payment.",
    icon: Upload,
  },
  {
    number: "04",
    title: "We process it",
    description:
      "Our team verifies your request and handles the university processing.",
    icon: FileCheck2,
  },
  {
    number: "05",
    title: "Track & receive",
    description:
      "Follow every stage and receive your scanned or physically delivered document.",
    icon: PackageCheck,
  },
];

const services = [
  {
    title: "Academic Transcripts",
    description:
      "Request official academic transcripts from supported universities.",
    icon: FileText,
  },
  {
    title: "Attestation Letters",
    description:
      "Submit and track requests for official attestation documents.",
    icon: ShieldCheck,
  },
  {
    title: "English Proficiency",
    description:
      "Request English proficiency letters where supported by your institution.",
    icon: Send,
  },
];

export default async function HomePage() {
  const [
    settings,
    universities,
  ] =
    await Promise.all([
      getSystemSettings(),
      getPublicUniversities(),
    ]);


  const {
    company,
    support,
  } =
    settings;


  const whatsappDigits =
    company.whatsapp.replace(
      /\D/g,
      "",
    );


  const whatsappNumber =
    whatsappDigits.startsWith(
      "0",
    )
      ? `233${whatsappDigits.slice(
          1,
        )}`
      : whatsappDigits;


  const universityCodes =
    universities
      .map(
        (
          university,
        ) =>
          university.code,
      )
      .join(
        ", ",
      );


  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-100/70 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
          <div>
            <Badge
              variant="outline"
              className="rounded-full border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Academic document requests made simpler
            </Badge>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl lg:leading-[1.05]">
              Your academic documents,
              <span className="text-blue-600"> handled for you.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Request transcripts, attestation letters, English proficiency
              letters and other supported academic documents without
              unnecessary travel or uncertainty.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
  href="/request"
  className={buttonVariants({
    size: "lg",
    className:
      "h-12 rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-700",
  })}
>
  Start a Request
  <ArrowRight className="ml-2 h-4 w-4" />
</Link>

              <Link
  href="/track"
  className={buttonVariants({
    variant: "outline",
    size: "lg",
    className: "h-12 rounded-xl bg-white px-6",
  })}
>
  <Search className="mr-2 h-4 w-4" />
  Track Existing Request
</Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                No account required
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Request tracking
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Customer support
              </div>
            </div>
          </div>

          {/* REQUEST PREVIEW */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 -z-10 rounded-[40px] bg-blue-100/70 blur-2xl" />

            <div className="rounded-[28px] border border-white/80 bg-white p-3 shadow-[0_25px_80px_rgba(15,23,42,0.12)]">
              <div className="rounded-[22px] border border-slate-200 bg-[#f8fafc] p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-blue-600">
                      Request overview
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-950">
                      Start your document request
                    </h2>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                    <FileText className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">
                    UNIVERSITY
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Building2 className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">
                          Select institution
                        </p>
                        <p className="text-xs text-slate-500">
  {universityCodes ||
    "Supported universities"}
</p>
                      </div>
                    </div>

                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-medium text-slate-500">
                    POPULAR SERVICES
                  </p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {["Transcript", "Attestation", "Proficiency"].map(
                      (service) => (
                        <div
                          key={service}
                          className="rounded-xl border border-slate-200 px-3 py-3 text-center text-xs font-medium text-slate-700"
                        >
                          {service}
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-blue-600 p-4 text-white">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <Clock3 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Track every important stage
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-blue-100">
                      From payment verification through university processing
                      and delivery.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  {[
                    ["Submitted", true],
                    ["Payment", true],
                    ["University", false],
                    ["Delivery", false],
                  ].map(([label, completed], index) => (
                    <div
                      key={String(label)}
                      className="flex flex-1 items-center"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full ${
                            completed
                              ? "bg-blue-600 text-white"
                              : "border border-slate-300 bg-white text-slate-400"
                          }`}
                        >
                          {completed ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <span className="text-[10px]">{index + 1}</span>
                          )}
                        </div>

                        <span className="hidden text-[10px] text-slate-500 sm:block">
                          {label}
                        </span>
                      </div>

                      {index < 3 && (
                        <div
                          className={`mb-5 h-px flex-1 ${
                            index === 0 ? "bg-blue-500" : "bg-slate-200"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UNIVERSITIES */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500">
              Currently supporting
            </p>
          </div>

          {universities.length >
0 ? (
  <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
    {universities.map(
      (
        university,
      ) => (
        <div
          key={
            university.id
          }
          className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-100"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Building2 className="h-5 w-5" />
          </div>


          <p className="mt-4 text-lg font-semibold text-slate-950">
            {
              university.code
            }
          </p>


          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {
              university.name
            }
          </p>


          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
            <MapPin className="h-3.5 w-3.5" />

            {
              university.location ||
              "Location not specified"
            }
          </div>
        </div>
      ),
    )}
  </div>
) : (
  <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
    <Building2 className="mx-auto h-7 w-7 text-slate-400" />

    <p className="mt-3 font-semibold text-slate-800">
      No universities are currently available.
    </p>

    <p className="mt-1 text-sm text-slate-500">
      Please check again later or contact our support team.
    </p>
  </div>
)}
        </div>
      </section>

      {/* SERVICES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <Badge
            variant="outline"
            className="rounded-full border-blue-200 bg-blue-50 text-blue-700"
          >
            Our Services
          </Badge>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            One place for your academic document requests.
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Available services depend on your institution and programme. The
            request process guides you through exactly what information is
            required.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-6 text-lg font-semibold">{service.title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <Badge className="rounded-full bg-blue-500/15 text-blue-300 hover:bg-blue-500/15">
              How it works
            </Badge>

            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              From request to delivery, without the guesswork.
            </h2>

            <p className="mt-4 leading-7 text-slate-400">
              We keep the process clear so you know what has happened, what is
              happening now, and what comes next.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="rounded-[22px] border border-white/10 bg-white/[0.04] p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="text-xs font-medium text-slate-600">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-5 font-semibold">{step.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TRACKING CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="overflow-hidden rounded-[30px] border border-blue-100 bg-blue-600">
          <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_0.7fr] lg:p-14">
            <div>
              <Badge className="bg-white/15 text-white hover:bg-white/15">
                Request Tracking
              </Badge>

              <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Already submitted a request?
              </h2>

              <p className="mt-4 max-w-xl leading-7 text-blue-100">
                Use your tracking details to see the latest progress of your
                request, from payment verification to document processing and
                delivery.
              </p>

              <Link
  href="/track"
  className={buttonVariants({
    size: "lg",
    className:
      "mt-7 rounded-xl bg-white text-blue-700 hover:bg-blue-50",
  })}
>
  Track My Request
  <ArrowRight className="ml-2 h-4 w-4" />
</Link>
            </div>

            <div className="flex items-center">
              <div className="w-full rounded-[24px] border border-white/20 bg-white/10 p-5 backdrop-blur">
                {[
                  ["Payment confirmed", "Completed"],
                  ["University processing", "In progress"],
                  ["Document ready", "Pending"],
                  ["EMS delivery", "Pending"],
                ].map(([label, status], index) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between py-3 ${
                      index !== 3 ? "border-b border-white/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          index === 0
                            ? "bg-emerald-300"
                            : index === 1
                              ? "bg-yellow-300"
                              : "bg-white/30"
                        }`}
                      />

                      <span className="text-sm text-white">{label}</span>
                    </div>

                    <span className="text-xs text-blue-100">{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORT */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-2 lg:px-8">
          <a
  href={`https://wa.me/${whatsappNumber}`}
  target="_blank"
  rel="noreferrer"
  className="flex gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-md"
>
  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
    <MessageCircle className="h-5 w-5" />
  </div>


  <div>
    <h3 className="font-semibold">
      WhatsApp Support
    </h3>

    <p className="mt-1 text-sm leading-6 text-slate-500">
      Need help completing a request? Reach our support team on
      WhatsApp.
    </p>

    <p className="mt-3 text-sm font-semibold text-blue-600">
      {
        company.whatsapp
      }
    </p>
  </div>
</a>

          <a
  href={
    support.phones[0]
      ? `tel:${support.phones[0]}`
      : "/contact"
  }
  className="flex gap-4 rounded-2xl border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-md"
>
  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
    <Headphones className="h-5 w-5" />
  </div>


  <div>
    <h3 className="font-semibold">
      Customer Support
    </h3>

    <p className="mt-1 text-sm leading-6 text-slate-500">
      Our team can assist with request information, payment
      verification and delivery enquiries.
    </p>


    {support.phones[0] && (
      <p className="mt-3 text-sm font-semibold text-blue-600">
        {
          support.phones[0]
        }
      </p>
    )}
  </div>
</a>
        </div>
      </section>
    </>
  );
}