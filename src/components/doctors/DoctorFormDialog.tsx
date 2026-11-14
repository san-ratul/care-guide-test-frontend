"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DOCTOR_SPECIALIZATIONS, type Doctor, type DoctorInput } from "@/types";
import { useCreateDoctor, useUpdateDoctor } from "@/hooks/useDoctorMutations";

const doctorSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  specialization: z.enum(DOCTOR_SPECIALIZATIONS as [string, ...string[]], {
    error: "Select a specialization",
  }),
  hospital: z.string().trim().min(2, "Hospital is required").max(160),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d][\d\s\-()]{5,19}$/, "Enter a valid phone number"),
  email: z
    .string()
    .trim()
    .regex(/^\S+@\S+\.\S+$/, "Enter a valid email address"),
});

type DoctorForm = z.infer<typeof doctorSchema>;

interface DoctorFormDialogProps {
  open: boolean;
  onClose: () => void;
  doctor?: Doctor | null;
}

export function DoctorFormDialog({ open, onClose, doctor }: DoctorFormDialogProps) {
  const isEdit = Boolean(doctor);
  const createMutation = useCreateDoctor();
  const updateMutation = useUpdateDoctor();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DoctorForm>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: "",
      specialization: "General Medicine",
      hospital: "",
      phone: "",
      email: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: doctor?.name ?? "",
        specialization: doctor?.specialization ?? "General Medicine",
        hospital: doctor?.hospital ?? "",
        phone: doctor?.phone ?? "",
        email: doctor?.email ?? "",
      });
    }
  }, [open, doctor, reset]);

  const onSubmit = async (values: DoctorForm) => {
    const payload: DoctorInput = {
      ...values,
      specialization: values.specialization as DoctorInput["specialization"],
    };
    try {
      if (isEdit && doctor) {
        await updateMutation.mutateAsync({ id: doctor._id, input: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch {
      // Toast already surfaced by the mutation; dialog stays open for correction.
    }
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onClose={loading ? () => undefined : onClose}
      title={isEdit ? "Edit doctor" : "Create doctor"}
      description={
        isEdit
          ? "Update the doctor's professional information."
          : "Add a new doctor with the required profile information."
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Full name"
          placeholder="Dr. Jane Smith"
          error={errors.name?.message}
          {...register("name")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Specialization" error={errors.specialization?.message} {...register("specialization")}>
            {DOCTOR_SPECIALIZATIONS.map((specialization) => (
              <option key={specialization} value={specialization}>
                {specialization}
              </option>
            ))}
          </Select>
          <Input
            label="Hospital"
            placeholder="Square Care Hospital"
            error={errors.hospital?.message}
            {...register("hospital")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Phone"
            type="tel"
            placeholder="+880 1711 200 101"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Email"
            type="email"
            placeholder="doctor@careguide.dev"
            error={errors.email?.message}
            {...register("email")}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {isEdit ? "Save changes" : "Create doctor"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
