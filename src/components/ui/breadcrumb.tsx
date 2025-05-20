'use client'
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRightIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "~/lib/utils"
import { Slash } from 'lucide-react'

// Type for breadcrumb items
export interface BreadcrumbItem {
  href: string
  label: string | React.ReactNode
  icon?: React.ReactNode
  isCurrent?: boolean
}

// Home link configuration
export interface HomeLink {
  href: string
  label: string | React.ReactNode
  show?: boolean
}

// Separator style options
export type SeparatorStyle = "arrow" | "slash" | "chevron" | Exclude<React.ReactNode, string>

// Server-side function to generate breadcrumb items
export function generateBreadcrumbItems(path: string): BreadcrumbItem[] {
  if (!path) return []

  const paths = path.split('/').filter(Boolean)
  let currentPath = ''

  return paths.map((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === paths.length - 1
    
    return {
      href: currentPath,
      // Format the label: capitalize first letter and replace hyphens with spaces
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      isCurrent: isLast
    }
  })
}

// Function to get the separator based on style
function getSeparator(style: SeparatorStyle): React.ReactNode {
  if (style !== "arrow" && style !== "slash" && style !== "chevron" && React.isValidElement(style)) {
    return style
  }

  switch (style) {
    case "arrow":
      return (
        <div className="h-full flex items-center mx-2">
          <div className="h-full w-6 relative">
            <div className="absolute inset-0 -left-6 flex items-center justify-center">
              <div className="h-6 w-6 rotate-45 transform border-t border-r border-gray-300"></div>
            </div>
          </div>
        </div>
      )
    case "chevron":
      return <ChevronRightIcon className="h-4 w-4" />
    case "slash":
      return (
        <Slash className='mx-2 -rotate-12 text-gray-300' />
      )
    default:
      return <ChevronRightIcon className="h-4 w-4" />
  }
}

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav"> & {
    separator?: SeparatorStyle
    items?: BreadcrumbItem[]
    path?: string
    homeLink?: HomeLink | false
    homeIcon?: React.ReactNode
  }
>(({ separator = "arrow", items, path, homeLink, homeIcon, className, ...props }, ref) => {
  const clientPathname = usePathname()

  // Default home link configuration
  const defaultHomeLink: HomeLink = {
    href: "/",
    label: homeIcon || "Home",
    show: true
  }

  // Determine home link configuration
  const homeLinkConfig = homeLink === false
    ? { href: "", label: "", show: false } as HomeLink
    : { ...defaultHomeLink, ...homeLink }

  // Generate breadcrumb items from provided path, items, or client pathname
  const breadcrumbItems = React.useMemo(() => {
    if (items) return items

    const pathToUse = path || clientPathname || ''
    return generateBreadcrumbItems(pathToUse)
  }, [items, path, clientPathname])

  // Get the separator element based on style
  const separatorElement = React.useMemo(() =>
    getSeparator(separator), [separator]
  )
  
  // Helper function to render breadcrumb content with icon support
  const renderBreadcrumbContent = (item: BreadcrumbItem) => {
    // If label is a React node, return it directly
    if (React.isValidElement(item.label)) {
      return item.label;
    }
    
    // If there's an icon, render both icon and label
    if (item.icon) {
      return (
        <span className="flex items-center gap-1.5">
          {item.icon}
          {item.label && <span>{item.label}</span>}
        </span>
      );
    }
    
    // Otherwise just return the label
    return item.label;
  };

  // Don't render empty breadcrumbs
  if (!breadcrumbItems.length && !homeLinkConfig.show) return null

  return (
    <nav ref={ref} aria-label="breadcrumb" className={className} {...props}>
      <BreadcrumbList>
        {homeLinkConfig.show && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink href={homeLinkConfig.href}>
                {typeof homeLinkConfig.label === 'string' && !homeIcon ? (
                  homeLinkConfig.label
                ) : (
                  <span className="flex items-center gap-1.5">
                    {homeLinkConfig.label}
                  </span>
                )}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {(breadcrumbItems.length > 0) && (
              <BreadcrumbSeparator>{separatorElement}</BreadcrumbSeparator>
            )}
          </>
        )}

        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.href}>
            <BreadcrumbItem>
              {item.isCurrent ? (
                <BreadcrumbPage>
                  {renderBreadcrumbContent(item)}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>
                  {renderBreadcrumbContent(item)}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && (
              <BreadcrumbSeparator>{separatorElement}</BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </nav>
  )
})
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center h-8 break-words text-sm text-muted-foreground",
      className
    )}
    {...props}
  />
))
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center px-1", className)}
    {...props}
  />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean
    href?: string
  }
>(({ asChild, className, href, ...props }, ref) => {
  const Comp = asChild ? Slot : href ? Link : "a"

  return (
    <Comp
      ref={ref}
      className={cn("transition-colors hover:text-foreground", className)}
      href={href || ''}
      {...props}
    />
  )
})
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-normal text-primary", className)}
    {...props}
  />
))
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn(
      "flex items-center h-full mx-0",
      "[&>svg]:h-4 [&>svg]:w-4 [&>svg]:mx-1",
      className
    )}
    {...props}
  >
    {children ?? <ChevronRightIcon className="h-4 w-4" />}
  </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <EllipsisHorizontalIcon className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
)
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis"

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
