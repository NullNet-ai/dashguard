'use client'
import { usePathname } from 'next/navigation'
import React from 'react'
import { useSidebar } from '~/components/ui/sidebar'
import { SideDrawerView } from '~/components/platform/SideDrawer';

import { cn } from '~/lib/utils'
import { PINNED_STATE_KEY as sideDrawerIsPinned,  useSideDrawer} from '~/components/platform/SideDrawer/SideDrawerProvider'; 

interface ContentWraperProps {
  children: React.ReactNode
}

const ContentWraper = ({ children }: ContentWraperProps) => {
  const pathname = usePathname() || ''
  const [, , firstSegment, application, ,] = pathname.split('/')

  const {state} = useSideDrawer()
  const { isBannerPresent, } = useSidebar()
  const mtop: string =
    application === 'record'
      ? 'lg:mt-[0px] md:mt-[53px] mt-[126px]'
      : application === 'wizard'
        ? 'lg:mt-[0] mt-[128px] md:mt-[53px]'
        : firstSegment === 'dashboard'
          ? `lg:mt-[0] md:mt-[80px] ${isBannerPresent ? 'mt-[150px]' : 'mt-[100px]'}`
          : 'mt-[140px]';

          const isSideDrawerOpen = sideDrawerIsPinned && state.isOpen
          const containerStyle = isSideDrawerOpen && application === 'grid' ? 'lg:w-[800px]' : ''

  return (
    <div
      className={cn(
        'mb-12 lg:mb-0 lg:mt-0', `${application === 'grid' ? 'mt-[114px] pt-2 md:mt-[45px] lg:mt-[0px] lg:pt-0' : mtop}`,
         `${firstSegment === 'dashboard' ? 'overflow-auto' : ''} ` 
        ,
      )}
    >
      <div className={`${isSideDrawerOpen ? 'flex parent-conten-wrapper': 'no-parent'}`}>
        <div className={cn(`${isSideDrawerOpen ? 'flex-1' : ''}`, containerStyle)} >
          {children}
        </div>

        <div className={cn(`transition-all duration-700`, `${!state.isOpen ? 'h-0 w-0 overflow-hidden' : 'h-auto'}`)}>
          <SideDrawerView /> 
        </div>
      </div>
    </div>
  );
};

export default ContentWraper;
