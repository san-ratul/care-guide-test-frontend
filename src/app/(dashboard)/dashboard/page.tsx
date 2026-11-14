"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarPlus,
  HeartPulse,
  Stethoscope,
  UserPlus,
  Users,
  ArrowRight,
} from "lucide-react";
import { queries } from "@/lib/queries";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { ConditionBadge, SpecializationBadge, StatusBadge } from "@/components/ui/Badge";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  ConditionsChart,
  PatientsPerDoctorChart,
  RegistrationsChart,
} from "@/components/dashboard/Charts";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const overview = useQuery(queries.dashboardOverview());
  const analytics = useQuery(queries.dashboardAnalytics(30));
  const recent = useQuery(queries.dashboardRecent());

  const data = overview.data;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Live overview of your doctors, patients and growth."
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key statistics">
        <StatCard
          label="Total doctors"
          value={data?.totalDoctors ?? 0}
          hint={`${data?.activeDoctors ?? 0} currently listed`}
          icon={Stethoscope}
          tone="teal"
          loading={overview.isLoading}
        />
        <StatCard
          label="Total patients"
          value={data?.totalPatients ?? 0}
          hint={`${data?.newPatientsLast7Days ?? 0} new in the last 7 days`}
          icon={Users}
          tone="blue"
          loading={overview.isLoading}
        />
        <StatCard
          label="Patients per doctor"
          value={data?.avgPatientsPerDoctor ?? 0}
          hint="Average caseload across all doctors"
          icon={HeartPulse}
          tone="violet"
          loading={overview.isLoading}
        />
        <StatCard
          label="New patients · 30 days"
          value={data?.newPatientsLast30Days ?? 0}
          hint={`${data?.criticalPatients ?? 0} critical under care`}
          icon={UserPlus}
          tone="amber"
          loading={overview.isLoading}
        />
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2" aria-label="Charts">
        <RegistrationsChart data={data?.registrationsByDay} loading={overview.isLoading} />
        <PatientsPerDoctorChart data={analytics.data?.patientsPerDoctor} loading={analytics.isLoading} />
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2" aria-label="Distribution charts">
        <ConditionsChart data={data?.byCondition} loading={overview.isLoading} />

        <Card>
          <CardHeader>
            <CardTitle>Patient status overview</CardTitle>
            <Link href="/patients" className="text-xs font-medium text-teal-600 hover:text-teal-700">
              View all patients
            </Link>
          </CardHeader>
          <CardBody>
            {overview.isLoading ? (
              <div className="space-y-3" aria-hidden>
                {[80, 60, 40, 30].map((w, i) => (
                  <div key={i} className="h-9 animate-pulse rounded-lg bg-slate-100" style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : (data?.byStatus.length ?? 0) === 0 ? (
              <EmptyState
                title="No patients yet"
                description="Create a doctor, then add patients to see status insights."
                className="py-8"
              />
            ) : (
              <ul className="space-y-2.5">
                {(data?.byStatus ?? []).map((status) => {
                  const pct = data?.totalPatients
                    ? Math.round((status.count / data.totalPatients) * 100)
                    : 0;
                  return (
                    <li key={status._id}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-medium capitalize text-slate-700">{status._id}</span>
                        <span className="text-slate-500">
                          {status.count} · {pct}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            status._id === "critical"
                              ? "bg-rose-500"
                              : status._id === "recovering"
                                ? "bg-sky-500"
                                : status._id === "active"
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2" aria-label="Recent records">
        <Card>
          <CardHeader>
            <CardTitle>Recent doctors</CardTitle>
            <Link
              href="/doctors"
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              View all <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </CardHeader>
          {recent.isLoading ? (
            <TableSkeleton rows={4} columns={3} />
          ) : (recent.data?.doctors.length ?? 0) === 0 ? (
            <EmptyState
              title="No doctors yet"
              description="Doctors you add will appear here."
              icon={<Stethoscope className="h-6 w-6" aria-hidden />}
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.data?.doctors.map((doctor) => (
                <li key={doctor._id}>
                  <Link
                    href={`/doctors/${doctor._id}`}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
                  >
                    <Avatar name={doctor.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{doctor.name}</p>
                      <p className="truncate text-xs text-slate-500">{doctor.hospital}</p>
                    </div>
                    <SpecializationBadge value={doctor.specialization} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent patients</CardTitle>
            <Link
              href="/patients"
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              View all <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </CardHeader>
          {recent.isLoading ? (
            <TableSkeleton rows={4} columns={3} />
          ) : (recent.data?.patients.length ?? 0) === 0 ? (
            <EmptyState
              title="No patients yet"
              description="Patients you add will appear here."
              icon={<CalendarPlus className="h-6 w-6" aria-hidden />}
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.data?.patients.map((patient) => (
                <li key={patient._id}>
                  <Link
                    href={`/patients/${patient._id}`}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50"
                  >
                    <Avatar name={patient.name} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{patient.name}</p>
                      <p className="truncate text-xs text-slate-500">{formatDate(patient.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ConditionBadge condition={patient.condition} />
                      <StatusBadge status={patient.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}
