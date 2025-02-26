'use client'

import { X } from 'lucide-react'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'

import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import useWindowSize from '~/hooks/use-resize'
import useScreenType from '~/hooks/use-screen-type'
import { cn, formatAndCapitalize } from '~/lib/utils'

import { SearchGridContext } from './Provider'

const SearchListMobile = ({parentType}: any) => {
  const conref = useRef<any>(null)
  const itemsRef = useRef<any[]>([])
  const { state, actions } = useContext(SearchGridContext)

  const { width } = useWindowSize()
  const screenSize = useScreenType()
  const isMobile = screenSize !== '2xl' && screenSize !== 'xl' && screenSize !== 'lg'

  const { searchItems = [] } = state ?? {}
  const selectedSearchItems = searchItems?.filter(item => !item?.default)
  const defaultSearchItems = selectedSearchItems?.map(item => ({ ...item, hidden: false })).filter(itm => itm.type !== 'operator')

  const [data, setData] = useState<any[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const calc = (items?: any[]) => {
      const allItems: any[] = []
      const newData = items || defaultSearchItems?.filter(item => item.type !== 'operator')
      // clear width, more width, and search by
      const clearWidth = 63 + 61
      let totalWidth = 32 + newData?.length * 2 + 5 + clearWidth
      const containerWidth = conref.current?.offsetWidth || 0

      for (let index = 0; index < newData.length; index++) {
        if (itemsRef.current[index]?.offsetWidth) {
          totalWidth += itemsRef.current[index].offsetWidth || 0
          if (totalWidth > containerWidth) {
            allItems?.push({
              ...newData[index],
              hidden: true,
            })
          }
          else {
            allItems?.push({
              ...newData[index],
              hidden: false,
            })
          }
        }
      }
      return allItems
    }

    const handleResize = () => {
      const items = calc()
      if (JSON.stringify(items) !== JSON.stringify(data) && !open) {
        setData(items)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [defaultSearchItems, open])

  const lastHiddenIndexLeftPos = useMemo(() => {
    const lastIndex = data?.findIndex(item => item.hidden)
    if (lastIndex === -1) {
      return null
    }
    return itemsRef.current[lastIndex - 1]?.offsetLeft + itemsRef.current[lastIndex - 1]?.offsetWidth + 5
  }, [data, defaultSearchItems, itemsRef.current])

  return (
    <div
      className="mobile-container-ref flex  flex-col  gap-2 md:flex-row overflow-hidden relative"
      ref={conref}
      style={{ width: isMobile ? parentType==='record' ? '100%' :  width - (screenSize === 'md' ? 120 : 16) : 'auto' }}
    >
      <div className="flex flex-row items-center">
        <span
          className={cn(
            `whitespace-nowrap text-xs text-black`, `${selectedSearchItems.length ? '' : 'mt-[12px]'}`,
          )}
        >
          Search By:
          {' '}
        </span>
        {defaultSearchItems.length
          ? (
              <div className="flex flex-nowrap py-1 ">
                {defaultSearchItems?.map((item, index) => {
                  const isHidden = data?.[index]?.hidden
                  return (
                    <Badge
                      className={cn(`item-ref m-1 flex items-center gap-1 whitespace-nowrap`, { 'opacity-0': isHidden },)}
                      key={item.id}
                      ref={(el) => {
                        if (el) {
                          itemsRef.current[index] = el
                        }
                      }}
                      variant="secondary"
                    >
                      {item.type === 'criteria'
                        ? `${item?.label || formatAndCapitalize(item?.field ?? '')} is "${item?.display_value ? item?.display_value : item?.values?.[0]}"`
                        : item?.operator}
                      {item.type === 'criteria' && !item.default && (
                        <Button
                          className="h-auto w-auto text-nowrap p-0 text-default/40 hover:bg-transparent focus:outline-none"
                          key={`${item.id}-remove`}
                          name="removeSortingButton"
                          size="xs"
                          variant="ghost"
                          onClick={() => {
                            if (isHidden) return
                            actions?.handleRemoveSearchItem(item)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>
                  )
                })}
                {data?.length && data.some(item => item.hidden) && (
                  <div
                    className="py-1 absolute max-w-[63px]"
                    style={{
                      left: lastHiddenIndexLeftPos,
                    }}
                  >
                    <DropdownMenu
                      open={open}
                      onOpenChange={(isOpen) => {
                        setOpen(isOpen)
                      }}
                    >
                      <DropdownMenuTrigger
                        asChild={true}
                        onClick={() => {
                          setOpen(!open)
                        }}
                      >
                        <Button
                          className="h-[24px] w-auto text-nowrap bg-muted px-2 text-default/70 hover:bg-transparent focus:outline-none"
                          name="removeSortingButton"
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            //
                          }}
                        >
                          More (
                          {data.filter(d => d.hidden)?.length}
                          )
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" side="bottom">
                        <div className="flex flex-col gap-1 gap-y-2 py-1">
                          {data?.map((item, index) => {
                            if (!item.hidden || item.type === 'operator' || index === 0) {
                              return null
                            }
                            return (
                              <Badge
                                className="flex items-center gap-1 whitespace-nowrap self-start"
                                key={item.id}
                                ref={(el: any) => (itemsRef.current[index] = el)}
                                variant="secondary"
                              >
                                {item.type === 'criteria'
                                  ? `${item?.label || formatAndCapitalize(item?.field ?? '')} is "${item?.display_value ? item?.display_value : item?.values?.[0]}"`
                                  : item?.operator}
                                {item.type === 'criteria' && !item.default && (
                                  <Button
                                    className="h-auto w-auto text-nowrap p-0 text-default/40 hover:bg-transparent focus:outline-none"
                                    key={`${item.id}-remove`}
                                    name="removeSortingButton"
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => {
                                      actions?.handleRemoveSearchItem(item)
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </Badge>
                            )
                          })}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) }

                <Button
                  className={cn(
                    `h-[30px] text-default/60 underline hover:no-underline`, `${
                      data?.length && data.some(item => item.hidden)
                        ? 'absolute mt-[2px]'
                        : ''
                    }`
                  )}
                  name="resetSortButton"
                  style={{
                    left: lastHiddenIndexLeftPos
                      ? lastHiddenIndexLeftPos + 63
                      : 0,
                  }}
                  variant="link"
                  onClick={() => {
                    actions?.handleClearSearchItems()
                  }}
                >
                  Clear All
                </Button>
              </div>
            )
          : null}
      </div>
    </div>
  )
}

export default SearchListMobile
