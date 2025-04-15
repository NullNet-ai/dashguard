'use client'

import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import Cookies from 'js-cookie'
import * as React from 'react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Separator } from '~/components/ui/separator'
import { Sheet, SheetContent } from '~/components/ui/sheet'
import { Skeleton } from '~/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import { useIsMobile } from '~/hooks/use-mobile'
import useScreenType from '~/hooks/use-screen-type'
import { cn } from '~/lib/utils'

export const SIDEBAR_WIDTH = '255px'
export const SIDEBAR_WIDTH_MOBILE = '18rem'
export const SIDEBAR_WIDTH_ICON = '80px'
const SIDEBAR_KEYBOARD_SHORTCUT = 'd'
interface SidebarContext {
  state: 'expanded' | 'collapsed'
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  isBannerPresent: boolean
  setIsBannerPresent: (isBannerPresent: boolean) => void
}

interface SidebarInsetProps extends React.ComponentProps<'main'> {
  application_name?: string
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.')
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    defaultOpen: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
      (
        {
          defaultOpen = true,
          open: openProp,
          onOpenChange: setOpenProp,
          className,
          style,
          children,
          ...props
        },
        ref,
      ) => {
        const isMobile = useIsMobile()
        const [openMobile, setOpenMobile] = React.useState(false)
        const [_open, _setOpen] = React.useState(defaultOpen)
        const [isBannerPresent, setIsBannerPresent] = React.useState(false)
        const open = openProp ?? _open
        const setOpen = React.useCallback(
          (value: boolean | ((value: boolean) => boolean)) => {
            if (setOpenProp) {
              return setOpenProp?.(
                typeof value === 'function' ? value(open) : value,
              )
            }
            Cookies.set('sidebar_state', `${open}`, { expires: 7 }) // Expires in 7 days
            _setOpen(value)

            // This sets the cookie to keep the sidebar state.
            // document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
          }, [setOpenProp, open],
        )

        // Helper to toggle the sidebar.
        const toggleSidebar = React.useCallback(() => {
          return isMobile
            ? setOpenMobile(open => !open)
            : setOpen(open => !open)
        }, [isMobile, setOpen, setOpenMobile])

        // Adds a keyboard shortcut to toggle the sidebar.
        React.useEffect(() => {
          const handleKeyDown = (event: KeyboardEvent) => {
            if (
              event.key === SIDEBAR_KEYBOARD_SHORTCUT
              && (event.metaKey || event.ctrlKey)
            ) {
              event.preventDefault()
              toggleSidebar()
            }
          }

          window.addEventListener('keydown', handleKeyDown)
          return () => window.removeEventListener('keydown', handleKeyDown)
        }, [toggleSidebar])

        // We add a state so that we can do data-state="expanded" or "collapsed".
        // This makes it easier to style the sidebar with Tailwind classes.
        const state = open ? 'expanded' : 'collapsed'

        const contextValue = React.useMemo<SidebarContext>(
          () => ({
            state,
            open,
            setOpen,
            isMobile,
            openMobile,
            setOpenMobile,
            toggleSidebar,
            isBannerPresent,
            setIsBannerPresent,
          }), [
            state,
            open,
            setOpen,
            isMobile,
            openMobile,
            setOpenMobile,
            toggleSidebar,
            isBannerPresent,
            setIsBannerPresent,
          ],
        )

        return (
          <SidebarContext.Provider value={contextValue}>
            <TooltipProvider delayDuration={100}>
              <div
                className={cn(
                  'group/sidebar-wrapper flex min-h-dvh w-full overflow-hidden text-sidebar-foreground has-[[data-variant=inset]]:bg-sidebar', className,
                )}
                ref={ref}
                style={
                  {
                    '--sidebar-width': SIDEBAR_WIDTH,
                    '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
                    ...style,
                  } as React.CSSProperties
                }
                {...props}
              >
                {children}
              </div>
            </TooltipProvider>
          </SidebarContext.Provider>
        )
      },
      )
SidebarProvider.displayName = 'SidebarProvider'

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    side?: 'left' | 'right'
    variant?: 'sidebar' | 'floating' | 'inset'
    collapsible?: 'offcanvas' | 'icon' | 'none'
    screenType?: string
  }
>(
  (
    {
      side = 'left',
      variant = 'sidebar',
      collapsible = 'offcanvas',
      className,
      screenType,
      children,
      ...props
    },
    ref,
  ) => {
    const { state, openMobile, setOpenMobile, setOpen,isBannerPresent } = useSidebar()
    const size = useScreenType()
    React.useEffect(() => {
      if (size === 'md' || size === 'sm' || size === 'xs') {
        setOpen(false)
      }
      else {
        setOpen(true)
        setOpenMobile(false)
      }
    }, [size])

    if (collapsible === 'none') {
      return (
        <div
          className={cn(
            'flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground', className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (screenType === 'sm' || screenType === 'xs') {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden z-[100] lg:z-[200]"
            data-mobile="true"
            data-sidebar="sidebar"
            side={ side }
            style={
              {
                '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }>
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }
    else if (screenType === 'md') {
      return (
        <div
          className="group peer hidden md:block"
          data-side={side}
          data-state="collapsed"
          ref={ref}
          data-collapsible="icon"
          // data-collapsible={state === "collapsed" ? collapsible : ""}
          data-variant={variant}
        >
          {/* This is what handles the sidebar gap on tablets, */}
          <div
            className={cn(
              'relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear', 'group-data-[collapsible=offcanvas]:w-0', 'group-data-[side=right]:rotate-180', variant === 'floating' || variant === 'inset'
                ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]'
                : 'group-data-[collapsible=icon]:w-[--sidebar-width-icon]',

            )} />
          <div
            className={cn(
              'fixed bottom-0 z-[100] hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex', side === 'left'
                ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
                : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
                isBannerPresent ? 'h-[calc(100svh-40px)]' : 'h-svh',

              // Adjust the padding for floating and inset variants.
              variant === 'floating' || variant === 'inset'
                ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]'
                : 'group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l', className,
            )}
            {...props}
          >            
            <div
              className="flex h-full relative w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
              data-sidebar="sidebar">
              {children}
              <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
                <SheetContent
                  className="z-[200]  w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
                  data-mobile="true"
                  data-sidebar="sidebar"
                  side={ side }
                  style={
                    {
                      '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
                    } as React.CSSProperties
                  }>
                  <div className={cn("flex w-full h-full flex-col relative bottom-0",
                  )}>{children}</div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        className="group peer hidden md:block"
        data-collapsible={ state === 'collapsed' ? collapsible : ''}
        data-side={ side }
        data-state={ state }
        data-variant={ variant }
        ref={ ref }>
        {/* This is what handles the sidebar gap on desktop */}
        <div
          className={cn(
            'relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-300 ease-linear', 'group-data-[collapsible=offcanvas]:w-0', 'group-data-[side=right]:rotate-180', variant === 'floating' || variant === 'inset'
              ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]'
              : 'group-data-[collapsible=icon]:w-[--sidebar-width-icon]',
          )} />
        <div
          className={cn(
            'fixed bottom-0  z-[100] hidden  w-[--sidebar-width] transition-[left,right,width,height]  duration-300 ease-linear md:flex', side === 'left'
              ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
              : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
              isBannerPresent ? 'h-[calc(100svh-38px)]'  : 'h-svh ',
            // Adjust the padding for floating and inset variants.
            variant === 'floating' || variant === 'inset'
              ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]'
              : 'group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l', className,
          )}
          {...props}
        >
          <div
            className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
            data-sidebar="sidebar">
            {children}
          </div>
        </div>
      </div>
    )
  },
)
Sidebar.displayName = 'Sidebar'

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, iconClassName, ...props }, ref) => {
  const { toggleSidebar, setOpenMobile, openMobile } = useSidebar()
  const size = useScreenType()

  return (
    <Button
      className={ cn(
        'h-7 w-7 hover:bg-transparent active:translate-y-0', className,
      ) }
      data-sidebar="trigger"
      ref={ ref }
      variant="ghost"
      onClick={ (event) => {
        onClick?.(event)
        if (size === 'md' || size === 'sm' || size === 'xs') {
          setOpenMobile(!openMobile)
          return
        }
        toggleSidebar()
      }}
      {...props}
    >
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = 'SidebarTrigger'

const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'>
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      aria-label="Toggle Sidebar"
      className={ cn(
        'absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex', '[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize', '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize', 'group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar', '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2', '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2', className,
      ) }
      data-sidebar="rail"
      ref={ ref }
      tabIndex={ -1 }
      title="Toggle Sidebar"
      onClick={ toggleSidebar }
      {...props} />
  )
})
SidebarRail.displayName = 'SidebarRail'

const SidebarInset = React.forwardRef<HTMLDivElement, SidebarInsetProps>(
  ({ className, application_name, ...props }, ref) => {
    const mt
      = application_name === 'record' ? 'lg:mt-[3.2rem]' : 'lg:mt-[3.1rem]'

    return (
      <div
        className={ cn(
          'sidebar-inset relative mt-0 flex flex-1 flex-col bg-background', mt, 'peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow', className,
        ) }
        ref={ ref }
        {...props} />
    )
  },
)
SidebarInset.displayName = 'SidebarInset'

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      className={ cn(
        'h-8 w-full bg-background shadow-none', className,
      ) }
      data-sidebar="input"
      ref={ ref }
      {...props} />
  )
})
SidebarInput.displayName = 'SidebarInput'

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      className={ cn('flex flex-col gap-2 p-2', className) }
      data-sidebar="header"
      ref={ ref }
      {...props} />
  )
})
SidebarHeader.displayName = 'SidebarHeader'

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      className={ cn('flex flex-col gap-2 p-2', className) }
      data-sidebar="footer"
      ref={ ref }
      {...props} />
  )
})
SidebarFooter.displayName = 'SidebarFooter'

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      className={ cn('mx-2 w-auto bg-sidebar-border', className) }
      data-sidebar="separator"
      ref={ ref }
      {...props} />
  )
})
SidebarSeparator.displayName = 'SidebarSeparator'

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      className={ cn(
        'flex min-h-0 flex-1 flex-col gap-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden', className,
      ) }
      data-sidebar="content"
      ref={ ref }
      {...props} />
  )
})
SidebarContent.displayName = 'SidebarContent'

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      className={ cn('relative flex w-full min-w-0 flex-col px-2', className) }
      data-sidebar="group"
      ref={ ref }
      {...props} />
  )
})
SidebarGroup.displayName = 'SidebarGroup'

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'

  return (
    <Comp
      className={ cn(
        'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-linear  [&>svg]:size-4 [&>svg]:shrink-0', 'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0', className,
      ) }
      data-sidebar="group-label"
      ref={ ref }
      {...props} />
  )
})
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      className={ cn(
        'absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground  [&>svg]:size-4 [&>svg]:shrink-0',
        // Increases the hit area of the button on mobile.
        'after:absolute after:-inset-2 after:md:hidden', 'group-data-[collapsible=icon]:hidden', className,
      ) }
      data-sidebar="group-action"
      ref={ ref }
      {...props} />
  )
})
SidebarGroupAction.displayName = 'SidebarGroupAction'

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    className={ cn('w-full text-sm', className) }
    data-sidebar="group-content"
    ref={ ref }
    {...props} />
))
SidebarGroupContent.displayName = 'SidebarGroupContent'

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    className={ cn('flex w-full min-w-0 flex-col gap-1', className) }
    data-sidebar="menu"
    ref={ ref }
    {...props} />
))
SidebarMenu.displayName = 'SidebarMenu'

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li
    className={ cn('group/menu-item relative', className) }
    data-sidebar="menu-item"
    ref={ ref }
    {...props} />
))
SidebarMenuItem.displayName = 'SidebarMenuItem'

const sidebarMenuButtonVariants = cva(
  'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2  text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] lg:hover:bg-sidebar-accent lg:hover:text-sidebar-accent-foreground  active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[active=true]:[&>svg]:text-primary data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 cursor:pointer', {
    variants: {
      variant: {
        default:
          'lg:hover:bg-sidebar-accent lg:hover:text-sidebar-accent-foreground',
        outline:
          'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent lg:hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
      },
      size: {
        default: 'h-[2.4rem] text-sm',
        sm: 'h-7 text-xs',
        lg: 'h-12 text-sm group-data-[collapsible=icon]:!p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
    screenType?: string
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = 'default',
      size = 'default',
      screenType,
      tooltip,
      className,
      ...props
    },
    ref,
  ) => {
    const mobile
    = screenType === 'sm' || screenType === 'xs' || screenType === 'md'
    const Comp = asChild ? Slot : 'button'
    const { isMobile, state } = useSidebar()

    const button = (
      <Comp
        className={ cn(sidebarMenuButtonVariants({ variant, size }), className) }
        data-active={ isActive }
        data-sidebar="menu-button"
        data-size={ size }
        ref={ ref }
        {...props} />
    )

    if (!tooltip) {
      return button
    }

    if (typeof tooltip === 'string') {
      tooltip = {
        children: tooltip,
      }
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild={ true }>{button}</TooltipTrigger>
        <TooltipContent
          align="center"
          hidden={ state !== 'collapsed' || isMobile }
          side="right"
          {...tooltip} />
      </Tooltip>
    )
  },
)
SidebarMenuButton.displayName = 'SidebarMenuButton'

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      className={ cn(
        'absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground  peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0',
        // Increases the hit area of the button on mobile.
        'after:absolute after:-inset-2 after:md:hidden', 'peer-data-[size=sm]/menu-button:top-1', 'peer-data-[size=default]/menu-button:top-1.5', 'peer-data-[size=lg]/menu-button:top-2.5', 'group-data-[collapsible=icon]:hidden', showOnHover
        && 'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0', className,
      ) }
      data-sidebar="menu-action"
      ref={ ref }
      {...props} />
  )
})
SidebarMenuAction.displayName = 'SidebarMenuAction'

const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div
    className={ cn(
      'pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground', 'peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground', 'peer-data-[size=sm]/menu-button:top-1', 'peer-data-[size=default]/menu-button:top-1.5', 'peer-data-[size=lg]/menu-button:top-2.5', 'group-data-[collapsible=icon]:hidden', className,
    ) }
    data-sidebar="menu-badge"
    ref={ ref }
    {...props} />
))
SidebarMenuBadge.displayName = 'SidebarMenuBadge'

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    showIcon?: boolean
  }
>(({ className, showIcon = false, ...props }, ref) => {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  }, [])

  return (
    <div
      className={ cn('flex h-8 items-center gap-2 rounded-md px-2', className) }
      data-sidebar="menu-skeleton"
      ref={ ref }
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon" />
      )}
      <Skeleton
        className="h-4 max-w-[--skeleton-width] flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            '--skeleton-width': width,
          } as React.CSSProperties
        } />
    </div>
  )
})
SidebarMenuSkeleton.displayName = 'SidebarMenuSkeleton'

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    className={ cn(
      'flex min-w-0 translate-x-px flex-col  py-0.5',
      // "group-data-[collapsible=icon]:hidden",
      className,
    ) }
    data-sidebar="menu-sub"
    ref={ ref }
    {...props} />
))
SidebarMenuSub.displayName = 'SidebarMenuSub'

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ ...props }, ref) => <li ref={ref} {...props} />)
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem'

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<'a'> & {
    asChild?: boolean
    size?: 'sm' | 'md'
    isActive?: boolean
    open?: boolean
  }
>(({ asChild = false, size = 'md', isActive, className, open, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a'
  return (
    <Comp
      className={ cn(
        'flex   min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md p-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground  active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0', 'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground ',"data-[active=true]:[&>svg]:text-primary", size === 'sm' && 'text-xs', size === 'md' && 'text-sm',
        // "group-data-[collapsible=icon]:hidden",
        `${!open ? 'justify-center' : ''}`, className,
      ) }
      data-active={ isActive }
      data-sidebar="menu-sub-button"
      data-size={ size }
      ref={ ref }

      {...props} />
  )
})
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton'

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
