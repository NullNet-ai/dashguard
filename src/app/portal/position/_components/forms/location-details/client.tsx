"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { useToast } from "~/context/ToastProvider";
import { IFormProps } from "../types";
import { createPositionWorkSetupDetails } from "../Action/createUpdatePositionLocationDetails";
import CustomLocationDetails from "../Custom/CustomLocationDetails";

const LocationDetailsSchema = z.object({
  work_setup: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .min(1, { message: "At least one work setup must be selected." }),
  locations: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .min(1, { message: "At least one location must be selected." }),
  exceptions: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional(),
});

export default function LocationDetails({
  params,
  defaultValues,
  multiSelectOptions,
}: IFormProps) {
  const toast = useToast();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof LocationDetailsSchema>>) => {
    try {
      await createPositionWorkSetupDetails({ id: params?.id, ...data });
      toast.success("Location Details submit successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit Location Details");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Location Details"
      handleSubmit={handleSave}
      formKey="PositionsStepFourTest"
      formSchema={LocationDetailsSchema}
      defaultValues={defaultValues}
      multiSelectOptions={{}}
      fields={
        [
          // {
          //   id: "locations",
          //   formType: "select",
          //   name: "locations",
          //   label: "Location",
          //   required: true,
          // },
          // {
          //   id: "exceptions",
          //   formType: "textarea",
          //   name: "exceptions",
          //   label: "Exceptions",
          //   required: false,
          // },
        ]
      }
      customRender={(form) => (
        <CustomLocationDetails
          form={form}
          multiSelectOptions={multiSelectOptions}
        />
      )}
    />
  );
}
