/* eslint-disable @next/next/no-img-element */
import { type DetailedHTMLProps, type ImgHTMLAttributes } from 'react'
import { Dialog, DialogContent, DialogTrigger } from './dialog'
import { cn } from '~/lib/utils'
import { ExpandIcon } from 'lucide-react'

export default function ImageViewer({
  src,
  alt,
  className,
}: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) {
  if (!src) return null
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="group relative overflow-hidden rounded-md cursor-pointer" title='View Image'>
          <img
            src={src}
            alt={alt || ''}
            className={cn(
              "transform transition-all duration-500 ease-in-out group-hover:scale-110 w-full h-auto",
              className
            )}
          />
     
        </div>
      </DialogTrigger>
      <DialogContent className="w-auto border-0 bg-transparent p-0 shadow-none">
        <div 
          className="relative max-h-[90dvh] h-auto overflow-clip rounded-md bg-transparent animate-in fade-in-0 zoom-in-95 duration-300 ease-in-out"
        >
          <img 
            src={src} 
            alt={alt || ''} 
            className="max-h-[90dvh] w-auto object-contain transition-transform duration-200 ease-out hover:scale-105" 
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
