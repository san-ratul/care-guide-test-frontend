"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Mail,
  Pencil,
  Phone,
  Plus,
  Stethoscope,
  Trash2,
  Users,
} from "lucide-react";
import { queries } from "@/lib/queries";
import { useDebounce } from "@/hooks/useDebounce";
import { useDeleteDoctor } from "@/hooks/useDoctorMutations";
import { useDeletePatient } from "@/hooks/usePatientMutations";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/ui/Avatar";
import { ConditionBadge, SpecializationBadge, StatusBadge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DoctorFormDialog } from "@/components/doctors/DoctorFormDialog";
import { PatientFormDialog } from "@/components/patients/PatientFormDialog";
import { PATIENT_CONDITIONS, type Patient } from "@/types";
import { formatDate, titleCase } from "@/lib/utils";

function DoctorDetailSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading doctor">
      <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
      <div className="h-44 animate-pulse rounded-xl bg-slate-200" />
      <div className="h-72 animate-pulse rounded-xl bg-slate-200" />
    </div>
  );
}

export default function DoctorDetailPage() {
  return (
    <Suspense fallback={<DoctorDetailSkeleton />}>
      <DoctorDetailContent />
    </Suspense>
  );
}

function DoctorDetailContent() {
  const params = useParams<{ id: string }>();
  const doctorId = params.id;
  const router = useRouter();

  const [patientSearch, setPatientSearch] = useState("");
  const [patientCondition, setPatientCondition] = useState("");
  const [patientPage, setPatientPage] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [confirmDoctorDelete, setConfirmDoctorDelete] = useState(false);

  const debouncedSearch = useDebounce(patientSearch);
  const deleteDoctorMutation = useDeleteDoctor();
  const deletePatientMutation = useDeletePatient();

  const doctorQuery = useQuery(queries.doctor(doctorId));
  const patientsQuery = useQuery(
    queries.doctorPatients(doctorId, {
      page: patientPage,
      limit: 5,
      search: debouncedSearch || undefined,
      condition: patientCondition || undefined,
    })
  );

  const patientList = useMemo(() => patientsQuery.data?.data ?? [], [patientsQuery.data]);

  if (doctorQuery.isLoading) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading doctor">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-44 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-72 animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (doctorQuery.isError || !doctorQuery.data) {
    return (
      <EmptyState
        icon={<Stethoscope className="h-6 w-6" aria-hidden />}
        title="Doctor not found"
        description="The doctor may have been deleted, or the link is incorrect."
        action={
          <Button variant="outline" onClick={() => router.push("/doctors")}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to doctors
          </Button>
        }
      />
    );
  }

  const doctor = doctorQuery.data;

  return (
    <div>
      <PageHeader
        title={doctor.name}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Doctors", href: "/doctors" },
          { label: doctor.name },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" aria-hidden />
              Edit doctor
            </Button>
            <Button
              variant="danger"
              onClick={() => setConfirmDoctorDelete(true)}
              disabled={(doctor.patientCount ?? 0) > 0}
              title={
                (doctor.patientCount ?? 0) > 0
                  ? "Remove all patients before deleting this doctor"
                  : undefined
              }
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Delete
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardBody>
            <div className="flex items-center gap-4">
              <Avatar name={doctor.name} className="h-14 w-14 text-lg" />
              <div>
                <p className="text-base font-semibold text-slate-900">{doctor.name}</p>
                <SpecializationBadge value={doctor.specialization} className="mt-1" />
              </div>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Building2 className="h-4 w-4 text-slate-400" aria-hidden />
                <span>{doctor.hospital}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" aria-hidden />
                <span>{doctor.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" aria-hidden />
                <span className="break-all">{doctor.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden />
                <span>Registered {formatDate(doctor.createdAt)}</span>
              </div>
            </dl>
            <div className="mt-5 rounded-lg bg-teal-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-teal-700">Patient count</p>
              <p className="mt-0.5 text-xl font-bold text-teal-800">{doctor.patientCount ?? 0}</p>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Patients of {doctor.name}</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500">
                {patientsQuery.data?.meta.total ?? 0} patient(s) under this doctor
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setAddPatientOpen(true)}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add patient
            </Button>
          </CardHeader>

          <div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row">
            <div className="relative flex-1">
              <input
                type="search"
                value={patientSearch}
                onChange={(event) => {
                  setPatientSearch(event.target.value);
                  setPatientPage(1);
                }}
                placeholder="Search patients by name, phone, condition…"
                aria-label="Search this doctor's patients"
                className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-3 pr-3 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
            </div>
            <Select
              aria-label="Filter patients by condition"
              value={patientCondition}
              onChange={(event) => {
                setPatientCondition(event.target.value);
                setPatientPage(1);
              }}
              className="h-9 sm:w-48"
            >
              <option value="">All conditions</option>
              {PATIENT_CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {titleCase(condition)}
                </option>
              ))}
            </Select>
          </div>

          {patientsQuery.isLoading ? (
            <TableSkeleton rows={4} columns={4} />
          ) : patientList.length === 0 ? (
            <EmptyState
              icon={<Users className="h-6 w-6" aria-hidden />}
              title="No patients assigned"
              description="Add the first patient under this doctor."
              action={<Button onClick={() => setAddPatientOpen(true)}>Add patient</Button>}
            />
          ) : (
            <>
              <ul className="divide-y divide-slate-100">
                {patientList.map((patient) => (
                  <li key={patient._id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <Link href={`/patients/${patient._id}`} className="flex min-w-0 items-center gap-3">
                      <Avatar name={patient.name} className="h-8 w-8 text-[10px]" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 hover:text-teal-700">
                          {patient.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {patient.phone} · added {formatDate(patient.createdAt)}
                        </p>
                      </div>
                    </Link>
                    <div className="flex shrink-0 items-center gap-2">
                      <ConditionBadge condition={patient.condition} />
                      <StatusBadge status={patient.status} />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Remove patient ${patient.name}`}
                        onClick={() => setDeletingPatient(patient)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              {patientsQuery.data?.meta ? (
                <Pagination
                  meta={patientsQuery.data.meta}
                  onPageChange={setPatientPage}
                  itemLabel="patients"
                />
              ) : null}
            </>
          )}
        </Card>
      </div>

      <DoctorFormDialog open={editOpen} onClose={() => setEditOpen(false)} doctor={doctor} />
      <PatientFormDialog
        open={addPatientOpen}
        onClose={() => setAddPatientOpen(false)}
        lockedDoctorId={doctor._id}
      />
      <ConfirmDialog
        open={Boolean(deletingPatient)}
        onClose={() => setDeletingPatient(null)}
        onConfirm={async () => {
          if (!deletingPatient) return;
          try {
            await deletePatientMutation.mutateAsync(deletingPatient);
          } finally {
            setDeletingPatient(null);
          }
        }}
        title="Remove patient"
        message={`This deletes "${deletingPatient?.name ?? ""}" from ${doctor.name}'s patient list and from the portal entirely.`}
        confirmLabel="Delete patient"
        loading={deletePatientMutation.isPending}
      />
      <ConfirmDialog
        open={confirmDoctorDelete}
        onClose={() => setConfirmDoctorDelete(false)}
        onConfirm={async () => {
          try {
            await deleteDoctorMutation.mutateAsync(doctor);
            router.push("/doctors");
          } finally {
            setConfirmDoctorDelete(false);
          }
        }}
        title="Delete doctor"
        message={`This permanently removes "${doctor.name}". Doctors with assigned patients cannot be deleted.`}
        confirmLabel="Delete doctor"
        loading={deleteDoctorMutation.isPending}
      />
    </div>
  );
}
