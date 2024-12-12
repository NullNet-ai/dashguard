"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { api } from "~/trpc/react";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "../types";
import CustomCertificationDetails from "./custom/CertificationDetails";
import { CertificationDetailsSchema } from "../../../../../../server/zodSchema/contacts/certificationDetails";

export default function CertificationDetails({
  params,
  defaultValues,
}: IFormProps) {
  const toast = useToast();
  const updateCertDetails = api.contactCertificate.update.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof CertificationDetailsSchema>>) => {
    try {
      return await updateCertDetails.mutateAsync({
        contact_id: params.id,
        certifications: data.certifications,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit Certification Details");
    }
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: "w-full",
      }}
      myParent={params.shell_type}
      enableAppendForm={true}
      appendFormKey="cert-form-button"
      formProps={params}
      formLabel="Certification Details"
      handleSubmit={handleSave}
      formKey="contact-certification-details"
      formSchema={CertificationDetailsSchema}
      defaultValues={defaultValues}
      fields={[]}
      customRender={(form, options) => (
        <CustomCertificationDetails
          form={form}
          options={{
            ...options,
            appendFormKey: options?.appendButtonKey || "",
          }}
        />
      )}
    />
  );
}
