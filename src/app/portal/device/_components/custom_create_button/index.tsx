'use client'

import { PlusIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { createDraftDevice } from '../actions/createDeviceDraft'
import { CredentialsGenerator } from '../actions/credentialGenerator'

const CustomCreateButton = ({
  entity
} : {
  entity: string
}) => {

  const handleCreate = async() => {
    try {


      // GENERATE CREDENTIALS
      const { app_id, app_secret } = CredentialsGenerator.generateAppIdandSecret();

      await createDraftDevice({
        entity,
        app_id,
        app_secret 
      });

    } catch (error) {
      console.error('Failed to create draft record:', error);
    }
  }

  return (
    <div className="flex items-center justify-end">
      <Button 
        iconPlacement={'left'} 
        iconClassName='ms-2' 
        Icon={PlusIcon}
        onClick={handleCreate}
      >
        New
      </Button>
    </div>
  )
}

export default CustomCreateButton