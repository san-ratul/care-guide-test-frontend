export type DoctorSpecialization =
  | "Cardiology"
  | "Dermatology"
  | "Endocrinology"
  | "Gastroenterology"
  | "General Medicine"
  | "Neurology"
  | "Orthopedics"
  | "Pediatrics"
  | "Psychiatry"
  | "Pulmonology"
  | "Urology";

export const DOCTOR_SPECIALIZATIONS: DoctorSpecialization[] = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "General Medicine",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Urology",
];

export type PatientCondition =
  | "hypertension"
  | "diabetes"
  | "asthma"
  | "cardiac"
  | "orthopedic"
  | "dermatology"
  | "neurological"
  | "other";

export const PATIENT_CONDITIONS: PatientCondition[] = [
  "hypertension",
  "diabetes",
  "asthma",
  "cardiac",
  "orthopedic",
  "dermatology",
  "neurological",
  "other",
];

export type PatientStatus = "active" | "recovering" | "critical" | "discharged";

export const PATIENT_STATUSES: PatientStatus[] = ["active", "recovering", "critical", "discharged"];

export type Gender = "male" | "female" | "other";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: DoctorSpecialization;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  patientCount?: number;
}

export interface Patient {
  _id: string;
  name: string;
  doctorId: string;
  phone: string;
  email?: string;
  gender: Gender;
  dateOfBirth?: string;
  condition: PatientCondition;
  status: PatientStatus;
  address?: string;
  notes?: string;
  createdAt: string;
  doctor?: {
    _id: string;
    name: string;
    specialization: DoctorSpecialization;
    hospital: string;
    phone: string;
    email: string;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface DoctorListParams {
  page?: number;
  limit?: number;
  search?: string;
  specialization?: string;
  hospital?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: "createdAt" | "name" | "specialization";
  sortOrder?: "asc" | "desc";
}

export interface PatientListParams {
  page?: number;
  limit?: number;
  search?: string;
  doctorId?: string;
  condition?: string;
  status?: string;
  gender?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: "createdAt" | "name" | "condition" | "status";
  sortOrder?: "asc" | "desc";
}

export interface DashboardOverview {
  totalDoctors: number;
  totalPatients: number;
  avgPatientsPerDoctor: number;
  activeDoctors: number;
  newPatientsLast7Days: number;
  newPatientsLast30Days: number;
  criticalPatients: number;
  dischargedPatients: number;
  byCondition: Array<{ _id: string; count: number }>;
  byGender: Array<{ _id: string; count: number }>;
  byStatus: Array<{ _id: string; count: number }>;
  registrationsByDay: Array<{ _id: string; patients: number; doctors: number }>;
}

export interface DashboardAnalytics {
  patientsPerDoctor: Array<{
    doctorId: string;
    doctorName: string;
    specialization: string;
    hospital: string;
    patientCount: number;
  }>;
  doctorsPerDay: Array<{ _id: string; count: number }>;
  patientsPerDay: Array<{ _id: string; count: number }>;
  totalDoctors: number;
  totalPatients: number;
  windowDays: number;
}

export interface DashboardRecent {
  doctors: Array<Pick<Doctor, "_id" | "name" | "specialization" | "hospital" | "createdAt">>;
  patients: Array<Pick<Patient, "_id" | "name" | "condition" | "status" | "createdAt">>;
}

export interface DoctorInput {
  name: string;
  specialization: DoctorSpecialization;
  hospital: string;
  phone: string;
  email: string;
}

export interface PatientInput {
  name: string;
  doctorId: string;
  phone: string;
  email?: string;
  gender: Gender;
  dateOfBirth?: string;
  condition: PatientCondition;
  status: PatientStatus;
  address?: string;
  notes?: string;
}
