import { EOperator } from '@dna-platform/common-orm'
import { headers } from 'next/headers'

import { EStatus } from '~/server/api/types'
import { api } from '~/trpc/server'

import BasicDetails from './client'

const FormServerFetch = async () => {
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity, application, identifier] = pathname.split('/')
  const [record, roles] = await Promise.all([
    api.account.fetchExternalInternalUserDetails({
      code: identifier!,
    }),
    api.grid.items({
      entity: 'user_role',
      pluck: ['id', 'role'],
      limit: 100,
      advance_filters: [
        {
          type: 'criteria',
          field: 'status',
          operator: EOperator.EQUAL,
          values: [EStatus.ACTIVE],
        },
      ],
    }),
  ])

  const user_roles = roles.items?.map(({ id, role }) => ({
    value: id,
    label: role,
  }))
  
  return (
    <div className='space-y-2'>
      <BasicDetails
        defaultValues={{ ...record?.account, contact_id: record?.contact?.id }}
        params={ {
          id: record?.id!,
          shell_type: application! as 'record' | 'wizard',
          entity: main_entity,
        } }
        selectOptions={ { role_id: user_roles } }
      />
    </div>
  )
}

export default FormServerFetch
