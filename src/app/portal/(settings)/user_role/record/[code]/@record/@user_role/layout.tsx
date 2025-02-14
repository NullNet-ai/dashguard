import React, { type ReactNode } from 'react'

type LayoutProps = {
  children?: ReactNode
  params?: any
  user_role?: ReactNode
  category_details?: ReactNode
  [key: string]: ReactNode | undefined
}

export default function Layout(props: {
  user_role: React.ReactNode
  category_details: React.ReactNode
}) {
  return (
    <div className='space-y-2'>
      {props.user_role}
      {props.category_details}
    </div>
  )
}
