"use client";

import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { forwardRef } from "react";
import { CloudUpload, Upload } from "lucide-react";

import { useFileUpload } from "./Provider";

interface FileInputProps extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean;
}
export const FileInput = forwardRef<HTMLDivElement, FileInputProps>(
  ({ className, children, disabled, ...props }, ref) => {
    const { dropzoneState, isFileTooBig, isLOF, value } = useFileUpload();
    const rootProps = isLOF || disabled ? {} : dropzoneState.getRootProps();


    if(value?.length) return null

    if(disabled && (value?.length === 0)) {
      return (
        <div className="w-full h-full border border-dashed border-border/75 rounded-lg bg-muted/20">
          <div className="flex flex-col items-center justify-center h-full py-2 px-6 text-center">
            <div className="mb-1 p-3 rounded-full bg-muted/40">
              <CloudUpload className="h-8 w-8 text-muted-foreground/80" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              No files uploaded
            </h3>
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={`relative w-full ${
          isLOF || disabled ? "cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <div
          className={cn(
            `w-full rounded-lg border-2 border-dashed duration-300 ease-in-out transition-all ${
              dropzoneState.isDragAccept
                ? "border-green-500 bg-green-50/50"
                : dropzoneState.isDragReject || isFileTooBig
                  ? "border-red-500 bg-red-50/50"
                  : "border-border/60 hover:border-border bg-muted/10 hover:bg-muted/20"
            }`,
            className,
          )}
          {...rootProps}
        >
          {!children && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="mb-4 p-3 rounded-full bg-muted/40">
                <Upload className="h-8 w-8 text-muted-foreground/60" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                Drop files here or click to browse
              </h3>
              <p className="text-xs text-muted-foreground">
                Drag and drop files or click to select from your device
              </p>
            </div>
          )}
          {children}
          {dropzoneState.isDragActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-sm rounded-lg">
              <div className="text-center">
                <div className="mb-2 p-3 rounded-full bg-primary/20 mx-auto w-fit">
                  <CloudUpload className="h-8 w-8 text-primary" />
                </div>
                <p className="text-lg font-semibold text-primary">
                  Drop files here
                </p>
              </div>
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
