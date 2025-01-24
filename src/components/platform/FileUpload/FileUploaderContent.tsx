"use client";

import FileDocIcon from "../../../../public/fileIcons/Outline/file-doc-outline.svg";
import FileGIFIcon from "../../../../public/fileIcons/Outline/file-gif-outline.svg";
import FileJPEGIcon from "../../../../public/fileIcons/Outline/file-jpeg-outline.svg";
import FileJPGIcon from "../../../../public/fileIcons/Outline/file-jpg-outline.svg";
import FilePDFIcon from "../../../../public/fileIcons/Outline/file-pdf-outline.svg";
import FilePNGIcon from "../../../../public/fileIcons/Outline/file-png-outline.svg";
import FilePPTIcon from "../../../../public/fileIcons/Outline/file-ppt-outline.svg";
import FileXLSIcon from "../../../../public/fileIcons/Outline/file-xls-outline.svg";
import Image from "next/image";
import { cn } from "~/lib/utils";
import {  useRef } from "react";

import { Paperclip } from "lucide-react";
import { useFileUpload } from "./Provider";
import { FileUploaderItem } from "./FileUploaderItem";
import React from "react";

export const FileUploaderContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const {
    orientation,
    value: files,
    removeFileFromSet,
    progressState,
  } = useFileUpload();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn("max-h-60 w-full overflow-y-auto px-1")}
      ref={containerRef}
      aria-description="content file holder"
    >
      <div
        ref={ref}
        className={cn(
          "flex gap-1 rounded-xl",
          orientation === "horizontal" ? "flex-raw flex-wrap" : "flex-col",
          className,
        )}
      >
        {files &&
          files.length > 0 &&
          files.map((file, i) => {
            let ImagePath;
            const fileType = file.type;

            if (fileType.includes("image/png")) {
              ImagePath = FilePNGIcon;
            } else if (fileType.includes("image/jpeg")) {
              ImagePath = FileJPEGIcon;
            } else if (fileType.includes("image/jpg")) {
              ImagePath = FileJPGIcon;
            } else if (fileType.includes("image/gif")) {
              ImagePath = FileGIFIcon;
            } else if (fileType.includes("application/pdf")) {
              ImagePath = FilePDFIcon;
            } else if (
              fileType.includes("application/msword") ||
              fileType.includes(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              )
            ) {
              ImagePath = FileDocIcon;
            } else if (fileType.includes("application/vnd.ms-excel")) {
              ImagePath = FileXLSIcon;
            } else if (fileType.includes("application/vnd.ms-powerpoint")) {
              ImagePath = FilePPTIcon;
            } else {
              ImagePath = Paperclip; // Default icon
            }

            return (
              <FileUploaderItem
                file={file}
                className="flex items-center justify-center rounded-lg border px-2 py-8"
                key={file.name}
                index={i}
                progressState={progressState}
                onRemove={() => removeFileFromSet(i)}
                {...props}
              >
                <Image src={ImagePath} width={40} height={40} alt="FileImage" />
                <span>{file.name}</span>
              </FileUploaderItem>
            );
          })}
      </div>
    </div>
  );
});

FileUploaderContent.displayName = "FileUploaderContent";
