import { api } from "../api";
import { buildQueryString } from "../utils";
import type { Paginated, Patient, PatientInput, PatientListParams } from "../../types";

export async function fetchPatients(params: PatientListParams): Promise<Paginated<Patient>> {
  const response = await api.get<{ data: Patient[]; meta: Paginated<Patient>["meta"] }>(
    `/patients${buildQueryString({ ...params })}`
  );
  return { data: response.data.data, meta: response.data.meta };
}

export async function fetchPatientById(id: string): Promise<Patient> {
  const response = await api.get<{ data: Patient }>(`/patients/${id}`);
  return response.data.data;
}

export async function createPatient(input: PatientInput): Promise<Patient> {
  const response = await api.post<{ data: Patient }>("/patients", input);
  return response.data.data;
}

export async function updatePatient(id: string, input: Partial<PatientInput>): Promise<Patient> {
  const response = await api.put<{ data: Patient }>(`/patients/${id}`, input);
  return response.data.data;
}

export async function deletePatient(id: string): Promise<void> {
  await api.delete(`/patients/${id}`);
}
