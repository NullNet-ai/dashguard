"use client";

import { forwardRef, useRef, useState, useEffect } from "react";
import { Trash2 as RemoveIcon, CropIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button, buttonVariants } from "~/components/ui/button";
import { useFileUpload } from "./Provider";
import { FILE_TYPES, FilePreview, getFileTypeIcon } from "./FilePreview";
import { FileCrop } from "./FileCrop";
import {
  CropState,
  PixelCrop,
  blobToFile,
  canvasPreview,
  createImage,
} from "./canvasUtils";
import { toast } from "sonner";
import { Progress } from "~/components/ui/progress";

export enum UploadState {
  IDLE = "idle",
  UPLOADING = "uploading",
  UPLOADED = "uploaded",
  ERROR = "error",
}

export const FileUploaderItem = forwardRef<
  HTMLDivElement,
  {
    index: number;
    file: File;
    onRemove?: (index: number) => void;
    allowedFileTypes?: string[];
  } & React.HTMLAttributes<HTMLDivElement>
>(({ className, index, file, onRemove, children, ...props }, ref) => {
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [croppedFile, setCroppedFile] = useState<File>(file);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const isImageFile = FILE_TYPES.IMAGE.includes(file.type);
  const isPdfFile = FILE_TYPES.PDF.includes(file.type);
  const isGifImageFIle = FILE_TYPES.GIF.includes(file.type);

  const fileSizeInBytes = file.size;

  const fileSizeInKB = fileSizeInBytes / 1024;
  const fileSizeInMB = fileSizeInKB / 1024;
  const [formattedSize, setFormattedSize] = useState<string>(
    `${fileSizeInMB >= 1 ? fileSizeInMB.toFixed(2) + " MB" : fileSizeInMB.toFixed(2) + " KB"}`,
  );

  const {
    removeFileFromSet,
    activeIndex,
    direction,
    progressState,
    formRenderProps,
    state,
  } = useFileUpload();

  const isSelected = index === activeIndex;

  const [cropState, setCropState] = useState<CropState>({
    crop: { x: 0, y: 0 },
    zoom: 1,
    rotation: [0],
    croppedAreaPixels: null,
  });

  const isDisabled = formRenderProps?.field?.disabled;

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const result = reader.result?.toString() || null;
      setImageSrc(result);
      setPreviewSrc(result);
    });
    reader.readAsDataURL(file);
  };

  // Load initial image
  useEffect(() => {
    readFile(file);
  }, [file]);

  const handleOpenCropModal = () => {
    readFile(croppedFile);
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
      rotation: newRotation, // (prev.rotation + 90) % 360,
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
        cropState.zoom,
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
        const result = reader.result?.toString() || null;
        setImageSrc(result);
        setPreviewSrc(result);
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
    if (isImageFile || isPdfFile) {
      readFile(file);
    }
  }, [file, isImageFile, isPdfFile]);

  const handleOpenInNewTab = () => {
    const url = URL.createObjectURL(file);
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
  return (
    <>
      <div
        ref={ref}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "relative flex cursor-pointer items-center justify-between p-2",
          className,
          isSelected ? "bg-muted" : "",
        )}
        {...props}
      >
        <div className="mr-4">
          {!!isImageFile && !!imageSrc ? (
            <img
              src={imageSrc}
              alt="Preview"
              className={`h-16 w-16 rounded object-cover`}
              onClick={() => {
                if (!isDisabled) {
                  setIsPreviewModalOpen(true);
                }
              }}
            />
          ) : (
            <button
              type="button"
              disabled={isDisabled}
              onClick={handleOpenInNewTab}
            >
              {getFileTypeIcon(file)}
            </button>
          )}
        </div>
        <div className="flex-grow">
          <div className="text-sm font-medium">{croppedFile.name}</div>
          {state === UploadState.UPLOADING ? (
            <Progress className="mt-2" value={progressState} />
          ) : (
            <div className="text-sm font-medium">{`${formattedSize} - ${progressState}%`}</div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {!!isImageFile && !isGifImageFIle && !isDisabled ? (
            <Button
              size={"xs"}
              variant={"softPrimary"}
              type="button"
              onClick={handleOpenCropModal}
              disabled={state === UploadState.UPLOADING || isDisabled}
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
              onClick={() => removeFileFromSet(index)}
              className={cn(
                direction === "rtl" ? "left-1 top-1" : "right-1 top-1",
                "rounded-full",
              )}
              disabled={state === UploadState.UPLOADING || isDisabled}
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
});

FileUploaderItem.displayName = "FileUploaderItem";
