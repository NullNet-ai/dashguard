import React from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '../card'
import { cn } from '~/lib/utils'
import Image from 'next/image'
import ImageViewer from '../image-viewer';
import { Skeleton } from '../skeleton';

interface CardsProps {
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  coverImage?: string | React.ReactNode;
  body?: string | React.ReactNode;
  className?: string;
  maxWidth?: string;
  onClick?: () => void;
  loading?: boolean;
}

export function CardComponent({
  headerContent,
  footerContent,
  coverImage,
  body,
  className,
  maxWidth = '375px',
  onClick,
  loading = false,
}: CardsProps) {

	if(loading) {
		return <Skeleton className="w-full h-36 bg-slate-200" />
	}

  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative overflow-clip w-full rounded-[8px]",
        onClick && 'cursor-pointer',
        className
      )}
      style={{ maxWidth: maxWidth }}
    >

      {typeof coverImage === 'string' ? (
				<div className="relative h-36">
					<Image
						src={coverImage}
						fill
						objectFit='cover'
						alt="Workplace"
					/>
				</div>
			) : (
				coverImage
      )}
      {headerContent && (
				<CardHeader className="relative gap-4 p-0">
					{headerContent}
				</CardHeader>
      )}
      {body && (
				<CardContent className="p-0">
					{body}
				</CardContent>
      )}
      {footerContent && (
				<CardFooter className="p-0">
					{footerContent}
				</CardFooter>
      )}
    </Card>
  )
}