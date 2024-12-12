"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { IFormProps } from "../types";

const FormSchema = z.object({
  interview_notes: z.string({ message: "Candidate is required." }).optional(),
});

export default function BookingInterviewNotes({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast();
  const updateBooking = api.booking.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      const res = await updateBooking.mutateAsync({
        id: params.id,
        ...data,
      });
      if (res?.status_code == 200) {
        toast.success("Interview Notes submit sucessfully.");
        return res;
      }

      return false;
    } catch (error) {
      toast.error("Failed to submit Interview Notes.");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      // enableFormRegisterToParent
      formProps={params}
      formLabel="Interview Notes"
      handleSubmit={handleSave}
      formKey="interview-notes"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      selectOptions={selectOptions}
      fields={[
        {
          id: "interview_notes",
          formType: "textarea",
          name: "interview_notes",
          label: "",
          required: false,
          placeholder: "Interview Notes",
        },
      ]}
    />
  );
}
