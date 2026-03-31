'use client'

import React, { useEffect, useState } from 'react'
import GraphSearchProvider from './Provider'
import SearchList from './SearchList'
import SearchListMobile from './SearchListMobile'
import IPSearch from './IPSearch'
import TimelineRuler from '../network-traffic-visualization/components/TimelineRuler'
import View from './View'
import GridProvider from '~/components/platform/Grid/Provider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { useEventEmitter } from '~/context/EventEmitterProvider'
import { RefreshCw } from 'lucide-react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

// eslint-disable-next-line react/destructuring-assignment
export default function Search({params, filter_type} : {params: any, filter_type: string}) {
  const eventEmitter = useEventEmitter()
  const [sortKey, setSortKey] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [timeCount, setTimeCount] = useState<number | null>(null)
  const [timeUnit, setTimeUnit] = useState<string>('')
  const [hasAnyRows, setHasAnyRows] = useState(false)
  const onChangeSort = (v: string) => {
    if (v === 'none') {
      setSortKey('')
      eventEmitter.emit('timeline_sort_key', '')
      return
    }
    setSortKey(v)
    eventEmitter.emit('timeline_sort_key', v)
  }
  useEffect(() => {
    const onTimeSettings = (payload: { time_count?: number; time_unit?: string }) => {
      setTimeCount(typeof payload?.time_count === 'number' ? payload.time_count : null)
      setTimeUnit(payload?.time_unit ?? '')
    }
    eventEmitter.on('timeline_time_settings', onTimeSettings)
    eventEmitter.emit('timeline_request_time_settings')
    return () => {
      eventEmitter.off('timeline_time_settings', onTimeSettings)
    }
  }, [eventEmitter])
  useEffect(() => {
    const handleLoading = (loading: boolean) => setIsLoading(Boolean(loading))
    const handleHasRows = (hasRows: boolean) => setHasAnyRows(Boolean(hasRows))
    
    eventEmitter.on('timeline_loading', handleLoading)
    eventEmitter.on('timeline_has_rows', handleHasRows)
    
    return () => {
      eventEmitter.off('timeline_loading', handleLoading)
      eventEmitter.off('timeline_has_rows', handleHasRows)
    }
  }, [eventEmitter])
  

  function formatTimeLabel(count: number, unit: string): string {
    if (unit === 'hour')  return `${count} hour${count > 1 ? 's' : ''}`
    if (unit === 'day')   return `${count} day${count > 1 ? 's' : ''}`
    if (unit === 'second') {
      if (count >= 60 && count % 60 === 0) return `${count / 60} minute${count / 60 > 1 ? 's' : ''}`
      return `${count} second${count > 1 ? 's' : ''}`
    }
    return `${count} ${unit}`
  }

  return (
    <GraphSearchProvider params={params} filter_type={filter_type}>
      {/* <div className="flex w-full flex-col justify-start  gap-x-2">
        <div className="relative flex flex-1 flex-row gap-x-2">
          <div className="my-2 h-[40px] w-full md:my-0">
            <View />
          </div>
        </div>
        <div className="hidden min-h-[40px] lg:block">
          <SearchList filter_type={filter_type}/>
        </div>
        <div className="min-h-[40px] lg:hidden">
          <SearchListMobile />
        </div>
      </div> */}
      {(isLoading) && (
        <div className="mb-2 rounded-md border border-amber-200 bg-amber-50 p-3 py-2 text-amber-800">
          <div className="flex items-center gap-2">
            <ArrowPathIcon className="mt-0.5 size-6 text-amber-500 animate-spin" />
            <div>
              <div className="text-sm font-semibold">Discovering active IP addresses</div>
              <div className="text-xs text-amber-700/80">Analyzing network traffic sources...</div>
            </div>
          </div>
        </div>
      )}
        <div className="grid grid-cols-[300px_1fr] items-center">
          <div className="flex items-center gap-2 text-xs pl-1.5 w-full">
            <span className="whitespace-nowrap">Search by:</span>
            <IPSearch />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs pl-1.5 w-full max-w-44">
              <span className="whitespace-nowrap">Sort by:</span>
              <Select value={sortKey} onValueChange={onChangeSort}>
                <SelectTrigger className="h-[34px] w-full text-sm">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className='text-sm'>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="source_ip">Source IP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">Traffic Intensity</span>
              <div className="flex items-end gap-4 py-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-6 rounded-sm bg-[#65A1C7]" />
                      <span className="text-xs text-slate-600">Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-6 rounded-sm bg-[#B4D3ED]" />
                      <span className="text-xs text-slate-600">Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-6 rounded-sm bg-[#3F5F7E]" />
                      <span className="text-xs text-slate-600">High</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-[250px_1fr] items-end border-b-[1px] -mb-[1px]">
        <div className='flex items-center pt-2 pb-4'>
          <p className='text-sm'>
            Traffic Timeline - <span className='font-semibold'>
              Last {timeCount != null ? formatTimeLabel(timeCount, timeUnit) : '—'}
            </span>
          </p>
        </div>
        <div className="flex items-center justify-end">
          <TimelineRuler />
        </div>
      </div>
    </GraphSearchProvider>
  )
}
