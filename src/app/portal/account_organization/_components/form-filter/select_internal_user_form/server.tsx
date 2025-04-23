import { headers } from 'next/headers'

import { api } from '~/trpc/server'

import FormBuilderPage from './builder'
import BasicDetails from './client'

const FormServerFetch = async () => {
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const contact_pluck_fields = [
    'id',
    'code',
    'categories',
    'organization_id',
    'first_name',
    'middle_name',
    'last_name',
    // 'contact_status',
    'status',
    'created_date',
    'updated_date',
    'created_time',
    'updated_time',
    'created_by',
    'updated_by',
  ]
  const [, , main_entity, application, identifier] = pathname.split('/')
  const record = await api.account.fetchExternalInternalUserDetails({
    code: identifier!,
  })

  if (record?.categories?.[0] !== 'Internal User') return null

  const defaultValues = record?.contact_id
    ? {
        first_name: record?.contact?.first_name,
        last_name: record?.contact?.last_name,
        email: [record?.email],
        phone: [record?.phoneNumber],
      }
    : null
  const contact_id = record?.contact?.id

  return (
    <div className='space-y-2'>
      <BasicDetails
        defaultValues={defaultValues}
        params={{
          id: record?.id!,
          shell_type: application! as 'record' | 'wizard',
          entity: main_entity,
          pluck_fields: contact_pluck_fields,
        }}
        selectedRecords={contact_id ? [defaultValues] : []}
      />
    </div>
  )
}

export default FormServerFetch
