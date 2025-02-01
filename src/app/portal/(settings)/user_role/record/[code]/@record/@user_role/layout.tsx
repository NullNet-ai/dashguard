import React, { type ReactNode } from 'react'

interface LayoutProps {
  children?: ReactNode
  params?: any
  [key: string]: ReactNode
}

const RecordLayout: React.FC<LayoutProps> = async (props) => {
  const slots = Object.entries(props)
    .filter(([propName]) => !['children', 'params'].includes(propName))
    .map(([componentName, componentValue]) => {
      return (
        <div className="space-y-2" key={componentName}>
          {componentValue}
        </div>
      )
    })

  return slots
}

export default RecordLayout
