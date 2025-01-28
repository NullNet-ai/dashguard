"use client";
import {
  type UseFormReturn,
  type ControllerFieldState,
  type ControllerRenderProps,
} from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import FileUpload from "~/components/platform/FileUpload";
import { IField } from "../../types";


interface IProps {
  fieldConfig: IField;
  formRenderProps: {
    field: ControllerRenderProps<Record<string, string[]>>;
    fieldState: ControllerFieldState;
    formState?: any;
  };
  form: UseFormReturn<Record<string, string[]>, string, undefined>;
  accept?: string; // Optional accept prop for file types
  multiple?: boolean; // Optional multiple files prop
  formKey: string;
}

export default function FormFile({
  formRenderProps,
  form,
  fieldConfig,
  formKey,
}: IProps) {
  const { formState, field } = formRenderProps;
  const value = formState?.defaultValues?.[field.name] ?? [];

  const { register } = form;
  const handleChangeUpload = (file_ids: string[]) => {
    form?.setValue(field.name, file_ids, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const fileDropZoneOptions = {
    maxFiles: fieldConfig?.fileDropzoneOptions?.multiple === false ? 1 : (fieldConfig?.fileDropzoneOptions?.maxFiles ?? 5),
    maxSize: fieldConfig?.fileDropzoneOptions?.maxSize ?? 1024 * 1024 * 10,
    multiple: fieldConfig?.fileDropzoneOptions?.multiple ?? true,
    ...fieldConfig?.fileDropzoneOptions,
  };
  return (
    <FormItem>
      {fieldConfig?.label && (
        <FormLabel
          required={fieldConfig?.required}
          data-test-id={`${formKey}-lbl-${fieldConfig.name}`}
        >
          {fieldConfig?.label}
        </FormLabel>
      )}

      <FormControl>
        <FileUpload
          {...register(field.name)}
          fileInputProps={{
            "data-test-id": `${formKey}-file-inp-${fieldConfig.name}`,
          }}
          fileUploaderProps={{
            "data-test-id": `${formKey}-file-upl-${fieldConfig.name}`,
          }}
          fileUploaderContentProps={{
            "data-test-id": `${formKey}-file-cnt-${fieldConfig.name}`,
          }}
          onUploadFile={handleChangeUpload}
          dropzoneOptions={fileDropZoneOptions}
          value={value as any[]}
          formRenderProps={formRenderProps}
          fieldConfig={fieldConfig}
        />
      </FormControl>
      <FormMessage data-test-id={`${formKey}-err-msg-${fieldConfig.name}`} />
    </FormItem>
  );
}