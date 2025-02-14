"use client"
import React from "react";
import { useSearchParams } from "next/navigation";

export default function Layout(props: {
  dashboard: React.ReactNode
  user_role: React.ReactNode
  category_details: React.ReactNode
  [key: string]: React.ReactNode
}) {
  const searchParams = useSearchParams()
  const slot = props[searchParams.get('current_tab') ?? 'dashboard']

  if (!slot) {
    return <div>Coming Soon</div>
  }
  return <div>
    {slot}
  </div> 
}