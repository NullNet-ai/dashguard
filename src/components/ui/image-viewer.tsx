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
              "transform transition-all duration-500 ease-in-out group-hover:scale-110",
              className
            )}
            style={{
              width: '100%',
              height: 'auto',
            }}
            width={500}
            height={100}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 backdrop-blur-[2px]">
            <ExpandIcon className="text-primary size-10 transform transition-all duration-300 ease-in-out scale-75 group-hover:scale-100 rotate-0 " />
          </div>
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
