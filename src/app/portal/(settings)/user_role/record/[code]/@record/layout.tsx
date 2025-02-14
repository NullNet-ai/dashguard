"use client"
import React from "react";
import { useSearchParams } from "next/navigation";

type LayoutProps = {
  dashboard: React.ReactNode
  user_role: React.ReactNode
  category_details: React.ReactNode
}

export default function Layout(props: LayoutProps) {
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('current_tab') ?? 'dashboard'
  const slot = props[currentTab as keyof LayoutProps]

  if (!slot) {
    return <div>Coming Soon</div>
  }
  return <div>
    {slot}
  </div> 
}