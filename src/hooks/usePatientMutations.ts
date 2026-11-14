"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createPatient, deletePatient, updatePatient } from "@/lib/services/patients.service";
import { createPatientUnderDoctor } from "@/lib/services/doctors.service";
import { getApiErrorMessage } from "@/lib/api";
import type { Patient, PatientInput } from "@/types";

function invalidatePatientQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["patients"] });
  queryClient.invalidateQueries({ queryKey: ["doctor-patients"] });
  queryClient.invalidateQueries({ queryKey: ["patient"] });
  queryClient.invalidateQueries({ queryKey: ["doctor"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PatientInput) => createPatient(input),
    onSuccess: (patient) => {
      invalidatePatientQueries(queryClient);
      toast.success(`Patient "${patient.name}" created`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to create patient")),
  });
}

export function useCreatePatientUnderDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ doctorId, input }: { doctorId: string; input: Omit<PatientInput, "doctorId"> }) =>
      createPatientUnderDoctor(doctorId, input),
    onSuccess: (patient) => {
      invalidatePatientQueries(queryClient);
      toast.success(`Patient "${patient.name}" added`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to add patient")),
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PatientInput> }) => updatePatient(id, input),
    onSuccess: (patient) => {
      invalidatePatientQueries(queryClient);
      toast.success(`Patient "${patient.name}" updated`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to update patient")),
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patient: Patient) => deletePatient(patient._id),
    onSuccess: (_data, patient) => {
      invalidatePatientQueries(queryClient);
      toast.success(`Patient "${patient.name}" deleted`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to delete patient")),
  });
}
