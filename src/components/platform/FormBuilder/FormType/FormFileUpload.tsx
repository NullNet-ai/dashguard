"use client";
import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import { type IField } from "../type";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

import FileUpload from "../../FileUpload";
// import { DevTool } from "@hookform/devtools";

interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, string[]>>;
    fieldState: ControllerFieldState;
  };
  form: UseFormReturn<Record<string, string[]>, string, undefined>;
  accept?: string; // Optional accept prop for file types
  multiple?: boolean; // Optional multiple files prop
}

export default function FormFile({
  formRenderProps,
  form,
  fieldConfig,
}: IProps) {
  const { field } = formRenderProps;
  const { register } = form;
  const handleChangeUpload = (file_ids: string[]) => {
    form?.setValue(field.name, file_ids, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const defaultDropzoneOptions = {
    maxFiles: 5,
    maxSize: 1024 * 1024 * 10,
    multiple: true,
  };
  return (
    <FormItem>
      {fieldConfig?.label && (
        <FormLabel required={fieldConfig?.required}>
          {fieldConfig?.label}
        </FormLabel>
      )}

      <FormControl>
        <FileUpload
          {...register(field.name)}
          onUploadFile={handleChangeUpload}
          dropzoneOptions={
            fieldConfig.fileDropzoneOptions ?? defaultDropzoneOptions
          }
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
