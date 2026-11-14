"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createDoctor, deleteDoctor, updateDoctor } from "@/lib/services/doctors.service";
import { getApiErrorMessage } from "@/lib/api";
import type { Doctor, DoctorInput } from "@/types";

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DoctorInput) => createDoctor(input),
    onSuccess: (doctor) => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Doctor "${doctor.name}" created`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to create doctor")),
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<DoctorInput> }) => updateDoctor(id, input),
    onSuccess: (doctor) => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor", doctor._id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Doctor "${doctor.name}" updated`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to update doctor")),
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (doctor: Doctor) => deleteDoctor(doctor._id),
    onSuccess: (_data, doctor) => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(`Doctor "${doctor.name}" deleted`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Failed to delete doctor")),
  });
}
