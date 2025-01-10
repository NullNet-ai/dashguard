"use client";

import { type ReactNode } from "react";
import { FileUploader, type FileUploaderProps } from "./Provider";
import { FileInput } from "./FileInput";
import { CloudUpload } from "lucide-react";
import { FileUploaderContent } from "./FileUploaderContent";

interface FileProps extends FileUploaderProps {
  children?: ReactNode;
  fileUploaderProps?: Record<string, string>;
  fileInputProps?: Record<string, string>;
  fileUploaderContentProps?: Record<string, string>;
}
const FileUpload = ({
  value,
  orientation,
  onUploadFile,
  dropzoneOptions,
  formRenderProps,
  fileUploaderProps,
  fileInputProps,
  fieldConfig,
  fileUploaderContentProps,
  form,
  ...props
}: FileProps) => {
  return (
    <FileUploader
      dropzoneOptions={dropzoneOptions}
      value={value}
      orientation={orientation}
      onUploadFile={onUploadFile}
      formRenderProps={formRenderProps}
      fieldConfig={fieldConfig}
      {...fileUploaderProps}
    >
      <FileInput
        id="fileInput"
        className={`h-full content-center border border-dashed ${
          form?.formState?.errors ? "border-red-500" : "border-border/75"
        }`}
        disabled={formRenderProps?.field.disabled || fieldConfig?.readonly}
        {...fileInputProps}
      >
        <div className="flex w-full flex-col items-center justify-center p-8">
          <CloudUpload className="h-10 w-10 text-primary" />
          <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-primary">Upload Document</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PDF, Doc, JPG or GIF up to 10MB
          </p>
        </div>
      </FileInput>
      <FileUploaderContent {...fileUploaderContentProps} />
    </FileUploader>
  );
};

export default FileUpload;
