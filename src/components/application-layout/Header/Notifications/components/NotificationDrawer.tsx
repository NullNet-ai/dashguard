import { ArrowsUpDownIcon } from '@heroicons/react/24/outline'
import InfiniteScroll from 'react-infinite-scroll-component'

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
    hasMore, // Add this to your state
    loadingPopulateData,
  } = state

  const tabs = [
    {
      id: 'all',
      label: `All`,
      content: <NotificationItem type='all' />,
    },
    {
      id: 'system',
      label: 'System',
      content: <NotificationItem type='system' />,
    },
    {
      id: 'social',
      label: 'Social',
      content: <NotificationItem type='social' />,
    },
  ]

  return (
    <div className='flex h-full flex-1 flex-col p-4 px-0 pt-2'>
      {/* Filter & Actions */}
      <div className='relative flex items-center justify-between'>
        <div className='flex gap-3'>
          <section>
            <Button
              size='icon'
              variant='ghost'
              onClick={actions?.handleDropdownOpen}
            >
              <ArrowsUpDownIcon className='h-5 w-5 text-gray-500' />
            </Button>
          </section>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className='absolute left-0 top-10 z-10 w-48 rounded-md border border-gray-200 bg-white p-2 shadow-lg'>
              <p className='mb-1 px-3 py-1 text-md font-medium text-gray-500'>
                Sort by
              </p>
              {sortOptions.map(option => (
                <button
                  className={`w-full px-3 py-1.5 text-left text-md transition-colors ${
                    selectedSort === option.id
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
              <p className='mb-1 px-3 py-1 text-xs font-medium text-gray-500'>
                Sort order
              </p>
              {sortOrderOptions.map(option => (
                <button
                  className={`w-full px-3 py-1.5 text-left text-md transition-colors ${
                    selectedOrder === option.id
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

        <Button
          className="text-md text-blue-600"
          loading={ loadingPopulateData }
          variant="link"
          onClick={ actions.handleInsert }
        >
          {loadingPopulateData ? '...populating database' : 'Populate Database'}
        </Button>
        <Button
          className='text-md text-blue-600'
          variant='link'
          onClick={actions.handleBatchRead}
        >
          Mark all as read
        </Button>
      </div>
      <StateTab
        persistKey='notifications-tab'
        size='sm'
        tabs={tabs.map(tab => ({
          ...tab,
          content: (
            <div
              className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 flex h-[82vh] flex-col gap-2 overflow-y-auto"
              id="scrollable-div"
            >
              <InfiniteScroll
                className="flex h-full min-h-full flex-col gap-2"
                dataLength={ notifications.length }
                endMessage={(
                  <div className={"py-4 text-center text-sm text-gray-500"}>
                    No more notifications
                  </div>
                )}
                hasMore={ hasMore }
                loader={(
                  <div className={"py-4 text-center"}>
                    Loading more notifications...
                  </div>
                )}
                next={ actions.fetchMoreNotifications }
                scrollableTarget="scrollable-div"
              >
                {tab.content}
              </InfiniteScroll>
            </div>
          ),
        }))}
        variant='shadow'
      />
    </div>
  )
}

export default NotificationDrawer

export function HeaderSection() {
  const { state, actions } = useNotifications()
  const { notificationCount, showRead } = state
  const { toggleUnread } = actions

  return (
    <div className='flex flex-1 items-center justify-around'>
      <h2 className='mr-auto text-lg font-semibold'>
        {"Notifications ("}
        {notificationCount > 99 ? '99+' : notificationCount}
        {")"}
      </h2>
      <div className='mr-2 flex items-center gap-2'>
        <Switch checked={showRead} size='sm' onCheckedChange={toggleUnread} />
        <span className='text-sm text-muted-foreground'>Show unread</span>
      </div>
    </div>
  )
}
