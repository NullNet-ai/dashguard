"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { useToast } from "~/context/ToastProvider";

import { participantsSchema } from "~/server/zodSchema/bookings/participantsDetails";
import ParticipantsDetails from "../../Custom/ParticipantsDetails";
import { IFormProps } from "../types";
import {
  createParticipantsDetails,
  IData,
} from "../../Action/createUpdateParticipantsDetails";
export default function ParticipantsDetailsForm({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
  const toast = useToast();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof participantsSchema>>) => {
    try {
      await createParticipantsDetails({
        id: params?.id,
        ...data,
      } as IData);
      toast.success("Participants Details submitted successfully");
    } catch (error) {
      toast.error("Failed to submit Participants Details");
    }
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: "w-full",
      }}
      myParent={params.shell_type}
      appendFormKey="participants-details-form-button"
      enableAppendForm={true}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Participants"
      handleSubmit={handleSave}
      formKey="participants-details"
      formSchema={participantsSchema}
      defaultValues={defaultValues}
      fields={[]}
      customRender={(form, options) => (
        <ParticipantsDetails
          form={form}
          selectOptions={selectOptions}
          options={{
            ...options,
            appendFormKey: options?.appendButtonKey || "",
          }}
        />
      )}
    />
  );
}
