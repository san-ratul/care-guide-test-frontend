"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChartSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { titleCase } from "@/lib/utils";
import type { DashboardAnalytics, DashboardOverview } from "@/types";

const CHART_COLORS = ["#0d9488", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#14b8a6", "#6366f1", "#f97316"];

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  fontSize: "12px",
  boxShadow: "0 8px 20px rgba(15,23,42,0.08)",
};

export function RegistrationsChart({
  data,
  loading,
}: {
  data?: DashboardOverview["registrationsByDay"];
  loading: boolean;
}) {
  const series = (data ?? []).map((d) => ({
    day: d._id.slice(5),
    patients: d.patients,
    doctors: d.doctors,
  }));

  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Registrations — last 30 days</CardTitle>
        <p className="text-xs text-slate-400">New patients &amp; doctors per day</p>
      </CardHeader>
      <CardBody>
        {loading ? (
          <ChartSkeleton />
        ) : series.length === 0 ? (
          <EmptyState title="No registrations yet" description="Data appears once doctors or patients are created." className="py-10" />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="patientsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="doctorsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="patients"
                  name="Patients"
                  stroke="#0d9488"
                  strokeWidth={2}
                  fill="url(#patientsFill)"
                />
                <Area
                  type="monotone"
                  dataKey="doctors"
                  name="Doctors"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#doctorsFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export function PatientsPerDoctorChart({
  data,
  loading,
}: {
  data?: DashboardAnalytics["patientsPerDoctor"];
  loading: boolean;
}) {
  const series = (data ?? []).map((d) => ({
    name: d.doctorName.replace(/^Dr\.\s*/, "").split(" ")[0],
    fullName: d.doctorName,
    patients: d.patientCount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patients per doctor</CardTitle>
        <p className="text-xs text-slate-400">Top 8 by load</p>
      </CardHeader>
      <CardBody>
        {loading ? (
          <ChartSkeleton />
        ) : series.length === 0 ? (
          <EmptyState title="No assignments yet" description="Patient counts appear once patients are added." className="py-10" />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${value ?? 0}`, "Patients"]}
                  labelFormatter={(label) => {
                    const match = series.find((s) => s.name === String(label));
                    return match?.fullName ?? String(label);
                  }}
                  cursor={{ fill: "rgba(13,148,136,0.06)" }}
                />
                <Bar dataKey="patients" radius={[6, 6, 0, 0]}>
                  {series.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export function ConditionsChart({
  data,
  loading,
}: {
  data?: DashboardOverview["byCondition"];
  loading: boolean;
}) {
  const series = (data ?? []).map((d) => ({ name: titleCase(d._id), value: d.count }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patients by condition</CardTitle>
        <p className="text-xs text-slate-400">Distribution</p>
      </CardHeader>
      <CardBody>
        {loading ? (
          <ChartSkeleton />
        ) : series.length === 0 ? (
          <EmptyState title="No patient data" description="Conditions appear once patients are created." className="py-10" />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} layout="vertical" margin={{ top: 4, right: 16, left: 24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(13,148,136,0.06)" }} />
                <Bar dataKey="value" name="Patients" radius={[0, 6, 6, 0]} fill="#0d9488" barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
