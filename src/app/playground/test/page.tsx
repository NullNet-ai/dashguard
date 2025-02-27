"use client";

import { UserIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";

const FormSchema = z.object({
    combobox: z.string({ message: "Select with Options is required" }),
    disabledField: z.string().optional(),
    readonlyField: z.string().optional(),
});

function handleSubmit(values: {
    data: z.infer<typeof FormSchema>;
}): Promise<void> {
    return new Promise((resolve, reject) => {
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
            console.error("Form submission error", error);
            toast.error("Failed to submit the form. Please try again.");
            reject(new Error("Form submission error"));
        }
    });
}

const sampleSelectOptionsAlphabetical = [
    { label: "Date", value: "date" },
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Elderberry", value: "elderberry" },
    { label: "Cherry", value: "cherry" },
    { label: "Fig", value: "fig" },
    { label: "Grape", value: "grape" },
];

export default function SelectDetails({ }) {
    return (
        <>
            <FormBuilder
                handleSubmit={handleSubmit}
                enableFormRegisterToParent
                formLabel="Select Form Builder"
                formKey="FormBuilderSelect"
                formSchema={FormSchema}
                // defaultValues={{
                //     combobox: "apple",
                //     disabledField: "This field is disabled",
                //     readonlyField: "This field is readonly",
                // }}
                fields={[
                    {
                        id: "combobox",
                        formType: "combobox",
                        name: "combobox",
                        label: "Select with Options",
                        required: true,
                        comboboxConfig: {
                            selectOptions: sampleSelectOptionsAlphabetical,
                            inputPlaceholder: "Type to search",
                            selectPlaceholder: "Select",
                        },
                    },
                    {
                        id: "disabledField",
                        formType: "combobox",
                        name: "disabledField",
                        label: "Disabled Field",
                        disabled: true,
                        comboboxConfig: {
                            selectOptions: sampleSelectOptionsAlphabetical,
                            inputPlaceholder: "Type to search",
                            selectPlaceholder: "disabled",

                        },
                    },
                    {
                        id: "readonlyField",
                        formType: "combobox",
                        name: "readonlyField",
                        label: "Readonly Field",
                        readonly: true,
                        comboboxConfig: {
                            selectOptions: sampleSelectOptionsAlphabetical,
                            inputPlaceholder: "Type to search",
                            selectPlaceholder: "Select",
                        },
                    },
                ]}
            />
        </>
    );
}
