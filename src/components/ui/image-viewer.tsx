/* eslint-disable @next/next/no-img-element */
import { type DetailedHTMLProps, type ImgHTMLAttributes } from 'react';
import { Dialog, DialogContent, DialogTrigger } from './dialog';
import { cn } from '~/lib/utils';
import { ExpandIcon } from 'lucide-react';

export interface ImageViewerProps
  extends DetailedHTMLProps<
    ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  > {
  showExpandOverlay?: boolean;
  overlayContent?: React.ReactNode;
}

export default function ImageViewer({
  src,
  alt,
  className,
  showExpandOverlay = true,
  overlayContent,
  ...props
}: ImageViewerProps) {
  if (!src) return null;
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className={cn(`group/image-viewer relative cursor-pointer overflow-hidden rounded-md`, className)}
          title="View Image"
        >
          <img
            src={src}
            alt={alt || ''}
            className={cn(
              'transform w-full h-auto transition-all duration-500 ease-in-out group-hover/image-viewer:scale-110',
            )}
            {...props}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-all duration-300 ease-in-out group-hover/image-viewer:opacity-100">
            {showExpandOverlay && (
              overlayContent || <ExpandIcon className="size-10 rotate-0 scale-75 transform text-primary transition-all duration-300 ease-in-out group-hover/image-viewer:scale-100" />
            )}
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="w-auto border-0 bg-transparent p-0 shadow-none">
        <div className="relative h-auto max-h-[90dvh] overflow-clip rounded-md bg-transparent duration-300 ease-in-out animate-in fade-in-0 zoom-in-95">
          <img
            src={src}
            alt={alt || ''}
            className="max-h-[90dvh] w-auto object-contain transition-transform duration-200 ease-out hover:scale-105"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
