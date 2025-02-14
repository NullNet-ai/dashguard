"use client"
import React from "react";
import { useSearchParams } from "next/navigation";

export default function Layout(props: { current_tab?: React.ReactNode, dashboard?: React.ReactNode }) {
  const searchParams = useSearchParams()
  const slotName = searchParams.get('current_tab') ?? 'dashboard'

  const slot = props[slotName as keyof typeof props]

  if (!slot) {
    return <div>Coming Soon</div>
  }
  return <div>
    {[slot]}
  </div> 
}