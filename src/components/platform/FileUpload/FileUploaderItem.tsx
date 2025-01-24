"use client";

import {
  AlertTriangleIcon,
  CropIcon,
  Trash2 as RemoveIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";
import { FileCrop } from "./FileCrop";
import { FILE_TYPES, FilePreview, getFileTypeIcon } from "./FilePreview";
import { useFileUpload } from "./Provider";
import type { CropState, PixelCrop } from "./canvasUtils";
import { blobToFile, canvasPreview, createImage } from "./canvasUtils";

export enum UploadState {
  IDLE = "idle",
  UPLOADING = "uploading",
  UPLOADED = "uploaded",
  ERROR = "error",
}

export const FileUploaderItem = React.forwardRef<
  HTMLDivElement,
  {
    index: number;
    file: File & { download_path?: string };
    onRemove?: (index: number) => void;
    progressState?: { [key: number]: number };
    uploadError?: string;
  } & React.HTMLAttributes<HTMLDivElement>
>(
  (
    {
      className,
      index,
      file,
      onRemove: _onRemove,
      children: _children,
      progressState,
      uploadError,
      ...props
    },
    ref,
  ) => {
    const {
      removeFileFromSet,
      activeIndex,
      direction,
      formRenderProps,
      fieldConfig,
      state,
    } = useFileUpload();

    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState<string | null>(
      file?.download_path || null,
    );
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [croppedFile, setCroppedFile] = useState<File>(file);
    const [previewSrc, setPreviewSrc] = useState<string | null>(
      file?.download_path || null,
    );
    const isImageFile = FILE_TYPES.IMAGE.includes(file.type);
    const isPdfFile = FILE_TYPES.PDF.includes(file.type);
    const isGifImageFIle = FILE_TYPES.GIF.includes(file.type);

    const fileSizeInBytes = file.size;

    const fileSizeInKB = fileSizeInBytes / 1024;
    const fileSizeInMB = fileSizeInKB / 1024;
    const [formattedSize, setFormattedSize] = useState<string>(
      `${fileSizeInMB >= 1 ? fileSizeInMB.toFixed(2) + " MB" : fileSizeInMB.toFixed(2) + " KB"}`,
    );

    const isSelected = index === activeIndex;

    const [cropState, setCropState] = useState<CropState>({
      crop: { x: 0, y: 0 },
      zoom: 1,
      rotation: [0],
      croppedAreaPixels: null,
    });

    const isDisabled =
      formRenderProps?.field?.disabled || fieldConfig?.readonly;

    const previewCanvasRef = useRef<HTMLCanvasElement>(null);

    const readFile = (file: File & { download_path?: string }) => {
      if (file?.download_path) return;
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        let resultString: string;

        if (typeof reader.result === "object") {
          resultString = JSON.stringify(reader.result);
        } else {
          resultString = reader.result as string;
        }
        setImageSrc(resultString);
        setPreviewSrc(resultString);
      });
      reader.readAsDataURL(file);
    };

    // Load initial image
    useEffect(() => {
      if (!file?.download_path) {
        readFile(file);
      }
      return;
    }, [file]);

    const handleOpenCropModal = () => {
      if (!file?.download_path) {
        readFile(croppedFile);
      }
      setIsCropModalOpen(true);
      setCropState({
        crop: { x: 0, y: 0 },
        zoom: 1,
        rotation: [0],
        croppedAreaPixels: null,
      });
      if (!cropState.croppedAreaPixels) {
        setCropState({
          crop: { x: 0, y: 0 },
          zoom: 1,
          rotation: [0],
          croppedAreaPixels: null,
        });
      }
    };

    const rotateImage = (newRotation: number[]) => {
      setCropState((prev) => ({
        ...prev,
        rotation: newRotation,
      }));
    };

    const handleCropAndSave = async () => {
      try {
        if (
          !cropState.croppedAreaPixels ||
          !imageSrc ||
          !previewCanvasRef.current
        ) {
          return;
        }

        const image = await createImage(imageSrc);

        const croppedImageBlob = await canvasPreview(
          image,
          previewCanvasRef.current,
          cropState.croppedAreaPixels,
          cropState.rotation[0],
        );

        // Create a new file from the Blob
        const newCroppedFile = blobToFile(croppedImageBlob, file.name);

        const fileSizeInBytes = newCroppedFile.size;
        const fileSizeInKB = fileSizeInBytes / 1024;
        const fileSizeInMB = fileSizeInKB / 1024;

        setFormattedSize(
          `${fileSizeInMB >= 1 ? fileSizeInMB.toFixed(2) + " MB" : fileSizeInMB.toFixed(2) + " KB"}`,
        );

        setCroppedFile(newCroppedFile);

        const reader = new FileReader();
        reader.onloadend = () => {
          let resultString: string;

          if (typeof reader.result === "object") {
            resultString = JSON.stringify(reader.result);
          } else {
            resultString = reader.result as string;
          }
          setImageSrc(resultString);
          setPreviewSrc(resultString);
        };
        reader.readAsDataURL(newCroppedFile);

        toast.success("Image updated successfully!");

        setIsCropModalOpen(false);
      } catch (error) {
        console.error("Error while cropping:", error);
      }
    };

    const onCropComplete = (
      croppedArea: Record<string, any>,
      croppedAreaPixels: PixelCrop,
    ) => {
      setCropState((prev) => ({
        ...prev,
        croppedAreaPixels,
      }));
    };

    const onZoomChange = (newZoom: number) => {
      setCropState((prev) => ({
        ...prev,
        zoom: Math.max(1, newZoom),
      }));
    };

    const onCropChange = (crop: { x: number; y: number }) => {
      setCropState((prev) => ({
        ...prev,
        crop,
      }));
    };

    useEffect(() => {
      if ((isImageFile && !file?.download_path) || isPdfFile) {
        readFile(file);
      }
    }, [file, isImageFile, isPdfFile]);

    const handleOpenInNewTab = () => {
      const url = file?.download_path
        ? file?.download_path
        : URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    };

    const currentProgressState = file.download_path
      ? 100
      : progressState && progressState[index] !== undefined
        ? progressState[index]
        : 0;

    const stillInProgress =
      currentProgressState !== undefined && currentProgressState !== 100;

    const hasUploadError = state === "error";

    return (
      <>
        <div
          ref={ref}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "relative flex cursor-pointer items-center justify-between p-2",
            className,
            isSelected ? "bg-muted" : "",
            stillInProgress ? "cursor-not-allowed" : "cursor-pointer",
            hasUploadError ? "bg-destructive/10" : "",
          )}
          onClick={() => {
            if (!stillInProgress && !hasUploadError) {
              !isImageFile ? handleOpenInNewTab() : setIsPreviewModalOpen(true);
            }
          }}
          {...props}
        >
          <div className="mr-4">
            {hasUploadError ? (
              <div className="text-destructive">
                <AlertTriangleIcon className="h-12 w-12" />
              </div>
            ) : !!isImageFile && !!imageSrc ? (
              <img
                src={imageSrc}
                alt="Preview"
                className={`h-16 w-16 rounded object-cover ${hasUploadError ? "opacity-50" : ""}`}
              />
            ) : (
              <button
                type="button"
                disabled={isDisabled || hasUploadError}
                onClick={hasUploadError ? undefined : handleOpenInNewTab}
                className={hasUploadError ? "opacity-50" : ""}
              >
                {getFileTypeIcon(file)}
              </button>
            )}
          </div>
          <div className="flex-grow">
            <div
              className={`text-sm font-medium ${hasUploadError ? "text-destructive" : ""}`}
            >
              {croppedFile.name}
            </div>
            {hasUploadError ? (
              <div className="text-sm text-destructive">
                Upload Failed: {uploadError}
              </div>
            ) : stillInProgress ? (
              <Progress className="mt-2" value={currentProgressState} />
            ) : (
              <div className="text-sm font-medium">
                {isDisabled
                  ? `${formattedSize}`
                  : `${formattedSize} - ${currentProgressState}% uploaded`}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {!!isImageFile &&
            !isGifImageFIle &&
            !isDisabled &&
            !hasUploadError ? (
              <Button
                size={"xs"}
                variant={"softPrimary"}
                type="button"
                onClick={(e) => {
                  handleOpenCropModal();
                  e.stopPropagation();
                }}
                disabled={stillInProgress || isDisabled || hasUploadError}
                className="rounded-full"
              >
                <CropIcon className="h-4 w-4 text-primary" strokeWidth={2} />
              </Button>
            ) : (
              <></>
            )}
            {!isDisabled && (
              <Button
                type="button"
                size={"xs"}
                variant={"softDestructive"}
                onClick={(e) => {
                  removeFileFromSet(index);
                  e.stopPropagation();
                }}
                className={cn(
                  direction === "rtl" ? "left-1 top-1" : "right-1 top-1",
                  "rounded-full",
                )}
                disabled={stillInProgress || isDisabled}
              >
                <RemoveIcon className="h-4 w-4" strokeWidth={2} />
              </Button>
            )}
          </div>
        </div>
        <div className="ms-auto">
          <FileCrop
            isCropModalOpen={isCropModalOpen}
            setIsCropModalOpen={setIsCropModalOpen}
            imageSrc={imageSrc}
            cropState={cropState}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropComplete}
            state={state}
            handleCropAndSave={handleCropAndSave}
            previewCanvasRef={previewCanvasRef}
            formRenderProps={formRenderProps}
            rotateImage={rotateImage}
            setCropState={setCropState}
          />

          <FilePreview
            file={file}
            isPreviewModalOpen={isPreviewModalOpen}
            setIsPreviewModalOpen={setIsPreviewModalOpen}
            isImageFile={isImageFile}
            previewSrc={previewSrc}
            isPdfFile={isPdfFile}
          />
        </div>
      </>
    );
  },
);

FileUploaderItem.displayName = "FileUploaderItem";