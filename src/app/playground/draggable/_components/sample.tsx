"use client";

import { toast } from "sonner";
import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";

const FormSchema = z.object({
    draggable: z.array(
        z.object({
            "user-name": z
                .string({ required_error: "User Name is required" })
                .min(2, { message: "User Name must be at least 2 characters long" }),
            userEmail: z
                .string({ required_error: "User Email is required" })
                .email({ message: "Invalid email address" }),
            checkbox: z.boolean({ required_error: "Checkbox is required" }),
            
        })
    ),
});

export default function UserProfileForm() {
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
            formLabel="User Profile Form"
            formKey="user-profile"
            handleSubmit={handleSave}
            formSchema={FormSchema}
            defaultValues={{
                draggable: [
                    {
                        "user-name": "John Doe",
                        userEmail: "john.doe@example.com",
                    },
                ],
            }}
            fields={[
                {
                    id: "draggable",
                    formType: "draggable",
                    name: "draggable",
                    label: "Draggable",
                    draggableConfig: [
                        {
                            fields: {
                                id: "userName",
                                formType: "input",
                                name: "user-name",
                                label: "User Name",
                                required: true,
                                placeholder: "Enter your user name...",
                            },
                        },
                        {
                            fields: {
                                id: "userEmail",
                                formType: "select",
                                name: "userEmail",
                                label: "User Email",
                                required: true,
                                placeholder: "Enter your email...",

                                selectOptions: [
                                    {
                                        value: "john.doe@example.com",
                                        label: "john.doe@example.com",
                                    },
                                    {
                                        value: "jane.doe@example.com",
                                        label: "jane.doe@example.com",
                                    },
                                ],
                            },
                        },
                        {
                            fields: {
                                id: "checkbox",
                                formType: "checkbox",
                                name: "checkbox",
                                label: "Checkbox",
                                required: true,
                                checkboxOptions: [
                                    {
                                        value: true,
                                        label: "Is Active",
                                    },
                                ],
                            },
                        },
                    ],
                },
            ]}
        />
    );
}
