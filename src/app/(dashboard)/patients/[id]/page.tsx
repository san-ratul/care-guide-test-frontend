"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Stethoscope,
  Trash2,
  User,
} from "lucide-react";
import { queries } from "@/lib/queries";
import { useDeletePatient } from "@/hooks/usePatientMutations";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { ConditionBadge, SpecializationBadge, StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PatientFormDialog } from "@/components/patients/PatientFormDialog";
import { formatDate } from "@/lib/utils";

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const patientId = params.id;
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteMutation = useDeletePatient();

  const patientQuery = useQuery(queries.patient(patientId));

  if (patientQuery.isLoading) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading patient">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-56 animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (patientQuery.isError || !patientQuery.data) {
    return (
      <EmptyState
        icon={<User className="h-6 w-6" aria-hidden />}
        title="Patient not found"
        description="The patient may have been deleted, or the link is incorrect."
        action={
          <Button variant="outline" onClick={() => router.push("/patients")}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to patients
          </Button>
        }
      />
    );
  }

  const patient = patientQuery.data;

  return (
    <div>
      <PageHeader
        title={patient.name}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Patients", href: "/patients" },
          { label: patient.name },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" aria-hidden />
              Edit patient
            </Button>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" aria-hidden />
              Delete
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient record</CardTitle>
            <div className="flex gap-2">
              <ConditionBadge condition={patient.condition} />
              <StatusBadge status={patient.status} />
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-4">
              <Avatar name={patient.name} className="h-14 w-14 text-lg" />
              <div>
                <p className="text-base font-semibold text-slate-900">{patient.name}</p>
                <p className="text-sm capitalize text-slate-500">
                  {patient.gender}
                  {patient.dateOfBirth ? ` · born ${formatDate(patient.dateOfBirth)}` : ""}
                </p>
              </div>
            </div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" aria-hidden />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" aria-hidden />
                <span>{patient.email ?? "No email recorded"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" aria-hidden />
                <span>{patient.address ?? "No address recorded"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600">
                <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden />
                <span>Added {formatDate(patient.createdAt)}</span>
              </div>
            </dl>
            {patient.notes ? (
              <div className="mt-5 rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Clinical notes</p>
                <p className="mt-1 text-sm text-slate-700">{patient.notes}</p>
              </div>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned doctor</CardTitle>
            {patient.doctor ? (
              <SpecializationBadge value={patient.doctor.specialization} />
            ) : null}
          </CardHeader>
          <CardBody>
            {patient.doctor ? (
              <>
                <Link
                  href={`/doctors/${patient.doctorId}`}
                  className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-slate-50"
                >
                  <Avatar name={patient.doctor.name} className="h-12 w-12" />
                  <div>
                    <p className="font-semibold text-slate-900 hover:text-teal-700">
                      {patient.doctor.name}
                    </p>
                    <p className="text-xs text-slate-500">{patient.doctor.hospital}</p>
                  </div>
                </Link>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Building2 className="h-4 w-4 text-slate-400" aria-hidden />
                    <span>{patient.doctor.hospital}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" aria-hidden />
                    <span>{patient.doctor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" aria-hidden />
                    <span className="break-all">{patient.doctor.email}</span>
                  </div>
                </dl>
                <div className="mt-5">
                  <Button variant="outline" onClick={() => router.push(`/doctors/${patient.doctorId}`)}>
                    <Stethoscope className="h-4 w-4" aria-hidden />
                    View doctor profile
                  </Button>
                </div>
              </>
            ) : (
              <EmptyState title="Doctor information unavailable" />
            )}
          </CardBody>
        </Card>
      </div>

      <PatientFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        patient={patient}
      />
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          try {
            await deleteMutation.mutateAsync(patient);
            router.push("/patients");
          } finally {
            setConfirmDelete(false);
          }
        }}
        title="Delete patient"
        message={`This permanently removes "${patient.name}" and their record from ${patient.doctor?.name ?? "their doctor"}'s patient list.`}
        confirmLabel="Delete patient"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
