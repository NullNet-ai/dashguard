'use client';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useSidebar } from '~/components/ui/sidebar';
import { SideDrawerView } from '~/components/platform/SideDrawer';

import { cn } from '~/lib/utils';
import {
  PINNED_STATE_KEY as sideDrawerIsPinned,
  useSideDrawer,
} from '~/components/platform/SideDrawer/SideDrawerProvider';

interface ContentWraperProps {
  children: React.ReactNode;
}

const ContentWraper = ({ children }: ContentWraperProps) => {
  const pathname = usePathname() || '';
  const [, , firstSegment, application, ,] = pathname.split('/');

  const { state } = useSideDrawer();
  const { isBannerPresent } = useSidebar();
  const mtop: string =
    ['record', 'grid', 'wizard'].includes(application || '')
      ? 'mt-[90px] md:mt-0'
        : firstSegment === 'dashboard'
          ? `lg:mt-[0] md:mt-[80px] ${isBannerPresent ? 'mt-[150px]' : 'mt-[100px]'}`
          : 'mt-[50px]';

  const isSideDrawerOpen = sideDrawerIsPinned && state.isOpen;
  const containerStyle =
    isSideDrawerOpen && application === 'grid' ? 'lg:w-[800px]' : '';
  const widthStyle =
    isSideDrawerOpen && state?.isPinned && application !== 'grid'
      ? { width: `calc(100dvw - ${state.width} - 260px)` }
      : {};

  return (
    <div
      className={cn(
        'mb-12 lg:mb-0 lg:mt-0',
        `${mtop}`,
        `${firstSegment === 'dashboard' ? 'overflow-auto' : ''} `,
      )}
    >
      <div
        className={`${isSideDrawerOpen ? 'parent-conten-wrapper flex' : 'no-parent'}`}
        style={widthStyle}
      >
        <div
          className={cn(
            `${isSideDrawerOpen ? 'w-full flex-1' : ''}`,
            containerStyle,
          )}
        >
          {children}
        </div>

        <div
          className={cn(
            `transition-all duration-700`,
            `${!state.isOpen ? 'h-0 w-0 overflow-hidden' : 'h-auto'}`,
          )}
        >
          <SideDrawerView />
        </div>
      </div>
    </div>
  );
};

export default ContentWraper;
