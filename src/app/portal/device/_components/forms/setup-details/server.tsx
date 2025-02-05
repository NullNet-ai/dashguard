import { cookies, headers } from 'next/headers'

import { decrypt } from '~/server/api/encryptAndDecryptAccountSecret'
import { api } from '~/trpc/server'

import SetupDetails from './client'

const FormServerFetch = async () => {
  const headerList = headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity, application, identifier] = pathname.split('/')
  const fetched_device = await api.record.getByCode({
    main_entity: main_entity!,
    id: identifier!,
    pluck_fields: ['id', 'code'],
  })
  const cookieStore = cookies()
  const token = cookieStore.get(`encrypted_token_${fetched_device?.data?.id}`) || {} as { value: string }

  const decryptedToken = decrypt(token?.value)
  const defaultValues = { ...fetched_device?.data, account_secret: decryptedToken }

  return (
      <SetupDetails
        defaultValues={defaultValues || {}}
        params={{
          id: defaultValues?.id! ?? '',
          shell_type: application! as 'record' | 'wizard',
          entity: main_entity,
        }}
      />
  )
}

export default FormServerFetch
