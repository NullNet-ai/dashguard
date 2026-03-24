'use client'

import { ChevronDown, Star } from 'lucide-react'
import { Skeleton } from '~/components/ui/skeleton'

type Section = { key: string; label: string; description: string; rows: number }

type Props = {
  sections?: Section[]
}

const defaultSections: Section[] = [
  { 
    key: 'top_traffic', 
    label: 'Top Traffic', 
    description: 'IPs generating the highest traffic within the selected time range',
    rows: 5 
  },
  { 
    key: 'recent_ip',   
    label: 'Recent IP',   
    description: 'Most recently observed IPs regardless of traffic volume',
    rows: 10
  }
]

export default function TrafficSkeleton({ sections = defaultSections }: Props) {
  return (
    <div>
      {sections.map((section, sIdx) => (
        <div key={section.key} className="">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
            <span className="flex items-center gap-2">
              <ChevronDown size={14} className="text-slate-400" /> 
              
              <div className="flex flex-col">
                <span className="flex gap-2">
                  {section.key === 'top_traffic' && <Star size={14} fill="currentColor" className="text-[#EDC17E]" />}{section.label}
                  <span className='font-normal text-slate-600'>(Refresh: --)</span>
                </span>
                <p className="font-light text-slate-600 text-xs">
                  {section.description}
                </p>
              </div>
              </span>
          </div>

          <div className="divide-y divide-slate-100 border-b border-slate-100">
            {Array.from({ length: section.rows }).map((__, rIdx) => (
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