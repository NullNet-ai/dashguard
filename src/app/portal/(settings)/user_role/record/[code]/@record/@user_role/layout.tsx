import React, { type ReactNode } from 'react'

interface LayoutProps {
  children?: ReactNode
  params?: any
  user_role?: ReactNode
  category_details?: ReactNode
  [key: string]: ReactNode
}

const RecordLayout = (props: LayoutProps) => {
  const { user_role, category_details } = props;

  const slots = [user_role, category_details]

  return <div className='space-y-2'>{slots}</div>
}

export default RecordLayout
