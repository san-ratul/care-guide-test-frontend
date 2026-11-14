import { api } from "../api";
import { buildQueryString } from "../utils";
import type { Doctor, DoctorInput, DoctorListParams, Paginated, Patient, PatientInput, PatientListParams } from "../../types";

export async function fetchDoctors(params: DoctorListParams): Promise<Paginated<Doctor>> {
  const response = await api.get<{ data: Doctor[]; meta: Paginated<Doctor>["meta"] }>(
    `/doctors${buildQueryString({ ...params })}`
  );
  return { data: response.data.data, meta: response.data.meta };
}

export async function fetchDoctorById(id: string): Promise<Doctor> {
  const response = await api.get<{ data: Doctor }>(`/doctors/${id}`);
  return response.data.data;
}

export async function createDoctor(input: DoctorInput): Promise<Doctor> {
  const response = await api.post<{ data: Doctor }>("/doctors", input);
  return response.data.data;
}

export async function updateDoctor(id: string, input: Partial<DoctorInput>): Promise<Doctor> {
  const response = await api.put<{ data: Doctor }>(`/doctors/${id}`, input);
  return response.data.data;
}

export async function deleteDoctor(id: string): Promise<void> {
  await api.delete(`/doctors/${id}`);
}

export async function fetchDoctorPatients(
  id: string,
  params: PatientListParams
): Promise<Paginated<Patient>> {
  const response = await api.get<{ data: Patient[]; meta: Paginated<Patient>["meta"] }>(
    `/doctors/${id}/patients${buildQueryString({ ...params })}`
  );
  return { data: response.data.data, meta: response.data.meta };
}

export async function createPatientUnderDoctor(id: string, input: Omit<PatientInput, "doctorId">): Promise<Patient> {
  const response = await api.post<{ data: Patient }>(`/doctors/${id}/patients`, input);
  return response.data.data;
}
