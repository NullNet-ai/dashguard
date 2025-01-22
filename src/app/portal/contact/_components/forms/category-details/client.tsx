"use client";

import { type z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/types";
import { useToast } from "~/context/ToastProvider";
import { ContactCategoryDetailsSchema } from "~/server/zodSchema/contact/categoryDetails";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { UpdateCategory } from "./actions/updateCategory";
import CustomCategoryDetails from "../_custom/CategoryDetails";
import { IFormProps } from "../types";
import { XIcon } from "lucide-react";

export default function CategoryDetails({ params, defaultValues }: IFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  const { shell_type } = params;
  const { categories } = defaultValues || {};

  useEffect(() => {
    if (shell_type === "wizard" && categories !== "Contact")
      router.replace(`${pathname}?categories=${categories}`);
  }, [categories, shell_type]);

  const handleSave = async ({
    data,
  }: IHandleSubmit<z.infer<typeof ContactCategoryDetailsSchema>>) => {
    try {
      await UpdateCategory({
        id: params.id,
        categories: data.categories ?? "",
      });
      toast.success("Category Details submitted successfully.");
    } catch (error) {
      toast.error("Failed to submit Category Details.");
    }
  };

  return (
    <FormBuilder
      myParent={params.shell_type}
      enableFormRegisterToParent
      formProps={params}
      formLabel="Category Details"
      handleSubmit={handleSave}
      formKey="ContactCategoryDetails"
      formSchema={ContactCategoryDetailsSchema}
      defaultValues={defaultValues}
      selectOptions={{}}
      fields={[]}
      customRender={(form) => <CustomCategoryDetails form={form} />}
      customFormHostViewFormActions={[
        {
          label: "Custom Action",
          onClick: () => {
             // todo
          },
          icon: <XIcon className="h-3 w-3 text-slate-500" strokeWidth={3} />,
          disabled: false,
          hidden: false,
        },
      ]}
      customFormHostLockFormActions={[
        {
          label: "Custom Action",
          onClick: () => {
            // todo
          },
          icon: <XIcon className="h-3 w-3 text-slate-500" strokeWidth={3} />,
          disabled: false,
          hidden: false,
        },
      ]}
      features={
        {
          // enableFormHostLockActions: false,
        }
      }
    />
  );
}
