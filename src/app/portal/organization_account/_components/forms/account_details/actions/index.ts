'use server'

import { api } from '~/trpc/server'

export const checkUsernameExist = async ({
  username,
  id,
}: {
  username: string
  id: string
}) => {
  const result = await api.account.checkUsernameExist({ username, id })
  return result
}
