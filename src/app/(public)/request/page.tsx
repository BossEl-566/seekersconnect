import { RequestWizard } from "@/components/forms/request-wizard";

export default function RequestPage() {
  return (
    <section className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            Academic Document Request
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Start a new request
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Complete the steps below carefully. Your progress is saved
            automatically on this device until the request is submitted.
          </p>
        </div>

        <RequestWizard />
      </div>
    </section>
  );
}