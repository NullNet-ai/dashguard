import { headers } from 'next/headers'
import { Breadcrumb, type BreadcrumbItem } from './breadcrumb'

// Re-implement the generateBreadcrumbItems function for server component
function generateBreadcrumbItemsServer(path: string): BreadcrumbItem[] {
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

interface ServerBreadcrumbProps {
  className?: string
  separator?: React.ReactNode
  items?: BreadcrumbItem[]
  customPath?: string
}

export function ServerBreadcrumb({ 
  className, 
  separator, 
  items,
  customPath
}: ServerBreadcrumbProps) {
  // Get the current path from headers
  const headersList = headers()
  const path = customPath || headersList.get('x-pathname') || ''
  
  // Generate breadcrumb items on the server
  const breadcrumbItems = items || generateBreadcrumbItemsServer(path)
  
  return (
    <Breadcrumb 
      className={className}
      separator={separator}
      items={breadcrumbItems}
    />
  )
}