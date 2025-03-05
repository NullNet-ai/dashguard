"use client";

import { UserIcon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
const FormSchema = z.object({
    select_with_options: z.string({ message: "Select with Options is required" }),
    select_with_infinite_scroll: z.string({ message: "Select with Infinite Scroll is required" }),
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

// Generate a large dataset for testing infinite scroll
const generateLargeDataset = (count = 500) => {
    return Array.from({ length: count }, (_, i) => ({
        label: `Option ${i + 1}`,
        value: `option-${i + 1}`
    }));
};

const sampleSelectOptionsAlphabetical = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Cherry", value: "cherry" },
    { label: "Date", value: "date" },
    { label: "Elderberry", value: "elderberry" },
    { label: "Fig", value: "fig" },
    { label: "Grape", value: "grape" },
    { label: "Honeydew", value: "honeydew" },
    { label: "Ice Apple", value: "ice_apple" },
    { label: "Jackfruit", value: "jackfruit" },
    { label: "Kiwi", value: "kiwi" },
    { label: "Lemon", value: "lemon" },
    { label: "Mango", value: "mango" },
    { label: "Nectarine", value: "nectarine" },
    { label: "Orange", value: "orange" }
];

const largeDataset = generateLargeDataset();

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
                    select_with_infinite_scroll: largeDataset,
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
                    },
                    {
                        id: "select_with_infinite_scroll",
                        formType: "select",
                        name: "select_with_infinite_scroll",
                        label: "Select with Infinite Scroll",
                        required: true,
                        selectSearchable: true,
                        selectIcon: UserIcon,
                        selectInfiniteScroll: {
                            enabled: true,
                            initialLimit: 20,
                            loadMoreStep: 20,
                            scrollThreshold: 0.8,
                            scrollableTarget: "select-infinite-scroll",
                            endMessage: (
                                <div className="flex justify-center py-2">
                                    <p className="text-center text-sm text-blue-500">
                                        All options loaded
                                    </p>
                                </div>
                            )
                        }
                    },
                ]}
            />
        </>
    );
}
