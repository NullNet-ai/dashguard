"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { IFormProps } from "../types";

const FormSchema = z.object({
  candidate_id: z
    .string({ message: "Candidate is required." }) //nullable
    .min(1, { message: "Candidate is required." }),
});

export default function BookingCandidate({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast();
  const updateBooking = api.booking.updateBookingCandidateRecord.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updateBooking.mutateAsync({
        id: params.id,
        ...data,
      });
      if (res?.status_code == 200) {
        toast.success("Candidate Details submit sucessfully.");
        return res;
      }
      return false;
    } catch (error) {
      toast.error("Failed to submit Candidate Details");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Candidate"
      handleSubmit={handleSave}
      formKey="booking-candidate"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      selectOptions={selectOptions}
      fields={[
        {
          id: "candidate_id",
          formType: "select",
          name: "candidate_id",
          label: "Candidate",
          required: true,
          placeholder: "Candidate",
        },
      ]}
    />
  );
}
