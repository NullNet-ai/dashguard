import React, { type ReactNode } from 'react'

type LayoutProps = {
  children?: ReactNode
  params?: any
  user_role?: ReactNode
  category_details?: ReactNode
  [key: string]: ReactNode | undefined
}

export default function Layout({
  user_role,
  category_details,
}: {
  user_role: React.ReactNode
  category_details: React.ReactNode
}) {
  const slots = [user_role, category_details]

  return <div className='space-y-2'>{slots}</div>
}
