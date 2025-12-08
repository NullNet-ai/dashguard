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
    api.record.getByCode({
      main_entity: main_entity!,
      id: identifier!,
      pluck_fields: ['id', 'code', 'role_id', 'email', 'categories'],
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

  if (record?.data?.categories?.[0] !== 'External User') return null

  const defaultValues = {
    id: record?.data?.id,
    role: record?.data?.role_id,
    email: [{ email: record?.data?.email }],
  }
  const user_roles = roles.items?.map(({ id, role }) => ({
    value: id,
    label: role,
  }))
  return (
    <div className='space-y-2'>
      <BasicDetails
        defaultValues={ defaultValues ?? {} }
        params={ {
          id: record?.data?.id!,
          shell_type: application! as 'record' | 'wizard',
          entity: main_entity,
        } }
        selectOptions={ { role: user_roles } }
      />
    </div>
  )
}

export default FormServerFetch
