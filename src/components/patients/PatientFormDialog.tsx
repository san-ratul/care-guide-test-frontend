"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { queries } from "@/lib/queries";
import { PATIENT_CONDITIONS, PATIENT_STATUSES, type Patient, type PatientInput } from "@/types";
import { useCreatePatient, useCreatePatientUnderDoctor, useUpdatePatient } from "@/hooks/usePatientMutations";

const patientSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  doctorId: z.string().min(24, "Select a doctor"),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d][\d\s\-()]{5,19}$/, "Enter a valid phone number"),
  email: z
    .string()
    .trim()
    .regex(/^\S+@\S+\.\S+$/, "Enter a valid email address")
    .optional()
    .or(z.literal("")),
  gender: z.enum(["male", "female", "other"], {
    error: "Select a gender",
  }),
  dateOfBirth: z
    .string()
    .regex(/^(\d{4}-\d{2}-\d{2})?$/, "Use the date picker to choose a valid date")
    .optional()
    .or(z.literal("")),
  condition: z.enum(PATIENT_CONDITIONS as [string, ...string[]], {
    error: "Select a condition",
  }),
  status: z.enum(PATIENT_STATUSES as [string, ...string[]], {
    error: "Select a status",
  }),
  address: z.string().trim().max(240).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

type PatientForm = z.infer<typeof patientSchema>;

interface PatientFormDialogProps {
  open: boolean;
  onClose: () => void;
  patient?: Patient | null;
  /** When set, the doctor is fixed (e.g. adding a patient from a doctor's page). */
  lockedDoctorId?: string;
}

export function PatientFormDialog({ open, onClose, patient, lockedDoctorId }: PatientFormDialogProps) {
  const isEdit = Boolean(patient);
  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();
  const createUnderDoctorMutation = useCreatePatientUnderDoctor();

  const doctorsQuery = useQuery({
    ...queries.doctors({ page: 1, limit: 100, sortBy: "name", sortOrder: "asc" }),
    enabled: open && !lockedDoctorId,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      doctorId: lockedDoctorId ?? "",
      phone: "",
      email: "",
      gender: "male",
      dateOfBirth: "",
      condition: "other",
      status: "active",
      address: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: patient?.name ?? "",
        doctorId: lockedDoctorId ?? patient?.doctorId ?? "",
        phone: patient?.phone ?? "",
        email: patient?.email ?? "",
        gender: patient?.gender ?? "male",
        dateOfBirth: patient?.dateOfBirth ? patient.dateOfBirth.slice(0, 10) : "",
        condition: patient?.condition ?? "other",
        status: patient?.status ?? "active",
        address: patient?.address ?? "",
        notes: patient?.notes ?? "",
      });
    }
  }, [open, patient, lockedDoctorId, reset]);

  const doctorOptions = useMemo(
    () => doctorsQuery.data?.data ?? [],
    [doctorsQuery.data]
  );

  const onSubmit = async (values: PatientForm) => {
    try {
      if (isEdit && patient) {
        await updateMutation.mutateAsync({
          id: patient._id,
          input: {
            name: values.name,
            phone: values.phone,
            email: values.email || undefined,
            gender: values.gender as PatientInput["gender"],
            dateOfBirth: values.dateOfBirth || undefined,
            condition: values.condition as PatientInput["condition"],
            status: values.status as PatientInput["status"],
            address: values.address || undefined,
            notes: values.notes || undefined,
            ...(values.doctorId !== patient.doctorId ? { doctorId: values.doctorId } : {}),
          },
        });
      } else if (lockedDoctorId) {
        await createUnderDoctorMutation.mutateAsync({
          doctorId: lockedDoctorId,
          input: {
            name: values.name,
            phone: values.phone,
            email: values.email || undefined,
            gender: values.gender as PatientInput["gender"],
            dateOfBirth: values.dateOfBirth || undefined,
            condition: values.condition as PatientInput["condition"],
            status: values.status as PatientInput["status"],
            address: values.address || undefined,
            notes: values.notes || undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          doctorId: values.doctorId,
          phone: values.phone,
          email: values.email || undefined,
          gender: values.gender as PatientInput["gender"],
          dateOfBirth: values.dateOfBirth || undefined,
          condition: values.condition as PatientInput["condition"],
          status: values.status as PatientInput["status"],
          address: values.address || undefined,
          notes: values.notes || undefined,
        });
      }
      onClose();
    } catch {
      // Toast surfaced by mutation; dialog stays open.
    }
  };

  const loading =
    createMutation.isPending || updateMutation.isPending || createUnderDoctorMutation.isPending;

  return (
    <Dialog
      open={open}
      onClose={loading ? () => undefined : onClose}
      title={isEdit ? "Edit patient" : "Add patient"}
      description={
        isEdit
          ? "Update the patient's record or reassign their doctor."
          : "Every patient must be assigned to exactly one doctor."
      }
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" placeholder="Rahim Uddin" error={errors.name?.message} {...register("name")} />
          {lockedDoctorId && !isEdit ? (
            <Input label="Doctor" value="Current doctor (this page)" disabled />
          ) : (
            <Select label="Doctor" error={errors.doctorId?.message} {...register("doctorId")}>
              <option value="">{doctorsQuery.isLoading ? "Loading doctors…" : "Select a doctor"}</option>
              {doctorOptions.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} — {doctor.specialization}
                </option>
              ))}
            </Select>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Phone" type="tel" placeholder="+880 1811 555 002" error={errors.phone?.message} {...register("phone")} />
          <Input label="Email (optional)" type="email" placeholder="patient@example.com" error={errors.email?.message} {...register("email")} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select label="Gender" error={errors.gender?.message} {...register("gender")}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
          <Input label="Date of birth" type="date" error={errors.dateOfBirth?.message} {...register("dateOfBirth")} />
          <Select label="Condition" error={errors.condition?.message} {...register("condition")}>
            {PATIENT_CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>
                {condition.charAt(0).toUpperCase() + condition.slice(1)}
              </option>
            ))}
          </Select>
          <Select label="Status" error={errors.status?.message} {...register("status")}>
            {PATIENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </Select>
        </div>

        <Input label="Address (optional)" placeholder="12/B Dhanmondi, Dhaka" error={errors.address?.message} {...register("address")} />
        <Textarea label="Clinical notes (optional)" placeholder="Short follow-up note…" error={errors.notes?.message} {...register("notes")} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {isEdit ? "Save changes" : "Add patient"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
