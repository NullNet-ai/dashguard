import { headers } from 'next/headers'

import { api } from '~/trpc/server'

import SetupDetails from './client'

const FormServerFetch = async () => {
  const headerList = await headers()
  const pathname = headerList.get('x-pathname') || ''
  const [, , main_entity, application, identifier] = pathname.split('/')
  const getSetupDetails = await api.device.getAccountSetUpDetailsByDeviceCode({
    device_code: identifier!
  })
  
  if(!getSetupDetails.success) {
    throw new Error(getSetupDetails.message)
  }
  
  const defaultValues = {
    id : getSetupDetails.data?.[0]?.devices?.id,
    app_id : getSetupDetails.data?.[0]?.account_organizations?.email,
    app_secret : getSetupDetails.data?.[0]?.account_organizations?.app_secret || "",
    account_id : getSetupDetails.data?.[0]?.account_organizations?.account_id,
  }

  return (
    <SetupDetails
      defaultValues={{...defaultValues}}
      params={{
        id: defaultValues?.id || '',
        shell_type: application! as 'record' | 'wizard',
        entity: main_entity,
      }}
    />
  )
}

export default FormServerFetch
