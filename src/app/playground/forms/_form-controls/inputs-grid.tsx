"use client";

import { z } from "zod";
import gridColumns from "~/app/portal/contact/grid/_config/columns";
import { FormBuilder } from "~/components/platform/FormBuilder";
const FormSchema = z.object({
  first_name: z
    .string({ message: "Inputs is required" })
    .min(1, { message: "Inputs is required" }),
});

export default function InputsGrid({}) {
  return (
    <>
      {/* FormBuilder 12: Inputs */}
      <FormBuilder
        filterGridConfig={{
          statusesIncluded: ["Draft", "Active"],
          actionType: "single-select",
          pluck: ["id", "code", "first_name"],
          filter_entity: "contact",
          main_entity_id: "",
          gridColumns: gridColumns,
          current: 1,
          limit: 1000,
          label: "Contacts",
        }}
        enableFormRegisterToParent
        formLabel="Inputs Form Builder"
        formKey="FormBuilderInputs"
        formSchema={FormSchema}
        fields={[
          {
            id: "first_name",
            formType: "input-grid",
            name: "first_name",
            label: "First Name",
            required: true,
            placeholder: "First Name",
          },
        ]}
      />
    </>
  );
}
