import React, { type ReactNode } from 'react'

type LayoutProps = {
  children?: ReactNode
  params?: any
  device_group?: ReactNode
  category_details?: ReactNode
  [key: string]: ReactNode | undefined
}

export const dynamic = 'force-dynamic'

export default function Layout(props: {
  device_group: React.ReactNode
  category_details: React.ReactNode
}) {
  return (
    <div className='space-y-2'>
      {props.device_group}
      {props.category_details}
    </div>
  )
}
