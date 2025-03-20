'use client'

import { XMarkIcon } from '@heroicons/react/20/solid';
import { Button } from '../button';
import { cn } from '~/lib/utils';
import Link from 'next/link';
import { useState } from 'react';

interface BtnAction {
  type: 'button' | 'link' | 'icon';
	icon_position?: 'left' | 'right';
	position?: 'start' | 'end';
	id?: string;
  label?: string;
  href?: string;
  btnStyle?: string;
	icon?: React.ElementType;
  onClick?: () => void;
}

interface BannerProps {
  contentAlign?: 'left' | 'center' | 'right';
  position?: "top" | "bottom";
  hideable?: boolean;
	sticky?: boolean;
	className?: string;
  maxWidth?: string;
  content?: React.ReactNode;
  actions?: BtnAction[];
}

export default function Banner({ 
  contentAlign,
  position = "top",
	className = 'bg-slate-800 text-white',
	content = "This is where your content goes.",
	hideable = true,
	sticky = false,
  maxWidth,
  actions,
}: BannerProps) {
	const [isVisible, setIsVisible] = useState(() => {
    if (!hideable) {
      return localStorage.getItem('banner_hidden') !== 'true';
    }
    return true;
  });

	const handleClose = () => {
    setIsVisible(false);
    if (!hideable) {
      localStorage.setItem('banner_hidden', 'true'); 
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      id="sticky-banner" 
      tabIndex={-1} 
      style={{ maxWidth: maxWidth }}
      className={cn(
        "start-0 z-50 flex w-full justify-between items-center p-4 border-b border-gray-200",
				sticky ? 'fixed' : 'rounded-[8px]',
        position === 'bottom' ? 'bottom-0' : 'top-0',
				className
      )}
    >
      <div className={cn(
				"flex w-full",
				contentAlign === 'left' ? 'justify-start' 
				: contentAlign === 'right' ? 'justify-end' 
				: 'justify-center'
			)}>
				<div className={cn(
					"flex",
					!contentAlign && 'w-full'
				)}>
					{actions?.map((action, index) => 
						action.position === 'start' && (
							<div key={index} className="flex items-center text-base font-normal">
								{ButtonComponent(action)}
							</div>
						)
					)}

					{content}

					{actions?.map((action, index) => 
						(!action.position || action.position === 'end') && (
							<div key={index} className="flex items-center text-base font-normal">
								{ButtonComponent(action)}
							</div>
						)
					)}
				</div>
      </div>
      <button
        onClick={handleClose} 
        className="ml-4"
        aria-label="Close banner"
      >
        <XMarkIcon width={30} height={30} />
      </button>
    </div>
  );
}

const ButtonComponent = (action: BtnAction) => {
	return (
		<Button 
			onClick={action.onClick}
			className={cn(
				"flex text-sm",
				action.btnStyle ? action.btnStyle : 'text-slate-800',
				action.type === 'button' ? 'px-4' : 'px-0',
			)}
			size="xs"
			borderRadius={action.type === 'button' ? 'rounded' : undefined}
			variant={action.type === 'link' ? 'link' : 'default'}
			Icon={action.type === 'button' ? action.icon : undefined}      
			iconPlacement={action.icon_position}
		>
			{action.type && action.type === 'link' ? (
				action.href && (
				<Link 
					href={action.href} 
					className={cn(
						action.btnStyle,
						action.icon_position === "left" && "flex items-center"
					)}
				>
					{action.label}
					{action.icon && <action.icon className="size-5" />}
				</Link>)
			) : (
				action.label
			)}
		</Button>
	)
}