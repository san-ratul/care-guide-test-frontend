"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Search, SlidersHorizontal, Stethoscope, Trash2, X } from "lucide-react";
import { queries } from "@/lib/queries";
import { useDebounce } from "@/hooks/useDebounce";
import { useDeleteDoctor } from "@/hooks/useDoctorMutations";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/ui/Avatar";
import { SpecializationBadge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DoctorFormDialog } from "@/components/doctors/DoctorFormDialog";
import { DOCTOR_SPECIALIZATIONS, type Doctor } from "@/types";
import { formatDate } from "@/lib/utils";

interface DoctorFilters {
  search: string;
  specialization: string;
  createdFrom: string;
  createdTo: string;
  sortBy: "createdAt" | "name" | "specialization";
  sortOrder: "asc" | "desc";
}

const DEFAULT_FILTERS: DoctorFilters = {
  search: "",
  specialization: "",
  createdFrom: "",
  createdTo: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export default function DoctorsPage() {
  const [filters, setFilters] = useState<DoctorFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deletingDoctor, setDeletingDoctor] = useState<Doctor | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const debouncedSearch = useDebounce(filters.search);
  const deleteMutation = useDeleteDoctor();

  const queryParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      specialization: filters.specialization || undefined,
      createdFrom: filters.createdFrom || undefined,
      createdTo: filters.createdTo || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
    [page, debouncedSearch, filters.specialization, filters.createdFrom, filters.createdTo, filters.sortBy, filters.sortOrder]
  );

  const doctorsQuery = useQuery(queries.doctors(queryParams));

  const updateFilter = <K extends keyof DoctorFilters>(key: K, value: DoctorFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    setShowAdvanced(false);
  };

  const hasActiveFilters =
    filters.search || filters.specialization || filters.createdFrom || filters.createdTo;

  return (
    <div>
      <PageHeader
        title="Doctors"
        description="Create, search, filter and manage doctor records."
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Doctors" }]}
        actions={
          <Button
            onClick={() => {
              setEditingDoctor(null);
              setFormOpen(true);
            }}
          >
            <Stethoscope className="h-4 w-4" aria-hidden />
            Add doctor
          </Button>
        }
      />

      <Card>
        {/* Filter toolbar */}
        <div className="border-b border-slate-100 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                type="search"
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Search by name, email, hospital or specialization…"
                aria-label="Search doctors"
                className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
            </div>
            <div className="flex gap-2">
              <Select
                aria-label="Filter by specialization"
                value={filters.specialization}
                onChange={(event) => updateFilter("specialization", event.target.value)}
                className="md:w-48"
              >
                <option value="">All specializations</option>
                {DOCTOR_SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
              <Button
                variant={showAdvanced ? "secondary" : "outline"}
                onClick={() => setShowAdvanced((v) => !v)}
                aria-expanded={showAdvanced}
                title="Date range and sorting"
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
                label="Sort by"
                value={filters.sortBy}
                onChange={(event) =>
                  updateFilter("sortBy", event.target.value as DoctorFilters["sortBy"])
                }
              >
                <option value="createdAt">Registration date</option>
                <option value="name">Name</option>
                <option value="specialization">Specialization</option>
              </Select>
              <Select
                label="Direction"
                value={filters.sortOrder}
                onChange={(event) =>
                  updateFilter("sortOrder", event.target.value as DoctorFilters["sortOrder"])
                }
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </Select>
            </div>
          ) : null}
        </div>

        {/* Table (desktop) */}
        {doctorsQuery.isLoading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : doctorsQuery.isError ? (
          <EmptyState
            icon={<X className="h-6 w-6" aria-hidden />}
            title="Failed to load doctors"
            description="Make sure the backend is running, then retry."
            action={
              <Button variant="outline" onClick={() => void doctorsQuery.refetch()}>
                Retry
              </Button>
            }
          />
        ) : !doctorsQuery.data || doctorsQuery.data.data.length === 0 ? (
          <EmptyState
            icon={<Stethoscope className="h-6 w-6" aria-hidden />}
            title={hasActiveFilters ? "No doctors match your filters" : "No doctors yet"}
            description={
              hasActiveFilters
                ? "Try adjusting the search terms or clearing the filters."
                : "Create the first doctor record to get started."
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" onClick={resetFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setEditingDoctor(null);
                    setFormOpen(true);
                  }}
                >
                  Add doctor
                </Button>
              )
            }
          />
        ) : (
          <>
            <div className="table-scroll hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-5 py-3 font-semibold">Doctor</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Specialization</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Hospital</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Contact</th>
                    <th scope="col" className="px-5 py-3 font-semibold">Registered</th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {doctorsQuery.data.data.map((doctor) => (
                    <tr key={doctor._id} className="group transition-colors hover:bg-slate-50/80">
                      <td className="px-5 py-3.5">
                        <Link href={`/doctors/${doctor._id}`} className="flex items-center gap-3">
                          <Avatar name={doctor.name} />
                          <div>
                            <p className="font-medium text-slate-900 group-hover:text-teal-700">
                              {doctor.name}
                            </p>
                            <p className="text-xs text-slate-500">{doctor.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <SpecializationBadge value={doctor.specialization} />
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{doctor.hospital}</td>
                      <td className="px-5 py-3.5 text-slate-600">{doctor.phone}</td>
                      <td className="px-5 py-3.5 text-slate-500">{formatDate(doctor.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Edit ${doctor.name}`}
                            onClick={() => {
                              setEditingDoctor(doctor);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" aria-hidden />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                            aria-label={`Delete ${doctor.name}`}
                            onClick={() => setDeletingDoctor(doctor)}
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

            {/* Cards (mobile) */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {doctorsQuery.data.data.map((doctor) => (
                <li key={doctor._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/doctors/${doctor._id}`} className="flex items-center gap-3">
                      <Avatar name={doctor.name} />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{doctor.name}</p>
                        <p className="text-xs text-slate-500">{doctor.hospital}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <SpecializationBadge value={doctor.specialization} />
                          <span className="text-xs text-slate-400">{formatDate(doctor.createdAt)}</span>
                        </div>
                      </div>
                    </Link>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Edit ${doctor.name}`}
                        onClick={() => {
                          setEditingDoctor(doctor);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" aria-hidden />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-500"
                        aria-label={`Delete ${doctor.name}`}
                        onClick={() => setDeletingDoctor(doctor)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-slate-500">
                    <span>{doctor.phone}</span>
                    <span className="truncate">{doctor.email}</span>
                  </div>
                </li>
              ))}
            </ul>

            {doctorsQuery.data.meta ? (
              <Pagination
                meta={doctorsQuery.data.meta}
                onPageChange={setPage}
                itemLabel="doctors"
              />
            ) : null}
          </>
        )}
      </Card>

      <DoctorFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingDoctor(null);
        }}
        doctor={editingDoctor}
      />

      <ConfirmDialog
        open={Boolean(deletingDoctor)}
        onClose={() => setDeletingDoctor(null)}
        onConfirm={async () => {
          if (!deletingDoctor) return;
          try {
            await deleteMutation.mutateAsync(deletingDoctor);
          } finally {
            setDeletingDoctor(null);
          }
        }}
        title="Delete doctor"
        message={`This permanently removes "${deletingDoctor?.name ?? ""}" from the portal. Doctors with assigned patients cannot be deleted.`}
        confirmLabel="Delete doctor"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
