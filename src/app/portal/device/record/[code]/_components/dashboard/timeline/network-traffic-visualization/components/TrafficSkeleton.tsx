'use client'

import { ChevronDown } from 'lucide-react'
import { Skeleton } from '~/components/ui/skeleton'

type Section = { label: string; rows: number }

type Props = {
  sections?: Section[]
}

const defaultSections: Section[] = [
  { label: 'Top Traffic', rows: 3 },
  { label: 'Recent IPs', rows: 5 },
]

export default function TrafficSkeleton({ sections = defaultSections }: Props) {
  return (
    <div>
      {sections.map(({ label, rows }, sIdx) => (
        <div key={sIdx} className="">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
            <span className="flex items-center gap-2"><ChevronDown size={14} /> {label}</span>
          </div>

          <div className="divide-y divide-slate-100 border-b border-slate-100">
            {Array.from({ length: rows }).map((__, rIdx) => (
              <div key={rIdx} className="grid gap-x-8 px-3 " style={{ gridTemplateColumns: '238px repeat(3, minmax(0, 1fr))' }}>
                <div className="flex items-center gap-2 border-r border-slate-100 py-[2px]">
                  <Skeleton className="h-4 w-8 rounded bg-slate-200" />
                  <Skeleton className="h-4 w-40 bg-slate-200" />
                </div>
                <div className="flex items-center py-[2px]">
                  <Skeleton className="h-4 w-48 bg-slate-200" />
                </div>
                <div className="flex items-center py-[2px]">
                  <Skeleton className="h-4 w-48 bg-slate-200" />
                </div>
                <div className="flex items-center py-[2px]">
                  <Skeleton className="h-4 w-48 bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center px-3 py-2">
            <span className="text-xs text-muted-foreground/70">Loading data...</span>
          </div>
        </div>
      ))}
    </div>
  )
}