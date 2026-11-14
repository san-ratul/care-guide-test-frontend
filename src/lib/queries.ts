import { queryOptions } from "@tanstack/react-query";
import { fetchDashboardAnalytics, fetchDashboardOverview, fetchDashboardRecent } from "./services/dashboard.service";
import { fetchDoctorById, fetchDoctorPatients, fetchDoctors } from "./services/doctors.service";
import { fetchPatientById, fetchPatients } from "./services/patients.service";
import type { DoctorListParams, PatientListParams } from "../types";

export const queryKeys = {
  doctors: (params: DoctorListParams) => ["doctors", params] as const,
  doctor: (id: string) => ["doctor", id] as const,
  doctorPatients: (id: string, params: PatientListParams) => ["doctor-patients", id, params] as const,
  patients: (params: PatientListParams) => ["patients", params] as const,
  patient: (id: string) => ["patient", id] as const,
  dashboardOverview: () => ["dashboard", "overview"] as const,
  dashboardAnalytics: (days: number) => ["dashboard", "analytics", days] as const,
  dashboardRecent: () => ["dashboard", "recent"] as const,
};

export const queries = {
  doctors: (params: DoctorListParams) =>
    queryOptions({ queryKey: queryKeys.doctors(params), queryFn: () => fetchDoctors(params) }),
  doctor: (id: string) =>
    queryOptions({ queryKey: queryKeys.doctor(id), queryFn: () => fetchDoctorById(id), enabled: Boolean(id) }),
  doctorPatients: (id: string, params: PatientListParams) =>
    queryOptions({
      queryKey: queryKeys.doctorPatients(id, params),
      queryFn: () => fetchDoctorPatients(id, params),
      enabled: Boolean(id),
    }),
  patients: (params: PatientListParams) =>
    queryOptions({ queryKey: queryKeys.patients(params), queryFn: () => fetchPatients(params) }),
  patient: (id: string) =>
    queryOptions({ queryKey: queryKeys.patient(id), queryFn: () => fetchPatientById(id), enabled: Boolean(id) }),
  dashboardOverview: () =>
    queryOptions({ queryKey: queryKeys.dashboardOverview(), queryFn: fetchDashboardOverview }),
  dashboardAnalytics: (days: number) =>
    queryOptions({ queryKey: queryKeys.dashboardAnalytics(days), queryFn: () => fetchDashboardAnalytics(days) }),
  dashboardRecent: () =>
    queryOptions({ queryKey: queryKeys.dashboardRecent(), queryFn: fetchDashboardRecent }),
};
