"use client";

import { toast } from "sonner";
import { type z } from "zod";
import { FormBuilder } from "~/components/platform/EnhancedFormBuilder";
import { AddressSchema } from "~/components/platform/AddressAutoComplete/autocomplete-validator";

const FormSchema = AddressSchema;

export default function AddressDetails({}) {
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
        return;
      } catch (error) {
        console.error("Form submission error", error);
        toast.error("Failed to submit the form. Please try again.");
        reject(new Error("Form submission error"));
      }
    });
  };
  return (
    <>
      {/* FormBuilder 1: TextField */}
      <FormBuilder
        customDesign={{
          formClassName: "w-full",
          headerClassName: "w-full",
        }}
        enableFormRegisterToParent
        formLabel="Address Form Builder"
        formKey="address-details"
        handleSubmit={handleSave}
        formSchema={FormSchema}
        // defaultValues={{
        //   searchedAddress: "",
        //   details: {
        //     address_line_two: "URBAN DECA HOME BANILAD TOWER 3",
        //     address:
        //       "Irvine, North Ayrshire, Alba / Scotland, KA12 0AX, United Kingdom",
        //     latitude: 55.6143121,
        //     longitude: -4.6655591,
        //     place_id: "253523596",
        //     street_number: "",
        //     street: "",
        //     region_code: "",
        //     country_code: "gb",
        //     address_line_one: "Test",
        //     city: "Smethwick",
        //     state: "Ards",
        //     region: "Alba / Scotland",
        //     country: "United Kingdom",
        //     postal_code: "KA12 0AX",
        //   },
        // }}
        fields={[
          {
            id: "address",
            formType: "address-input",
            name: "address",
            label: "Address",
            required: true,
            placeholder: "Address",
          },
        ]}
      />
    </>
  );
}
