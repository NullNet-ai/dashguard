"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";

const FormSchema = z.object({
  resume: z.array(
    z
      .string({ message: "Resume is required" })
      .min(1, { message: "Resume is required" }),
  ),
});

export default function FileDetails({}) {
  const handleSave = async (values: { data: z.infer<typeof FormSchema> }) => {
    return new Promise<void>((resolve, reject) => {
      try {
        toast(
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">
              {JSON.stringify(values.data, null, 2)}
            </code>
          </pre>,
        );
        resolve();
      } catch (error) {
        toast.error("Failed to submit the form. Please try again.");
        reject(new Error("Form submission error"));
      }
    });
  };

  return (
    <>
      {/* FormBuilder 11: File */}
      <FormBuilder
        enableFormRegisterToParent
        formLabel="Resume Upload Form"
        formKey="employee-details"
        formSchema={FormSchema}
        handleSubmit={handleSave}
        customDesign={{
          formClassName: "sm:grid-cols-1",
        }}
        defaultValues={{
          resume: ["01JJ3VEEBDPVTZF2ZS4STZ9QNR", "01JJ3ZZ58E7C735440ZDHFE5HD"],
          file: ["01JJ3VEEBDPVTZF2ZS4STZ9QNR"],
          new_file: ["01JJ3ZZ58E7C735440ZDHFE5HD"],
        }}
        fields={[
          {
            id: "resume",
            formType: "file",
            name: "resume",
            label: "Resume",
            required: true,
            placeholder: "Upload your resume",
            fileDropzoneOptions: {
              multiple: false,
              maxSize: 1024 * 1024 * 10,
              maxFiles: 5,
            },
          },
          {
            id: "new_file",
            formType: "file",
            name: "new_file",
            label: "New File",
            required: true,
            placeholder: "Upload your new file",
            fileDropzoneOptions: {
              multiple: false,
              maxSize: 1024 * 1024 * 10,
              maxFiles: 5,
            },
          },
          {
            id: "file",
            formType: "file",
            name: "file",
            label: "File",
            required: true,
            placeholder: "Upload your resume",
            fileDropzoneOptions: {
              multiple: false,
              maxSize: 1024 * 1024 * 10,
              maxFiles: 5,
            },
          },
        ]}
      />
    </>
  );
}
