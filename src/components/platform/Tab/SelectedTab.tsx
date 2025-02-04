'use client'

import { usePathname } from 'next/navigation'
import { type IPropsTabList } from './type'

export default function SelectedTab({ tabs }: { tabs: IPropsTabList[] }) {
  const pathname = usePathname()

  return (
    <select
      id="tabs"
      name="tabs"
      defaultValue={
        tabs?.find((tab) => {
          return tab.href === pathname
        })?.name
      }
      className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
    >
      {tabs.map((tab) => (
        <option key={tab.name}>{tab.name}</option>
      ))}
    </select>
  )
}
