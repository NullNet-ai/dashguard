import { ComboboxOption } from '@headlessui/react'
import { useContext } from 'react'

import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'

import { YYYSearchGridContext } from './Provider'
import { type ISearchItemResult } from './types'

export default function SearchResult({
  results,
  closeDialog,
}: {
  results: ISearchItemResult[] | null
  closeDialog?: () => void
}) {
  const { actions } = useContext(YYYSearchGridContext)
  if (!results) return (
    <h2 className="mb-2 mt-4 px-3 text-xs font-semibold text-gray-500">
      {"Searching..."}
    </h2>
  )
  return results?.length > 0
    ? (
        <ul className="text-sm text-gray-700">
        {results?.map(result => (
            <>
            <ComboboxOption
                as="li"
                className="cursor-pointer hover:bg-muted/70 p-2 rounded-md"
                key={result.id}
                value={result}
                onClick={() => {
                  actions?.handleAddSearchItem(result)
                  closeDialog && closeDialog()
                } }
              >
                <div className="mb-2 ml-3">
                <span className="text-sm font-semibold text-muted-foreground">
                    {result.values?.[0]}
                  </span>
              </div>
                <Badge
                className="hover:bg-primary/20"
                key={result.id}
                variant="primary"
              >
                {result?.label}
              </Badge>
              </ComboboxOption>
            {results.length > 1 && <Separator className="m-2" dashed={true} />}
          </>
          ))}
      </ul>
      )
    : (
      //   <h2 className="mb-2 mt-4 px-3 text-xs font-semibold text-gray-500">
      //   {'No Results Found'}
      // </h2>
      <h2 className="mb-2 mt-4 px-3 text-xs font-semibold text-gray-500">
          Searching...
        </h2>
      )
}
