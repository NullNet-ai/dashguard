"use client";

import { type ReactNode } from "react";
import { FileUploader, type FileUploaderProps } from "./Provider";
import { FileInput } from "./FileInput";
import { CloudUpload } from "lucide-react";
import { FileUploaderContent } from "./FileUploaderContent";

interface FileProps extends FileUploaderProps {
  children?: ReactNode;
}
const FileUpload = ({
  value,
  orientation,
  onUploadFile,
  dropzoneOptions,
}: FileProps) => {
  return (
    <FileUploader
      dropzoneOptions={dropzoneOptions}
      value={value}
      orientation={orientation}
      onUploadFile={onUploadFile}
      className="h-80"
    >
      <FileInput
        id="fileInput"
        className="h-full content-center border border-dashed border-border/75"
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
      <FileUploaderContent />
    </FileUploader>
  );
};

export default FileUpload;
