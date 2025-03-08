/* eslint-disable jsx-a11y/click-events-have-key-events,
jsx-a11y/no-static-element-interactions */
'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import { PinIcon, PinOffIcon } from 'lucide-react' // Add pin icons
import { Separator } from '@radix-ui/react-select'
import React, { useState, useRef, useEffect, createElement } from 'react'

import { Card, CardContent, CardHeader } from '~/components/ui/card'

import { DRAWER_WIDTH_KEY, useSideDrawer } from './SideDrawerProvider'
import { useSidebar } from '~/components/ui/sidebar'
import { cn } from '~/lib/utils'

import { GripVertical } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'


export const SideDrawerView: React.FC = () => {
  const { state, actions } = useSideDrawer()
  const { closeSideDrawer, togglePinSideDrawer, saveCurrentState, setwidth } = actions
  const { config, isOpen, isPinned } = state
  const { isBannerPresent } = useSidebar()
  
  // State for resizable drawer
  const [currentWidth, setCurrentWidth] = useState<string>('982px')
  const [isResizing, setIsResizing] = useState(false)
  const resizeHandleRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const lastSavedWidth = useRef<string>('982px') 

  const {
    header,
    body,
    sideDrawerWidth = '982px',
    overlayEnabled = false,
    closeOnOutsideClick = true,
    resizable = false,
    showResizeHandle = true,
    minResizeWidth,
    maxResizeWidth,
    isPinnable = false,
  } = config || {}

  useEffect(() => {
    // Always check localStorage first, then config
    const storedWidth = localStorage.getItem(DRAWER_WIDTH_KEY);
    if (storedWidth) {
      setCurrentWidth(storedWidth);
      setwidth(storedWidth);
      lastSavedWidth.current = storedWidth;
      return;
    }
    
    // Fallback to config width
    if (sideDrawerWidth) {
      setCurrentWidth(sideDrawerWidth);
      setwidth(sideDrawerWidth);
      lastSavedWidth.current = sideDrawerWidth;
    }
  }, [sideDrawerWidth]); 

  const { component: BodyComponent, componentProps } = body || {}

  const handleOutsideClick = () => {
    // Allow closing even when pinned if overlay is enabled and closeOnOutsideClick is true
    if (closeOnOutsideClick && overlayEnabled) {
      closeSideDrawer()
    }
  }

  // Unified resize handler
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!resizable) return;
    e.preventDefault();
    setIsResizing(true);

    // Add appropriate event listeners based on input type
    if (e.type === 'touchstart') {
      document.addEventListener('touchmove', handleResize, { passive: false });
      document.addEventListener('touchend', handleResizeEnd, { passive: false });
    } else {
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', handleResizeEnd);
    }
  };

  // Unified resize function
  const handleResize = (e: MouseEvent | TouchEvent) => {
    if (!isResizing || !drawerRef.current) return;

    // Get clientX from either mouse or touch event
    const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const newWidth = window.innerWidth - clientX;

    // Parse the sideDrawerWidth to use as default min width if minResizeWidth is not provided
    const defaultMinWidth = 300;
    const minWidth = minResizeWidth ? parseInt(minResizeWidth.replace(/[^0-9]/g, ''), 10) : defaultMinWidth;
    const maxWidth = maxResizeWidth ?
        parseInt(maxResizeWidth.replace(/[^0-9]/g, ''), 10) :
        window.innerWidth - 255;

    const constrainedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
    const newWidthStr = `${constrainedWidth}px`;

    setwidth(newWidthStr)
    // Update ref immediately and state asynchronously
    lastSavedWidth.current = newWidthStr;  // Track latest width synchronously

    setCurrentWidth(newWidthStr);  // Update visual state
};

const handleResizeEnd = () => {
    setIsResizing(false);
    
    // Always save the last known width from the ref
    localStorage.setItem(DRAWER_WIDTH_KEY, lastSavedWidth.current);
    
    // Update provider state
    if (config) {
        const configWithCurrentWidth = {
            ...config,
            sideDrawerWidth: lastSavedWidth.current
        };
        saveCurrentState(configWithCurrentWidth);
    }
    
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', handleResizeEnd);
    document.removeEventListener('touchmove', handleResize);
    document.removeEventListener('touchend', handleResizeEnd);
};

// Update initialization useEffect to always load from localStorage first
useEffect(() => {
    const storedWidth = localStorage.getItem(DRAWER_WIDTH_KEY);
    if (storedWidth) {
        setCurrentWidth(storedWidth);
        lastSavedWidth.current = storedWidth;
        return;
    }
    if (sideDrawerWidth) {
        setCurrentWidth(sideDrawerWidth);
        lastSavedWidth.current = sideDrawerWidth;
    }
}, [sideDrawerWidth]);

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResize)
      document.removeEventListener('mouseup', handleResizeEnd)
    }
  }, [isResizing])

  // Update the Card component to use a ref and directly set the width
  return (
    <div
      aria-labelledby='side-drawer-title'
      aria-modal='true'
      className={`${isPinned ? '' : 'fixed'} inset-0 z-[101] overflow-hidden transition-all ease-in-out duration-500 
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        ${overlayEnabled && !isPinned ? 'pointer-events-auto' : 'pointer-events-none'}`}
      role='dialog'
      style={{
        // Define CSS variable at the root level
        '--drawer-width': currentWidth
      } as React.CSSProperties}
    >
      {/* Overlay - only show when not pinned */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 
          ${overlayEnabled && !isPinned ? 'bg-black bg-opacity-50' : 'bg-transparent'}
          ${isOpen && !isPinned ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleOutsideClick}
      />

      {/* Drawer Content */}
      <Card
        ref={drawerRef}
        className={cn(
          `${isPinned ? 'relative' : 'fixed'} z-[102] transition-none h-[calc(100dvh-48px)] transform-gpu duration-800 ease-out
          ${!isPinned ? 'bottom-0 left-0 right-0 md:top-auto md:right-0 md:bottom-0 md:left-auto' : ''}
          ${isOpen ? 'translate-y-0 md:translate-x-0 pointer-events-auto' : 'pointer-events-none translate-y-full md:translate-y-0 md:translate-x-full'}`,
          isBannerPresent ? 'md:h-[calc(100dvh-75px)]' : 'md:h-[calc(100dvh-48px)] lg:h-[calc(100dvh-43px)]',
          isResizing ? 'transition-none' : '',
        )}
        style={{ width: 'var(--drawer-width)' }} 
      >
        {resizable && (
          <div
            ref={resizeHandleRef}
            className={cn(
              'absolute top-0 -left-4 bottom-0 w-8 cursor-ew-resize z-[999] md:flex hidden items-center justify-center touch-none pointer-events-auto select-none',
              'bg-transparent'
            )}
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            title="Drag to resize"
          >
            <div className={cn(
              'flex items-center justify-center h-fit rounded-sm transition-colors bg-secondary py-1',
              isResizing ? 'bg-primary' : 'hover:bg-primary/10'
            )}>
              {showResizeHandle && (
                <GripVertical className={cn(
                  'h-5 w-5 transition-all text-foreground',
                  isResizing ? 'text-primary-foreground opacity-100' : 'opacity-50 group-hover:opacity-100'
                )} />
              )}
            </div>
          </div>
        )}

        {config && (
          <>
            <CardHeader className="flex items-center gap-4 p-3 pb-0 justify-between">
              {header}
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  {isPinnable && (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button
                          aria-label={isPinned ? 'Unpin side drawer' : 'Pin side drawer'}
                          data-test-id={isPinned ? 'side-drawer-unpin' : 'side-drawer-pin'}
                          onClick={togglePinSideDrawer}
                          className="z-[103]"
                        >
                          {isPinned ? (
                            <PinOffIcon className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <PinIcon className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isPinned ? 'Unpin side drawer' : 'Pin side drawer'}
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                        aria-label='Close side drawer'
                        data-test-id='side-drawer-close'
                        onClick={closeSideDrawer}
                        className="z-[103]"
                      >
                        <XMarkIcon className="h-5 w-5 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Close side drawer
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className='flex flex-1 flex-col gap-2 h-full p-0'>
              {BodyComponent && (typeof BodyComponent === 'function' ?
                <BodyComponent {...componentProps} /> :
                typeof BodyComponent.then === 'function' ?
                  null : // Don't render Promise directly
                  createElement(BodyComponent as any, componentProps)
              )}
            </CardContent>

            <Separator />
          </>
        )}
      </Card>
    </div>
  )
}