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
        "start-0 z-50 flex w-full justify-between items-center p-2 border-b border-gray-200 overflow-clip",
				sticky ? 'fixed' : 'rounded-[8px]',
        position === 'bottom' ? 'bottom-0' : 'top-0',
				className
      )}
    >
      <div className={cn(
				"flex flex-grow",
				contentAlign === 'left' ? 'justify-start' 
				: contentAlign === 'right' ? 'justify-end' 
				: 'justify-center'
			)}>
				{content}
      </div>
      <button
        onClick={handleClose} 
        className="px-2"
        aria-label="Close banner"
      >
        <XMarkIcon width={24} height={24} />
      </button>
    </div>
  );
}