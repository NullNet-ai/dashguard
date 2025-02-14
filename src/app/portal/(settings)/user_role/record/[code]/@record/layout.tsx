"use client"
import React from "react";
import { useSearchParams } from "next/navigation";

// TODO: Add type later
export default function Layout(props: any) {
  const searchParams = useSearchParams()
  const slotName = searchParams.get('current_tab') ?? 'dashboard'

  const slot = props[slotName]

  if (!slot) {
    return <div>Coming Soon</div>
  }
  return <div>
    {slot}
  </div> 
}