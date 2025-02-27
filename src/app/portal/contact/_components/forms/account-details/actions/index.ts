'use server'

import { api } from '~/trpc/server'

export const checkUsernameExist = async ({
  username,
  id,
  contact_id,
}: {
  username: string
  id?: string
  contact_id?: string
}) => {
  const result = await api.account.checkUsernameExist({ username, id, contact_id })
  return result
}
