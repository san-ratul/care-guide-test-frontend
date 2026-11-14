"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Search, SlidersHorizontal, Trash2, Users, X } from "lucide-react";
import { queries } from "@/lib/queries";
import { useDebounce } from "@/hooks/useDebounce";
import { useDeletePatient } from "@/hooks/usePatientMutations";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/ui/Avatar";
import { ConditionBadge, StatusBadge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PatientFormDialog } from "@/components/patients/PatientFormDialog";
import { PATIENT_CONDITIONS, PATIENT_STATUSES, type Patient } from "@/types";
import { formatDate, titleCase } from "@/lib/utils";

interface PatientFilters {
  search: string;
  condition: string;
  status: string;
  gender: string;
  doctorId: string;
  createdFrom: string;
  createdTo: string;
  sortBy: "createdAt" | "name" | "condition" | "status";
  sortOrder: "asc" | "desc";
}

const DEFAULT_FILTERS: PatientFilters = {
  search: "",
  condition: "",
  status: "",
  gender: "",
  doctorId: "",
  createdFrom: "",
  createdTo: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export default function PatientsPage() {
  const [filters, setFilters] = useState<PatientFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const debouncedSearch = useDebounce(filters.search);
  const deleteMutation = useDeletePatient();

  const queryParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      condition: filters.condition || undefined,
      status: filters.status || undefined,
      gender: filters.gender || undefined,
      doctorId: filters.doctorId || undefined,
      createdFrom: filters.createdFrom || undefined,
      createdTo: filters.createdTo || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
    [
      page,
      debouncedSearch,
      filters.condition,
      filters.status,
      filters.gender,
      filters.doctorId,
      filters.createdFrom,
      filters.createdTo,
      filters.sortBy,
      filters.sortOrder,
    ]
  );

  const patientsQuery = useQuery(queries.patients(queryParams));
  const doctorsQuery = useQuery({
    ...queries.doctors({ page: 1, limit: 100, sortBy: "name", sortOrder: "asc" }),
    enabled: showAdvanced || Boolean(filters.doctorId),
  });

  const updateFilter = <K extends keyof PatientFilters>(key: K, value: PatientFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    setShowAdvanced(false);
  };

  const hasActiveFilters =
    filters.search ||
    filters.condition ||
    filters.status ||
    filters.gender ||
    filters.doctorId ||
    filters.createdFrom ||
    filters.createdTo;

  const doctorName = (id: string) =>
    doctorsQuery.data?.data.find((d) => d._id === id)?.name ?? "—";

  return (
    <div>
      <PageHeader
        title="Patients"
        description="Dedicated patient directory with search, filters and pagination."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Patients" }]}
        actions={
          <Button
            onClick={() => {
              setEditingPatient(null);
              setFormOpen(true);
            }}
          >
            <Users className="h-4 w-4" aria-hidden />
            Add patient
          </Button>
        }
      />

      <Card>
        {/* Toolbar */}
        <div className="border-b border-slate-100 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                type="search"
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Search by name, phone, email or condition…"
                aria-label="Search patients"
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
            </div>
            <div className="flex gap-2">
              <Select
                aria-label="Filter by condition"
                value={filters.condition}
                onChange={(event) => updateFilter("condition", event.target.value)}
                className="md:w-44"
              >
                <option value="">All conditions</option>
                {PATIENT_CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {titleCase(condition)}
                  </option>
                ))}
              </Select>
              <Select
                aria-label="Filter by status"
                value={filters.status}
                onChange={(event) => updateFilter("status", event.target.value)}
                className="md:w-40"
              >
                <option value="">All statuses</option>
                {PATIENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {titleCase(status)}
                  </option>
                ))}
              </Select>
              <Button
                variant={showAdvanced ? "secondary" : "outline"}
                onClick={() => setShowAdvanced((v) => !v)}
                aria-expanded={showAdvanced}
                title="Date range, doctor, gender and sorting"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </div>
          </div>

          {showAdvanced ? (
            <div className="mt-3 grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                label="Registered from"
                type="date"
                value={filters.createdFrom}
                onChange={(event) => updateFilter("createdFrom", event.target.value)}
              />
              <Input
                label="Registered to"
                type="date"
                value={filters.createdTo}
                onChange={(event) => updateFilter("createdTo", event.target.value)}
              />
              <Select
                label="Doctor"
                value={filters.doctorId}
                onChange={(event) => updateFilter("doctorId", event.target.value)}
              >
                <option value="">All doctors</option>
                {(doctorsQuery.data?.data ?? []).map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Gender"
                value={filters.gender}
                onChange={(event) => updateFilter("gender", event.target.value)}
              >
                <option value="">All genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
              <Select
                label="Sort by"
                value={filters.sortBy}
                onChange={(event) =>
                  updateFilter("sortBy", event.target.value as PatientFilters["sortBy"])
                }
              >
                <option value="createdAt">Registration date</option>
                <option value="name">Name</option>
                <option value="condition">Condition</option>
                <option value="status">Status</option>
              </Select>
              <Select
                label="Direction"
                value={filters.sortOrder}
                onChange={(event) =>
                  updateFilter("sortOrder", event.target.value as PatientFilters["sortOrder"])
                }
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </Select>
            </div>
          ) : null}
        </div>

        {patientsQuery.isLoading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : patientsQuery.isError ? (
          <EmptyState
            icon={<X className="h-6 w-6" aria-hidden />}
            title="Failed to load patients"
            description="Make sure the backend is running, then retry."
            action={
              <Button variant="outline" onClick={() => void patientsQuery.refetch()}>
                Retry
              </Button>
            }
          />
        ) : !patientsQuery.data || patientsQuery.data.data.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" aria-hidden />}
            title={hasActiveFilters ? "No patients match your filters" : "No patients yet"}
            description={
              hasActiveFilters
                ? "Try adjusting the search terms or clearing the filters."
                : "Create a doctor first, then add patients under them."
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setEditingPatient(null);
                    setFormOpen(true);
                  }}
                >
                  Add patient
                </Button>
              )
            }
          />
        ) : (
          <>
            {/* Table (desktop) */}
            <div className="table-scroll hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-5 py-3 font-semibold">Patient</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Doctor</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Condition</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Contact</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Added</th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patientsQuery.data.data.map((patient) => (
                    <tr key={patient._id} className="group transition-colors hover:bg-slate-50/80">
                      <td className="px-5 py-3.5">
                        <Link href={`/patients/${patient._id}`} className="flex items-center gap-3">
                          <Avatar name={patient.name} className="h-8 w-8 text-[10px]" />
                          <div>
                            <p className="font-medium text-slate-900 group-hover:text-teal-700">
                              {patient.name}
                            </p>
                            <p className="text-xs capitalize text-slate-500">{patient.gender}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{doctorName(patient.doctorId)}</td>
                      <td className="px-5 py-3.5">
                        <ConditionBadge condition={patient.condition} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={patient.status} />
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{patient.phone}</td>
                      <td className="px-5 py-3.5 text-slate-500">{formatDate(patient.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Edit ${patient.name}`}
                            onClick={() => {
                              setEditingPatient(patient);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" aria-hidden />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                            aria-label={`Delete ${patient.name}`}
                            onClick={() => setDeletingPatient(patient)}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards (mobile/tablet) */}
            <ul className="divide-y divide-slate-100 lg:hidden">
              {patientsQuery.data.data.map((patient) => (
                <li key={patient._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/patients/${patient._id}`} className="flex items-center gap-3">
                      <Avatar name={patient.name} className="h-8 w-8 text-[10px]" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{patient.name}</p>
                        <p className="text-xs text-slate-500">{doctorName(patient.doctorId)}</p>
                      </div>
                    </Link>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Edit ${patient.name}`}
                        onClick={() => {
                          setEditingPatient(patient);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-500"
                        aria-label={`Delete ${patient.name}`}
                        onClick={() => setDeletingPatient(patient)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <ConditionBadge condition={patient.condition} />
                    <StatusBadge status={patient.status} />
                    <span className="text-xs text-slate-400">{formatDate(patient.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>

            {patientsQuery.data.meta ? (
              <Pagination
                meta={patientsQuery.data.meta}
                onPageChange={setPage}
                itemLabel="patients"
              />
            ) : null}
          </>
        )}
      </Card>

      <PatientFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingPatient(null);
        }}
        patient={editingPatient}
      />

      <ConfirmDialog
        open={Boolean(deletingPatient)}
        onClose={() => setDeletingPatient(null)}
        onConfirm={async () => {
          if (!deletingPatient) return;
          try {
            await deleteMutation.mutateAsync(deletingPatient);
          } finally {
            setDeletingPatient(null);
          }
        }}
        title="Delete patient"
        message={`This permanently removes "${deletingPatient?.name ?? ""}" from their doctor's list and from the portal.`}
        confirmLabel="Delete patient"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
