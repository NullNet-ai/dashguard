"use client";

import { UserIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
const FormSchema = z.object({
    select_with_options: z.string({ message: "Select with Options is required" }),
    select_single: z.string({ message: "Select Single is required" }),
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

export default function SelectDetails({}) {
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
                }}
                fields={[
                    {
                        id: "select_with_options",
                        formType: "select",
                        name: "select_with_options",
                        label: "Select with Options",
                        required: true,
                        selectSearchable: true,
                        selectIcon: UserIcon,
                        // readonly:true,
                    },
                    {
                        id: "select_single",
                        formType: "select",
                        name: "select_single",
                        label: "Select Single",
                        required: true,
                        selectIcon: UserIcon,
                        selectSearchable: true,
                        // disabled:true
                    },
                ]}
            />
        </>
    );
}
