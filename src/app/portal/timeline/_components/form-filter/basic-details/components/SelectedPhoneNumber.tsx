"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FormModule from "~/components/platform/FormBuilder/components/ui/FormModule/FormModule";
import { IField } from "~/components/platform/FormBuilder/types";
import { Form } from "~/components/ui/form";
import { ulid } from "ulid";
import { DevTool } from '@hookform/devtools';

const FormSchema = z.object({
  phone_number: z.string().optional(),
  phone_numbers: z
    .array(
      z.object({
        id: z.string().optional(),
        raw_phone_number: z.string().optional(),
        is_primary: z.boolean().optional(),
        iso_code: z.string().optional(),
        country_code: z.string().optional(),
      }),
    )
    .optional(),
});

interface IOptions {
  type: "error" | "default" | "filled" | "disabled";
}


const SelectedPhoneNumber = ({
  fields,
  options,
  value,
}: {
  options: IOptions;
  fields: IField[];
  value?: string;
}) => {

const phone_number = [
    {
        id: ulid(),
        raw_phone_number: value,
        iso_code: "us",
        country_code: "1",
        is_primary: true,
    },
    ];
      

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
        phone_number: phone_number
    },
  });


  return (
    <>
        <Form {...form}>
            <FormModule
                formKey="phone_number_input"
                //@ts-expect-error - Adding defaultValues causes the issue
                form={form}
                formSchema={FormSchema}
                fields={fields}
            />
        </Form>
    </>
  );
};


export default SelectedPhoneNumber;
