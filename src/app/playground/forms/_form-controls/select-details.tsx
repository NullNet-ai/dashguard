"use client";

import { UserIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { useState } from "react";
import { ISelectOptions } from '~/components/platform/FormBuilder/types/global/interfaces';

const FormSchema = z.object({
    select_with_options: z.string({ message: "Select with Options is required" }),
    select_single: z.string({ message: "Select Single is required" }),
    select_creatable: z.string({ message: "Select Creatable is required" }),
    multi_select_creatable: z.array(
        z.object({
            label: z.string(),
            value: z.string(),
        })
    ).min(1, { message: "Multi Select Creatable is required" }),
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

const sampleSelectOptions = [
    { label: "Date", value: "date" },
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Elderberry", value: "elderberry" },
    { label: "Cherry", value: "cherry" },
];

const sampleSelectOptionsAlphabetical = [
    { label: "Date", value: "date" },
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Elderberry", value: "elderberry" },
    { label: "Cherry", value: "cherry" },
];

const initialCreatableOptions = [
    { label: "Option 1", value: "option_1" },
    { label: "Option 2", value: "option_2" },
    { label: "Option 3", value: "option_3" },
];

export default function SelectDetails({ }) {
    const [creatableOptions, setCreatableOptions] = useState(initialCreatableOptions);

    return (
        <>
            {/* FormBuilder 3: Select */}
            <FormBuilder
                handleSubmit={handleSubmit}
                enableFormRegisterToParent
                formLabel="Select Form Builder"
                formKey="FormBuilderSelect"
                formSchema={FormSchema}
                selectOptions={{
                    select_with_options: sampleSelectOptionsAlphabetical,
                    select_single: sampleSelectOptions,
                    select_creatable: creatableOptions,
                    multi_select_creatable: creatableOptions,
                }}
                multiSelectOptions={{
                    multi_select_creatable: creatableOptions,
                }}
                fields={[
                    // {
                    //     id: "select_with_options",
                    //     formType: "select",
                    //     name: "select_with_options",
                    //     label: "Select with Options",
                    //     required: true,
                    //     selectSearchable: true,
                    //     selectIcon: UserIcon,
                    //     // readonly:true,
                    // },
                    // {
                    //     id: "select_single",
                    //     formType: "select",
                    //     name: "select_single",
                    //     label: "Select Single",
                    //     required: true,
                    //     selectIcon: UserIcon,
                    //     selectSearchable: true,
                    //     // disabled:true
                    // },
                    {
                        id: "select_creatable",
                        formType: "select",
                        name: "select_creatable",
                        label: "Select Creatable",
                        placeholder: "Select or create...",
                        required: true,
                        selectSearchable: true,
                        selectEnableCreate: true,
                        selectOnCreateRecord: async (query: string): Promise<ISelectOptions> => {
                            // Check if option already exists to prevent duplicates
                            const exists = creatableOptions.some(
                                option => option.value === query || option.label === query
                            );

                            if (!exists) {
                                const newOption = { label: query, value: query };
                                setCreatableOptions(prev => [...prev, newOption]);
                                return Promise.resolve(newOption);
                            }

                            // Return existing option if it already exists
                            const existingOption = creatableOptions.find(
                                option => option.value === query || option.label === query
                            );
                            return Promise.resolve(existingOption || { label: query, value: query });
                        }
                    },
                    // {
                    //     id: "multi_select_creatable",
                    //     formType: "multi-select",
                    //     name: "multi_select_creatable",
                    //     label: "Multiple Select Creatable",
                    //     placeholder: "Select multiple or create...",
                    //     required: true,
                    //     selectSearchable: true,
                    //     selectEnableCreate: true,
                    //     selectOnCreateRecord: async (query: string) => {
                    //         creatableOptions.push({ label: query, value: query });
                    //         return Promise.resolve({
                    //             label: query,
                    //             value: query,
                    //         });
                    //     }
                    // },
                ]}
            />
        </>
    );
}
