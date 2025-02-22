'use client'
import { useMemo } from 'react'

import { Badge } from '~/components/ui/badge'
import { Separator } from '~/components/ui/separator'
import StatusCell from '~/components/ui/status-cell'
import { cn } from '~/lib/utils'
import { api } from '~/trpc/react'
import { formatPhoneNumber } from '~/utils/formatter'

import useRefetchRecord from '../hooks/useFetchMainRecord'

const statuses = {
  'Active': 'text-green-600 bg-green-400/10',
  'Invited': 'text-yellow-600 bg-yellow-400/10',
  'Pending Setup': 'text-yellow-500 bg-yellow-400/10',
  'Invitation Canceled': 'text-red-600 bg-red-400/10',
  'Invitation Expired': 'text-orange-600 bg-orange-400/10',
  'Access Disabled': 'text-red-600 bg-red-400/10',
  'Deactivated': 'text-gray-600 bg-gray-400/10',
}

const RecordShellSummary = ({
  identifier,
}: {
  form_key: string
  identifier: string
  main_entity: string
}) => {
  const {
    data: record = { data: { id: null } },
    refetch,
    error: _error,
  } = api.account.fetchExternalInternalUserDetails.useQuery({
    code: identifier!,
  })

  return (
    <div>
      <div className='p-1 px-5 text-sm'>
        <div>
          <span className='text-slate-400'>Category:</span>
          <div className='inline-flex gap-2 p-1'>
            <Badge
              className=""
              key={ record?.categories?.[0] }
              variant={"primary"}
            >
              {record?.categories?.[0]}
            </Badge>
          </div>
        </div>
      </div>
      <Separator />
      <div className='p-1 px-5'>
        <span className='text-sm font-semibold text-foreground'>
          Account Details
        </span>
      </div>
      <div className='p-1 px-5 text-sm'>
        <div>
          <span className='text-slate-400'>{'Role: '}</span>
          <span>{record?.role || 'None'}</span>
        </div>
      </div>
      <div className='p-1 px-5 text-sm'>
        <div>
          <span className='text-slate-400'>
            {record?.categories?.[0] === 'Internal User'
              ? 'Username: '
              : 'Email: '}
          </span>
          <span>
            {record?.categories?.[0] === 'Internal User'
              ? record?.account_id
              : record?.contact?.email || record?.account_email || 'None'}
          </span>
        </div>
      </div>
      {record?.contact?.first_name
      && record?.categories?.[0] === 'External User' && (
        <div className='p-1 px-5 text-sm'>
          <div>
            <span className='text-slate-400'>{'First Name: '}</span>
            <span>{record?.account_email || 'None'}</span>
          </div>
        </div>
      )}
      {record?.contact?.last_name
      && record?.categories?.[0] === 'External User' && (
        <div className='p-1 px-5 text-sm'>
          <div>
            <span className='text-slate-400'>{'Last Name: '}</span>
            <span>{record?.account_email || 'None'}</span>
          </div>
        </div>
      )}
      <div className='mb-2 p-1 px-5 text-sm'>
        <div>
          <span className='text-slate-400'>{'Status: '}</span>
          <div
            className={cn(
              'bg-primary/10 text-primary',
              // @ts-expect-error - TS doesn't know about statuses
              statuses?.[record?.account_status], 'inline-flex items-center rounded-md px-2 py-1 text-xs font-normal',
            )}
          >
            {record?.account_status || 'None'}
          </div>
        </div>
      </div>
      {record?.categories?.[0] === 'Internal User' && (
        <>
          <Separator />
          <div className='p-1 px-5'>
            <span className='text-sm font-semibold text-foreground'>
              Contact Details
            </span>
          </div>
          <div className='p-1 px-5 text-sm'>
            <div>
              <span className='text-slate-400'>{'Primary Phone Number: '}</span>
              <span>{record?.contact?.phone || 'None'}</span>
            </div>
          </div>
          <div className='p-1 px-5 text-sm'>
            <div>
              <span className='text-slate-400'>{'Primary Email: '}</span>
              <span>
                {record?.contact?.email || record?.account_email || 'None'}
              </span>
            </div>
          </div>
          <div className='p-1 px-5 text-sm'>
            <div>
              <span className='text-slate-400'>{'First Name: '}</span>
              <span>{record?.contact?.first_name || 'None'}</span>
            </div>
          </div>
          <div className='p-1 px-5 text-sm'>
            <div>
              <span className='text-slate-400'>{'Last Name: '}</span>
              <span>{record?.contact?.last_name || 'None'}</span>
            </div>
          </div>
          <div className='p-1 px-5 text-sm'>
            <div>
              <span className='text-slate-400'>{'Middle Name: '}</span>
              <span>{record?.contact?.middle_name || 'None'}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default RecordShellSummary
