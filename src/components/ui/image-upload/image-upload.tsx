"use client";

import { cn } from "~/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, ImagePlus, Loader2 } from "lucide-react";
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import ImageViewer from '../image-viewer';
import Image from 'next/image';
import axios from 'axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu"
import { api } from '~/trpc/react';
import { getImageData } from '~/components/platform/Record/Summary/Header/action/getImageData';

type ImageUploadProps = {
  onImageUpload?: (data: any) => void;
  withImageViewer?: boolean;
  width?: number;
  height?: number;
  className?: string;
  borderless?: boolean;
  avatarSize?: number;
  variant?: "default" | "cover" | "avatar" | "full";
  value?: string;
}

export function ImageUpload({
  onImageUpload,
  withImageViewer = true,
  borderless = false,
  width,
  height,
  className,
  variant = "default",
  value: _file
}: ImageUploadProps) {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Only run the query if _file has a value
  const { data } = _file 
    ? api.files.getFileById.useQuery({
        ids: [_file],
        pluck_fields: [
          "filename",
          "filepath",
          "mimetype",
          "download_path",
          "size",
          "originalname",
        ],
      })
    : { data: undefined };

  useEffect(() => {

    const getFileData = async (path: string) => {
      try {
        const response = await fetch(`${path}`)
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onloadend = () => {
          setUploadedUrl(reader.result as string)
          setIsLoading(false)
        }
        reader.readAsDataURL(blob)
      } catch (error) {
        console.error("Error fetching file:", error);
      }
    }

    if (data?.length) {
      const {download_path} = data[0] as any;
      if (download_path) {
        getFileData(download_path)
      }
    }
  }, [data]);

  const handleUpload = async (file: File) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      
      const {data} = await axios.post("/api/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      });
      onImageUpload?.(data);
      const url = URL.createObjectURL(file);
      setUploadedUrl(url);

    }
    catch (error) {
      console.error("Error uploading file:", error);
    }
    finally {
      setIsLoading(false);
    }
  }

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleUpload(file);
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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-2 text-sm">Uploading image...</p>
            </div>
          ) : uploadedUrl ? (
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
        {!isLoading && editButton()}
      </div>
    </div>
  );
}