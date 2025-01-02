"use client";

import { z } from "zod";
import { FormBuilder }  from "~/components/platform/FormBuilder";

const FormSchema = z.object({
  slider: z
    .string({ message: "Slider is required" })
    .min(1, { message: "Slider is required" }),
});

export default function SliderDetails({}) {
  return (
    <>
      {/* FormBuilder 17: Slider */}
      <FormBuilder
        enableFormRegisterToParent
        formLabel="Slider Form Builder"
        formKey="FormBuilderSlider"
        formSchema={FormSchema}
        fields={[
          {
            id: "slider",
            formType: "slider",
            name: "slider",
            label: "Slider",
            required: true,
            placeholder: "Slider",
          },
        ]}
      />
    </>
  );
}
