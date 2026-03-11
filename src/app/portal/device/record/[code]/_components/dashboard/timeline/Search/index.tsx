'use client'

import React, { useState } from 'react'
import GraphSearchProvider from './Provider'
import SearchList from './SearchList'
import SearchListMobile from './SearchListMobile'
import IPSearch from './IPSearch'
import TimelineRuler from './TimelineRuler'
import View from './View'
import GridProvider from '~/components/platform/Grid/Provider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { useEventEmitter } from '~/context/EventEmitterProvider'

// eslint-disable-next-line react/destructuring-assignment
export default function Search({params, filter_type} : {params: any, filter_type: string}) {
  const eventEmitter = useEventEmitter()
  const [sortKey, setSortKey] = useState<string>('')
  const onChangeSort = (v: string) => {
    setSortKey(v)
    eventEmitter.emit('timeline_sort_key', v)
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

      <div className="grid grid-cols-[250px_1fr]">
        <div className="border-r border-slate-100">
          <IPSearch />
        </div>
        <div className="divide-y divide-slate-200">
          <div className="flex items-center justify-between w-full gap-4 px-5 py-2.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600">Sort by:</span>
              <Select value={sortKey} onValueChange={onChangeSort}>
                <SelectTrigger className="h-7 w-[140px]">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="source_ip">Source IP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-md font-medium text-slate-600">Traffic Intensity</span>
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

          <div className="px-0 pt-7"><TimelineRuler /></div>
        </div>
      </div>
    </GraphSearchProvider>
  )
}
