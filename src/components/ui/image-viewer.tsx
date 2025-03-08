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
        <div className="group relative overflow-hidden rounded-md" title='View Image'>
          <img
            src={src}
            alt={alt || ''}
            sizes="100vw"
            className={cn("transition-all duration-500 ease-in-out group-hover:scale-105 group-hover:brightness-90", className)}
            style={{
              width: '100%',
              height: 'auto',
            }}
            width={500}
            height={100}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100">
           <ExpandIcon className="text-primary size-10 transform scale-75 transition-transform duration-300 group-hover:scale-100" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-7xl border-0 bg-transparent p-0 shadow-none">
        <div className="relative h-[calc(100vh-220px)] w-full overflow-clip rounded-md bg-transparent animate-in fade-in zoom-in-95 duration-300">
          <img src={src} alt={alt || ''} className="h-full w-full object-contain" />
        </div>
      </DialogContent>
    </Dialog>
  )
}
