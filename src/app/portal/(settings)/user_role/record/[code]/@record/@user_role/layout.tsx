import React, { type ReactNode } from 'react'

type LayoutProps = {
  children?: ReactNode
  params?: any
  user_role?: ReactNode
  category_details?: ReactNode
  [key: string]: ReactNode | undefined
}

const Layout = (props: LayoutProps) => {
  const { user_role, category_details } = props;

  const slots = [user_role, category_details]

  return <div className='space-y-2'>{slots}</div>
}

export default Layout
