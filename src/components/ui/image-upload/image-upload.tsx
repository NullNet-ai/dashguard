"use client";

import { cn } from "~/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, ImagePlus, Loader2 } from "lucide-react";
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import ImageViewer from '../image-viewer';
import Image from 'next/image';
import axios from 'axios';
import { api } from '~/trpc/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu"

type BaseImageUploadProps = {
  onImageUpload?: (data: string) => void;
  withImageViewer?: boolean;
  width?: number;
  height?: number;
  className?: string;
  borderless?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  value?: string;
}

type ImageUploadProps = BaseImageUploadProps & {
  variant?: "default" | "cover" | "box" | "avatar" | "vertical" | "full";
}

function BaseImageUpload({
  onImageUpload,
  withImageViewer = true,
  borderless = false,
  width,
  height,
  className,
  containerClassName,
  placeholderText,
  iconClassName,
  objectFit = "cover",
  value: _file
}: BaseImageUploadProps & {
  containerClassName: string;
  placeholderText: string;
  iconClassName?: string;
}) {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(_file ? true : false);
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
        setIsLoading(true);
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
        setIsLoading(false);
      }
    }

    if (data?.length) {
      const {download_path} = data[0] as any;
      if (download_path) {
        getFileData(download_path)
      } else {
        setIsLoading(false);
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

  const editButton = () => {
    if (!uploadedUrl) return

    return (
    <div className="absolute bottom-4 right-4 z-10 flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 rounded-full text-primary border-primary bg-accent hover:text-primary-foreground hover:border-primary hover:bg-primary/90">
          <ImagePlus className="size-8 p-1" />
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
    <div className={cn(
      "relative w-full",
      className
    )}>
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
          !uploadedUrl && "cursor-pointer",
          "group relative overflow-hidden transition-all hover:border-primary",
          borderless ? "border-none" : "border-2 border-solid border-gray-30",
          containerClassName
        )}
        style={{height: height, width: width }}
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
                className="h-full w-full rounded-none"
                style={{ width: '100%', height: '100%', margin: 'auto', objectFit: objectFit }}
              />
            ) : (
              <Image
                src={uploadedUrl}
                alt=""
                width={width || 100}
                height={height || 100}
                className={`h-full w-full object-${objectFit}`}
                style={{ margin: 'auto' }}
              />
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center gap-2">
              <ImageIcon className={cn("size-10", iconClassName)} />
              <p className="text-sm text-center">{placeholderText}</p>
            </div>
          </>
        )}
      </div>
      {!isLoading && editButton()}
    </div>
  );
}

export function DefaultImageUpload(props: BaseImageUploadProps) {
  return (
    <BaseImageUpload
      {...props}
      className={cn(props.className)}
      containerClassName="rounded-lg aspect-[3/2]"
      placeholderText="Click to upload an image"
    />
  );
}

export function BoxImageUpload(props: BaseImageUploadProps) {
  return (
    <BaseImageUpload
      {...props}
      className={cn(props.className)}
      containerClassName="rounded-lg aspect-square"
      placeholderText="Click to upload an images"
    />
  );
}

export function VerticalImageUpload(props: BaseImageUploadProps) {
  return (
    <BaseImageUpload
      {...props}
      className={cn(props.className)}
      containerClassName="rounded-lg aspect-[3/4]"
      placeholderText="Click to upload an images"
    />
  );
}

export function CoverImageUpload(props: BaseImageUploadProps) {
  return (
    <BaseImageUpload
      {...props}
      className={cn(props.className)}
      containerClassName="rounded-lg w-full aspect-[21/9] max-w-full"
      placeholderText="Click to upload an image"
    />
  );
}

export function AvatarImageUpload(props: BaseImageUploadProps) {
  return (
    <BaseImageUpload
      {...props}
      className={cn('max-w-min', props.className)}
      containerClassName="rounded-full size-32"
      placeholderText="Add photo"
      iconClassName="size-8"
    />
  );
}

export function FullImageUpload(props: BaseImageUploadProps) {
  return (
    <BaseImageUpload
      {...props}
      className={cn(props.className)}
      containerClassName="w-full"
      placeholderText="Click to upload an image"
    />
  );
}

export function ImageUpload({
  variant = "default",
  ...props
}: ImageUploadProps) {
  switch (variant) {
    case "cover":
      return <CoverImageUpload {...props} />;
    case "avatar":
      return <AvatarImageUpload {...props} />;
    case "box":
      return <BoxImageUpload {...props} />;
    case "vertical":
      return <VerticalImageUpload {...props} />;
    case "full":
      return <FullImageUpload {...props} />;
    default:
      return <DefaultImageUpload {...props} />;
  }
}