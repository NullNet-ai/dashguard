'use client'

import Image from 'next/image'

import { useSideDrawer } from '~/components/platform/SideDrawer'
import { Button } from '~/components/ui/button'

import { handleChangeStatus } from '../../_actions'

type RemoteAccessActionButtonProps = {
  identifier: string
  main_entity: string
}

const RemoteAccessActionButton = ({
  identifier,
  main_entity,
}: RemoteAccessActionButtonProps) => {
  const { actions } = useSideDrawer()

  return (
    <Button
      variant="default"
      size="sm"
      className="gap-2 px-4 text-sm mr-2"
      onClick={() =>
        handleChangeStatus('remote_access', identifier, main_entity, undefined, actions)
      }
    >
      <Image
        src="/remote_access.png"
        alt=""
        width={16}
        height={16}
        className="h-4 w-4 brightness-0 invert"
      />
      Remote Access
    </Button>
  )
}

export default RemoteAccessActionButton
