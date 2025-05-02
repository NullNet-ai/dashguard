"use client";

import { cn } from "~/lib/utils";
import { useCallback, useRef, useState } from "react";
import { ImageIcon, ImagePlus } from "lucide-react";
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import ImageViewer from '../image-viewer';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu"



type ImageUploadProps = {
  onImageUpload?: (fileUrl: string) => void;
  withImageViewer?: boolean;
  width?: number;
  height?: number;
  className?: string;
  borderless?: boolean;
  avatarSize?: number;
  variant?: "default" | "cover" | "avatar" | "full";
}

export function ImageUpload({
  onImageUpload,
  withImageViewer = true,
  borderless = false,
  width,
  height,
  className,
  variant = "default",
}: ImageUploadProps) {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setUploadedUrl(url);
        onImageUpload?.(url);
      }
    },
    [onImageUpload]
  );

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (uploadedUrl) {
      URL.revokeObjectURL(uploadedUrl);
      setUploadedUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onImageUpload?.('');
    }
  };

  const containerVariant = () => {
    switch (variant) {
      case "cover":
        return "rounded-lg w-full aspect-[21/9] max-w-full";
      case "avatar":
        return `rounded-full size-32`;
        case "full":
          return "w-full";
      default:
        return "rounded-lg aspect-[3/2]";
    }
  };

  const editButton = () => {
    if (!uploadedUrl) return

    return (
    <div className="absolute bottom-4 right-4 z-10 flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 rounded-full text-primary border-primary bg-accent hover:text-primary-foreground hover:border-primary hover:bg-primary/90">
          <ImagePlus className="size-7 p-1" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className='flex items-start gap-x-1' onClick={handleUploadClick}><PhotoIcon className='size-4' /> Change image</DropdownMenuItem>
          <DropdownMenuItem className='flex items-start gap-x-1' onClick={handleRemoveImage}><TrashIcon className='size-4' /> Remove image</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    )
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "group relative overflow-hidden transition-all hover:border-primary",
          borderless ? "border-none" : "border-2 border-solid border-gray-30",
          containerVariant()
        )}
        style={{height: height, width: width }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          onClick={uploadedUrl ? undefined : handleContainerClick}
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 transition-all group-hover:text-primary",
            !uploadedUrl && "cursor-pointer"
          )}
        >
          {uploadedUrl ? (
            <div className="relative h-full w-full">
              {withImageViewer ? (
                <ImageViewer
                  src={uploadedUrl}
                  alt=""
                  width={width || 100}
                  height={height || 100}
                  className={cn(
                    "h-full w-full rounded-none"
                  )}
                  style={{ width: variant ? '100%' : 'auto', height: '100%', margin: 'auto', objectFit: 'cover' }}
                />
              ) : (
                <Image
                  src={uploadedUrl}
                  alt=""
                  width={width || 100}
                  height={height || 100}
                  className={cn(
                    "h-full w-full",
                    variant === "cover" && "object-cover",
                    variant === "avatar" && "object-cover"
                  )}
                  style={{ margin: 'auto' }}
                />
              )}
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center gap-2">
                <ImageIcon className={cn("h-10 w-10", variant === "avatar" && "h-8 w-8")} />
                <p className="text-sm">{variant === "avatar" ? "Add photo" : "Click to upload an image"}</p>
              </div>
            </>
          )}
        </div>
        {editButton()}
      </div>
    </div>
  );
}