"use client";

import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { forwardRef } from "react";

import { useFileUpload } from "./Provider";

interface FileInputProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
}
export const FileInput = forwardRef<HTMLDivElement, FileInputProps>(
  ({ className, children, disabled, ...props }, ref) => {
    const { dropzoneState, isFileTooBig, isLOF } = useFileUpload();
    const rootProps = isLOF ? {} : dropzoneState.getRootProps();
    return (
      <div
        ref={ref}
        className={`relative w-full ${
          isLOF || disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <div
          className={cn(
            `w-full rounded-lg duration-300 ease-in-out ${
              dropzoneState.isDragAccept
                ? "border-green-500"
                : dropzoneState.isDragReject || isFileTooBig
                  ? "border-red-500"
                  : "border-gray-300"
            }`,
            className,
          )}
          {...rootProps}
        >
          {children}
          {dropzoneState.isDragActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
              <p className="text-lg font-semibold text-gray-700">
                Drop files here
              </p>
            </div>
          )}
        </div>
        <Input
          ref={dropzoneState.inputRef}
          readOnly={disabled || isLOF}
          disabled={isLOF || disabled}
          {...props}
          {...dropzoneState.getInputProps()}
          className={`${isLOF || disabled ? "cursor-not-allowed" : ""}`}
        />
      </div>
    );
  },
);

FileInput.displayName = "FileInput";
