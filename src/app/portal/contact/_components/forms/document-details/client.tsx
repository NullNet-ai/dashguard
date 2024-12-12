"use client";

import { type z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { api } from "~/trpc/react";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { useToast } from "~/context/ToastProvider";
import { DocumentDetailsSchema } from "~/server/zodSchema/contacts/documentDetails";
import { IFormProps } from "../types";
import DocumentDisplayDetails from "./custom/DocumentDisplayDetails";

export default function DocumentDetails({
  params,
  defaultValues,
  contact_files,
}: IFormProps) {
  const toast = useToast();

  const updateFiles = api.contactFile.saveFiles.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof DocumentDetailsSchema>>) => {
    try {
      const contact_id = params.id!;

      const response = await updateFiles.mutateAsync({
        contact_id,
        ...data,
      });
      if (response) {
        toast.success("Document Details submit sucessfully");
        return response;
      }
      toast.error("Failed to submit Document Details.");
    } catch (error) {
      toast.error("Failed to submit Document Details.");
    }
  };

  return (
    <>
      <FormBuilder
        customDesign={{
          formClassName: "!grid-cols-1",
        }}
        myParent={params.shell_type}
        formProps={params}
        formLabel="Documents"
        handleSubmit={handleSave}
        formKey="ContactsEight"
        formSchema={DocumentDetailsSchema}
        defaultValues={defaultValues}
        fields={[
          {
            id: "file_ids",
            formType: "file",
            name: "file_ids",
            required: false,
            // fileDropzoneOptions: {
            //   accept: {
            //     "application/pdf": [".pdf"], //to only allow pdf files
            //   },
            //   multiple: true, //to allow multiple files
            // },
          },
        ]}
      />
      <DocumentDisplayDetails files={contact_files!} />
    </>
  );
}
