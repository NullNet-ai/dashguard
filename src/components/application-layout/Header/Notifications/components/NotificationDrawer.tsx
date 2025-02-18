import { ArrowsUpDownIcon } from '@heroicons/react/24/outline'

import StateTab from '~/components/platform/StateTab'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'

import { useNotifications } from '../NotificationProvider'

import NotificationItem from './NotificationItem'

const sortOptions = [
  { id: 'timestamp', label: 'Date' },
  { id: 'priority_level', label: 'Priority' },
  { id: 'source', label: 'source' },
]

const sortOrderOptions = [
  { id: 'asc', label: 'Ascending (A to Z)' },
  { id: 'desc', label: 'Descending (Z to A)' },
]

const NotificationDrawer = () => {
  const { state, actions } = useNotifications()
  const {
    notifications,
    isDropdownOpen,
    selectedSort,
    selectedOrder,
  } = state

  // archive tab will only show if there is one archive on notifications
  const archiveTab
    = notifications?.filter((n: any) => n.category === 'archive').length > 0
  const tabs = [
    {
      id: 'all',
      label: `All`,
      content: <NotificationItem type="all" />,
    },
    {
      id: 'system',
      label: 'System',
      content: <NotificationItem type="system" />,
    },
    {
      id: 'social',
      label: 'Social',
      content: <NotificationItem type="social" />,
    },
    ...(!archiveTab
      ? [
        {
          id: 'archive',
          label: 'Archive',
          content: <NotificationItem type="archive" />,
        },
      ]
      : []),
  ]

  return (
    <div className='flex h-full flex-col p-4 pt-2 px-2 flex-1'>
      {/* Filter & Actions */}
      <div className='relative flex items-center justify-between'>
        <div className='flex gap-3'>
          <Button
            size="icon"
            variant="ghost"
            onClick={actions?.handleDropdownOpen}
          >
            <ArrowsUpDownIcon className='h-5 w-5 text-gray-500' />
          </Button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className='absolute left-0 top-10 z-10 w-48 rounded-md border border-gray-200 bg-white p-2 shadow-lg'>
              <p className='mb-1 px-3 py-1 text-md font-medium text-gray-500'>Sort by</p>
              {sortOptions.map(option => (
                <button
                  className={`w-full px-3 py-1.5 text-left text-md transition-colors ${selectedSort === option.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  key={option.id}
                  onClick={() => actions?.handleSortChange(option.id)}
                >
                  {option.label}
                </button>
              ))}
              <div className='my-2 border-t border-gray-200' />
              <p className='mb-1 px-3 py-1 text-xs font-medium text-gray-500'>Sort order</p>
              {sortOrderOptions.map(option => (
                <button
                  className={`w-full px-3 py-1.5 text-left text-md transition-colors ${selectedOrder === option.id
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  key={option.id}
                  onClick={() => actions?.handleSortOrderChange(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {!notifications?.length && (
          <Button
            className="text-sm text-blue-600"
            variant="link"
            onClick={actions.handleInsert}
          >
            Populate Database
          </Button>
        )}
        <Button
          className="text-md text-blue-600"
          variant="link"
          onClick={actions.handleBatchRead}
        >
          Mark all as read
        </Button>
      </div>
      <StateTab
        persistKey="notifications-tab"
        size="sm"
        tabs={tabs}
        variant="default"
      />
    </div>
  )
}

export default NotificationDrawer


export function HeaderSection() {
  const { state, actions } = useNotifications()
  const { notificationCount, showRead } = state;
  const { toggleUnread } = actions;

  return (
    <div className='flex items-center justify-around flex-1'>
      <h2 className='text-lg font-semibold mr-auto'>
        Notifications ({notificationCount})
      </h2>
      <div className='flex items-center gap-2 mr-2'>
        <span className='text-sm text-muted-foreground'>Show read</span>
        <Switch checked={showRead} onCheckedChange={toggleUnread} />
      </div>
    </div>
  )

}