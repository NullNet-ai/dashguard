"use client";;
import { use } from "react";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { useToast } from "~/context/ToastProvider";
import { api } from "~/trpc/react";

const FormSchema = z.object({
        field_1750225652621: z.string()
    })

export default function Page(props: any) {
  const params = use(props.params) as { shell_type?: "wizard" | "record" };

  const {
    defaultValues
  } = props;

  const toast = useToast();
  const update = api.record.updateDynamicRecord.useMutation();

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
    try {
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      toast.error("Failed to submit Form Label");
    }
  };

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-1 gap-4',
      }}
      myParent={params.shell_type}
      formProps={params}
      formLabel="Form Label"
      handleSubmit={handleSave}
      formKey="formlabel"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[
  {
    "id": "field_1750225652621",
    "formType": "draggable",
    "name": "field_1750225652621",
    "label": "New Field 1",
    "description": "Field Description",
    "placeholder": "",
    "fieldClassName": "",
    "draggableConfig": [
      {
        "fields": {
          "id": "field1",
          "name": "testsdf",
          "label": "Field 1",
          "placeholder": "Enter value",
          "required": false,
          "formType": "code-editor",
          "codeEditorProps": {
            "enable_editor_tools": true,
            "defaultTheme": "vs-light",
            "maxHeight": "50vh",
            "enable_auto_height": true,
            "minHeight": "60px"
          }
        }
      }
    ],
    "readonly": false,
    "required": false,
    "fieldStyle": {
      "gridColumn": "1 / span 2",
      "gridRow": "1 / span 1"
    }
  }
]}
      checkboxOptions={{}}
      radioOptions={{}}
      selectOptions={{}}
      multiSelectOptions={{}}
    />
  );
}