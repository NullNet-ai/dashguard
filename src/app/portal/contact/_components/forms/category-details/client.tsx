"use client";

import { type z } from "zod";
import { FormBuilder } from "~/components/platform/FormBuilder";
import { type IHandleSubmit } from "~/components/platform/FormBuilder/type";
import { useToast } from "~/context/ToastProvider";
import { ContactCategoryDetailsSchema } from "~/server/zodSchema/contacts/categoryDetails";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import UpdateCategory from "./actions/updateCategory";
import CustomCategoryDetails from "../custom/CategoryDetails";
import { IFormProps } from "../types";

export default function CategoryDetails({
  params,
  defaultValues,
  selectOptions,
}: IFormProps) {
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
      toast.success("Category Details submit successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit Category Details");
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
      defaultValues={
        defaultValues?.categories === "Contact"
          ? { categories: "" }
          : defaultValues
      }
      selectOptions={{}}
      fields={[]}
      customRender={(form) => (
        <CustomCategoryDetails form={form} selectOptions={selectOptions} />
      )}
    />
  );
}
