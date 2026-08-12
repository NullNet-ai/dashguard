'use client'

import { ArrowLeftStartOnRectangleIcon, Bars3Icon, StarIcon, ChevronUpDownIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import * as _ICON from '@heroicons/react/24/outline'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import React, { Fragment } from 'react'

import { TriggerOpenCloseSidebarComponent } from '~/components/application-layout/Header/TriggerComponent'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Separator } from '~/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '~/components/ui/sidebar'
import useWindowSize from '~/hooks/use-resize'
import useScreenType from '~/hooks/use-screen-type'
import { cn } from '~/lib/utils'
import { api } from '~/trpc/react'
import { testIDFormatter } from '~/utils/formatter'

// Import StateTab instead of Tabs
import StateTab from '~/components/platform/StateTab'
import { type TabItem } from '~/components/platform/StateTab/types'

import GroupMenu from './GroupMenu'
import Menu from './Menu'
import { type ISideBarProps } from './type'

// First, add the import for Tooltip components
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'

const isImageIcon = (icon?: string) => {
  if (!icon) return false
  const lower = icon.toLowerCase()
  return (
    lower.startsWith('/') &&
    (lower.endsWith('.png') ||
      lower.endsWith('.svg') ||
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.webp') ||
      lower.endsWith('.gif'))
  )
}

const ImageMaskIcon = ({
  src,
  className,
}: {
  src: string
  className?: string
}) => {
  return (
    <span
      aria-hidden={true}
      style={{ WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}
      className={cn(
        'inline-block bg-current [-webkit-mask-repeat:no-repeat] [-webkit-mask-position:center] [-webkit-mask-size:contain] [mask-repeat:no-repeat] [mask-position:center] [mask-size:contain]',
        className,
      )}
    />
  )
}

export default function AppSideBar(config: ISideBarProps) {
  const {
    headerComponent,
    footerComponent,
    footerMenuConfig,
    className,
    mainMenuConfig,
    screenType,
    tabsDisplayVariant = 'label-only',
    favoritesMenuConfig, 
    historyMenuConfig,
  } = config
  const apiAuth = api.auth.logout.useMutation()
  const navigate = useRouter()
  const currentYear = new Date().getFullYear()
  const { open, openMobile } = useSidebar()
  const handleLogout = async () => {
    await apiAuth.mutateAsync().then(() => {
      localStorage.removeItem('entity-last-paths');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('grid_persistence')) {
          localStorage.removeItem(key);
        }
      });
      navigate.push('/login')
    })
  };

  const { width } = useWindowSize()
  const screen = useScreenType() || screenType
  const isMobile = screen !== 'lg' && screen !== 'xl' && screen !== '2xl'
  const mobileView = (open && isMobile) || openMobile || (open && !openMobile)

  if (screenType !== screen && screen) {
    Cookies.set('screen-type', `${screen}`, { expires: 7 });
  }

  const sidebarIsOpen = isMobile ? openMobile : open;

  // Use provided configs or fall back to static items
  const favoriteItems = favoritesMenuConfig || [];
  const historyItems = historyMenuConfig || [];

  // Then modify the tabItems array to include tooltips
  
    // Create tab items for StateTab
    const tabItems: TabItem[] = [
      {
        id: 'menu',
        label: tabsDisplayVariant === 'label-only' ? "Menu" : "",
        icon: tabsDisplayVariant === 'icon-only' ? (
          <TooltipProvider >
            <Tooltip delayDuration={100}>
              {/* <TooltipTrigger asChild>
                <Bars3Icon className="h-5 w-5" />
              </TooltipTrigger> */}
              <TooltipContent side="top">
                <p>Menu</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : undefined,
        content: (
          <>
            {mainMenuConfig?.map((item, index) => {
              return (
                <Fragment key={index}>
                  {!item?.groups?.length
                    ? (
                      <Menu item={item} screenType={screen || screenType} />
                    )
                    : (
                      <GroupMenu
                        title={item?.groupTitle || ''}
                        groups={item.groups}
                        screenType={screen || screenType || ''}
                      />
                    )}
                  {item?.separator && <Separator className="my-2" />}
                </Fragment>
              )
            })}
          </>
        )
      },
      // {
      //   id: 'favorites',
      //   label: tabsDisplayVariant === 'label-only' ? "Favorites" : "",
      //   icon: tabsDisplayVariant === 'icon-only' ? (
      //     <TooltipProvider>
      //       <Tooltip delayDuration={100}>
      //         <TooltipTrigger asChild>
      //           <StarIcon className="h-5 w-5" />
      //         </TooltipTrigger>
      //         <TooltipContent side="top">
      //           <p>Favorites</p>
      //         </TooltipContent>
      //       </Tooltip>
      //     </TooltipProvider>
      //   ) : undefined,
      //   content: (
      //     <>
      //       {favoriteItems.length > 0 ? (
      //         favoriteItems.map((item, index) => (
      //           <Fragment key={index}>
      //             <Menu item={item} screenType={screen || screenType} />
      //             {index % 5 === 4 && <Separator className="my-2" />}
      //           </Fragment>
      //         ))
      //       ) : (
      //         <div className="flex h-32 w-full items-center justify-center text-muted-foreground">
      //           <p>Favorites Coming Soon</p>
      //         </div>
      //       )}
      //     </>
      //   )
      // },
      // {
      //   id: 'history',
      //   label: tabsDisplayVariant === 'label-only' ? "History" : "",
      //   icon: tabsDisplayVariant === 'icon-only' ? (
      //     <TooltipProvider>
      //       <Tooltip delayDuration={100}>
      //         <TooltipTrigger asChild>
      //           <ClipboardDocumentListIcon className="h-5 w-5" />
      //         </TooltipTrigger>
      //         <TooltipContent side="top">
      //           <p>History</p>
      //         </TooltipContent>
      //       </Tooltip>
      //     </TooltipProvider>
      //   ) : undefined,
      //   content: (
      //     <>
      //       {historyItems.length > 0 ? (
      //         historyItems.map((item, index) => (
      //           <Fragment key={index}>
      //             <Menu item={item} screenType={screen || screenType} />
      //             {index % 5 === 4 && <Separator className="my-2" />}
      //           </Fragment>
      //         ))
      //       ) : (
      //         <div className="flex h-32 w-full items-center justify-center text-muted-foreground">
      //           <p>History Coming Soon</p>
      //         </div>
      //       )}
      //     </>
      //   )
      // }
    ];

  return (
    <Sidebar
      collapsible="icon"
      className={className}
      screenType={screen || screenType}
    >
      {headerComponent && (
        <SidebarHeader className="group relative">
          <SidebarTrigger
            Icon={TriggerOpenCloseSidebarComponent}
            className={`absolute right-2 top-10 z-50  flex group-hover:flex ${open || openMobile ? 'hidden' : 'lg:flex'}`}
            data-test-id="sdnavmenu-trigger-btn"
          />
          <SidebarMenu>
            <SidebarMenuItem>{headerComponent}</SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
      )}
      <SidebarContent>
        <div className="px-1 mt-4">
          {mainMenuConfig?.map((item, index) => {
            return (
              <Fragment key={index}>
                {!item?.groups?.length
                  ? (
                    <Menu item={item} screenType={screen || screenType} />
                  )
                  : (
                    <GroupMenu
                      title={item?.groupTitle || ''}
                      groups={item.groups}
                      screenType={screen || screenType || ''}
                    />
                  )}
                {item?.separator && <Separator className="my-2" />}
              </Fragment>
            )
          })}
        </div>
      </SidebarContent>
      {footerComponent && (
        <SidebarFooter className="p-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    data-test-id="sdnavmenu-ftr-btn"
                    size="lg"
                    className={cn(
                      'h-12 p-1 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground',
                      open
                        ? 'w-full border-b py-2 opacity-100'
                        : cn('flex w-full cursor-pointer opacity-100', {
                            'justify-center': !sidebarIsOpen,
                          }),
                    )}
                  >
                    {footerComponent}
                    {open && <ChevronUpDownIcon className="ml-auto size-4" />}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  onClick={() => handleLogout()}
                  data-test-id="sdnavmenu-ftr-logout-btn"
                  className={cn(
                    `h-8 w-full text-destructive hover:bg-secondary hover:text-destructive`, `${mobileView ? 'justify-start' : 'justify-center'}`, `${openMobile ? 'justify-start px-2' : ''}`,
                  )}
                >
                  <ArrowLeftStartOnRectangleIcon
                    className="mr-2 ms-3 h-5 w-5"
                  />
                  {mobileView && (
                      <p>Logout</p>
                    )}
                </Button>
                <footer className="mt-1 grid h-10 w-full place-items-center text-nowrap bg-muted text-[10px] text-muted-foreground/70">
                  {mobileView
                    ? (
                      <span>
                        &copy;
                        {' All Rights Reserved. '}
                        {currentYear}
                        {' '}
                        DNA Micro
                        <sup className="text-[8px]">TM</sup>
                      </span>
                    )
                    : (
                      <span>
                        &copy;
                        {currentYear}
                      </span>
                    )}
                </footer>
                {footerMenuConfig && (
                  <DropdownMenuContent
                    className="z-[100] mx-auto w-[50px] max-w-[90%] rounded-lg md:max-w-[500px]"
                    side={width <= 640 ? 'top' : 'right'}
                    align="end"
                    sideOffset={4}
                  >
                    {footerMenuConfig?.map((item, index) => {
                      if (item?.separator) {
                        return <DropdownMenuSeparator key={index} />
                      }
                      // @ts-expect-error - TS doesn't know about dynamic imports
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, import/namespace
                      const ICON = _ICON?.[item?.icon] ?? ChevronUpDownIcon
                      const iconIsImage = isImageIcon(item?.icon)
                      return (
                        <DropdownMenuItem
                          key={index}
                          data-test-id={testIDFormatter(
                            'sdnavmenu-ftr-' + item.title?.split('').join(''),
                          )}
                        >
                          {iconIsImage ? (
                            <ImageMaskIcon src={item.icon ?? ''} className="mr-2 h-5 w-5" />
                          ) : (
                            <ICON className="mr-2 h-5 w-5" />
                          )}
                          {item.title}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                )}
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
