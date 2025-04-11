"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";

const FormSchema = z.object({
  "code-editor": z
    .string({ message: "Code Editor is required" })
		.min(1, { message: "Code Editor is required" }),
});

export default function CodeEditorForm() {
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
        console.error("Profile update error", error);
        toast.error("Failed to update profile. Please try again.");
        reject(new Error("Profile update error"));
      }
    });
  };

	return (
		<FormBuilder
			enableFormRegisterToParent
			formLabel="Code Editor"
			formKey="code-editor"
			handleSubmit={handleSave}
			formSchema={FormSchema}
			defaultValues={{
				"code-editor": "console.log('Hello, World!');"
			}}
			fields={[
				{
					id: "code-editor",
					formType: "code-editor",
					name: "code-editor",
					label: "Code Editor",
					required: true,
					codeEditorProps: {
						enable_editor_tools: true,
						enable_auto_height : true,
						defaultTheme: 'vs-light',
						minHeight: '25vh',
						maxHeight: '50vh',
					}
				},
			]}
		/>
	);
}