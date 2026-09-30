"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  Building2,
  CheckCircle2,
  CircleOff,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Power,
  Save,
  X,
} from "lucide-react";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  createUniversity,
  setUniversityActive,
  updateUniversity,
} from "@/app/admin/(dashboard)/universities/actions";


export type UniversityItem = {
  id: string;

  code: string;

  name: string;

  location: string;

  active: boolean;

  created_at: string;

  updated_at: string;
};


export function UniversitiesManager({
  universities,
}: {
  universities:
    UniversityItem[];
}) {
  return (
    <div className="space-y-6">
      <CreateUniversityCard />

      <UniversityList
        universities={
          universities
        }
      />
    </div>
  );
}


// =========================================================
// CREATE UNIVERSITY
// =========================================================

function CreateUniversityCard() {
  const [
    open,
    setOpen,
  ] =
    useState(false);


  const [
    code,
    setCode,
  ] =
    useState("");


  const [
    name,
    setName,
  ] =
    useState("");


  const [
    location,
    setLocation,
  ] =
    useState("");


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    success,
    setSuccess,
  ] =
    useState("");


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  function reset() {
    setCode("");
    setName("");
    setLocation("");
    setError("");
  }


  function handleCreate() {
    setError("");
    setSuccess("");


    startTransition(
      async () => {
        const result =
          await createUniversity(
            {
              code,
              name,
              location,
            },
          );


        if (!result.success) {
          setError(
            result.error,
          );

          return;
        }


        reset();

        setSuccess(
          "University added successfully.",
        );

        setOpen(false);
      },
    );
  }


  return (
    <div className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="font-semibold text-slate-950">
            University Directory
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Add universities that Seekers Connect supports.
          </p>
        </div>


        <Button
          type="button"
          onClick={() =>
            setOpen(
              (value) =>
                !value,
            )
          }
          className="rounded-xl bg-blue-600 hover:bg-blue-700"
        >
          {open ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add University
            </>
          )}
        </Button>
      </div>


      {success && (
        <div className="mx-5 mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 sm:mx-6">
          <CheckCircle2 className="h-4 w-4" />

          {success}
        </div>
      )}


      {open && (
        <div className="border-t border-slate-100 p-5 sm:p-6">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="universityCode">
                University Code
              </Label>

              <Input
                id="universityCode"
                value={
                  code
                }
                onChange={(
                  event,
                ) =>
                  setCode(
                    event.target.value
                      .toUpperCase(),
                  )
                }
                placeholder="e.g. UDS"
                maxLength={
                  12
                }
                disabled={
                  pending
                }
                className="uppercase"
              />

              <p className="text-xs text-slate-400">
                Short unique identifier.
              </p>
            </div>


            <div className="space-y-2">
              <Label htmlFor="universityName">
                University Name
              </Label>

              <Input
                id="universityName"
                value={
                  name
                }
                onChange={(
                  event,
                ) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="University for Development Studies"
                disabled={
                  pending
                }
              />
            </div>


            <div className="space-y-2">
              <Label htmlFor="universityLocation">
                Location
              </Label>

              <Input
                id="universityLocation"
                value={
                  location
                }
                onChange={(
                  event,
                ) =>
                  setLocation(
                    event.target.value,
                  )
                }
                placeholder="Tamale, Ghana"
                disabled={
                  pending
                }
              />
            </div>
          </div>


          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}


          <div className="mt-5 flex justify-end">
            <Button
              type="button"
              disabled={
                pending ||
                !code.trim() ||
                !name.trim() ||
                !location.trim()
              }
              onClick={
                handleCreate
              }
              className="rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add University
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


// =========================================================
// UNIVERSITY LIST
// =========================================================

function UniversityList({
  universities,
}: {
  universities:
    UniversityItem[];
}) {
  if (
    universities.length ===
    0
  ) {
    return (
      <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <Building2 className="mx-auto h-7 w-7 text-slate-400" />

        <h3 className="mt-4 font-semibold text-slate-900">
          No universities
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Add the first university to begin configuring services.
        </p>
      </div>
    );
  }


  return (
    <div className="grid gap-4">
      {universities.map(
        (university) => (
          <UniversityCard
            key={
              university.id
            }
            university={
              university
            }
          />
        ),
      )}
    </div>
  );
}


// =========================================================
// UNIVERSITY CARD
// =========================================================

function UniversityCard({
  university,
}: {
  university:
    UniversityItem;
}) {
  const [
    editing,
    setEditing,
  ] =
    useState(false);


  const [
    name,
    setName,
  ] =
    useState(
      university.name,
    );


  const [
    location,
    setLocation,
  ] =
    useState(
      university.location,
    );


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    pending,
    startTransition,
  ] =
    useTransition();


  function cancelEditing() {
    setName(
      university.name,
    );

    setLocation(
      university.location,
    );

    setError("");

    setEditing(false);
  }


  function handleSave() {
    setError("");


    startTransition(
      async () => {
        const result =
          await updateUniversity(
            university.id,
            {
              name,
              location,
            },
          );


        if (!result.success) {
          setError(
            result.error,
          );

          return;
        }


        setEditing(false);
      },
    );
  }


  function handleStatusToggle() {
    setError("");


    startTransition(
      async () => {
        const result =
          await setUniversityActive(
            university.id,
            !university.active,
          );


        if (!result.success) {
          setError(
            result.error,
          );
        }
      },
    );
  }


  return (
    <div
      className={`rounded-[24px] border bg-white p-5 shadow-sm sm:p-6 ${
        university.active
          ? "border-slate-200"
          : "border-slate-200 opacity-75"
      }`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              university.active
                ? "bg-blue-50 text-blue-600"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {university.active ? (
              <Building2 className="h-5 w-5" />
            ) : (
              <CircleOff className="h-5 w-5" />
            )}
          </div>


          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-slate-950 px-2.5 py-1 font-mono text-xs font-semibold text-white">
                {
                  university.code
                }
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                  university.active
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {university.active
                  ? "Active"
                  : "Disabled"}
              </span>
            </div>


            {!editing && (
              <>
                <h3 className="mt-3 text-lg font-semibold text-slate-950">
                  {
                    university.name
                  }
                </h3>

                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />

                  {
                    university.location
                  }
                </p>
              </>
            )}
          </div>
        </div>


        {!editing && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={
                pending
              }
              onClick={() =>
                setEditing(
                  true,
                )
              }
              className="rounded-xl"
            >
              <Pencil className="mr-2 h-4 w-4" />

              Edit
            </Button>


            <Button
              type="button"
              variant="outline"
              disabled={
                pending
              }
              onClick={
                handleStatusToggle
              }
              className={`rounded-xl ${
                university.active
                  ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                  : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {pending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Power className="mr-2 h-4 w-4" />
              )}

              {university.active
                ? "Disable"
                : "Enable"}
            </Button>
          </div>
        )}
      </div>


      {editing && (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                University Name
              </Label>

              <Input
                value={
                  name
                }
                onChange={(
                  event,
                ) =>
                  setName(
                    event.target.value,
                  )
                }
                disabled={
                  pending
                }
              />
            </div>


            <div className="space-y-2">
              <Label>
                Location
              </Label>

              <Input
                value={
                  location
                }
                onChange={(
                  event,
                ) =>
                  setLocation(
                    event.target.value,
                  )
                }
                disabled={
                  pending
                }
              />
            </div>
          </div>


          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            University code{" "}
            <strong>
              {university.code}
            </strong>{" "}
            is intentionally not editable because services and historical
            records may depend on it.
          </div>


          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}


          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={
                pending
              }
              onClick={
                cancelEditing
              }
              className="rounded-xl"
            >
              <X className="mr-2 h-4 w-4" />

              Cancel
            </Button>


            <Button
              type="button"
              disabled={
                pending ||
                !name.trim() ||
                !location.trim()
              }
              onClick={
                handleSave
              }
              className="rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}


      {!editing &&
        error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
    </div>
  );
}