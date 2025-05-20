"use client";

import { z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { useToast } from "~/context/ToastProvider";
import { type IFormProps } from "../types";
import { api } from "~/trpc/react";

// Remove this guideline
import FormGuideLine from "../../form_guideline";

const FormSchema = z.object({});
// Paste the code snippet here
// Double check the code snippet to ensure that it is correct
// 1. FormSchema is defined as a z.object
// 2. FormBuilder is imported from "~/components/platform/FormBuilder"
// 3. IHandleSubmit is imported from "~/components/platform/FormBuilder/types"
// 4. Fields are defined in the FormBuilder component
export default function BasicDetails({ params, defaultValues }: IFormProps) {
  return <FormGuideLine />;
}
