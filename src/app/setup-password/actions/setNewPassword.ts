'use server'

import LoginSubmit from '~/app/login/_actions/loginSubmit'
import { api } from '~/trpc/server'

export const setNewPassword = async ({
  id,
  account_secret,
}: {
  id: string
  account_secret: string
}) => {
  // update password and is_new_user to false
  const newPasswordRequestResponse = await api.auth.setNewPassword({
    id,
    account_secret,
  })
  if (
    newPasswordRequestResponse
    && 'statusCode' in newPasswordRequestResponse
    && newPasswordRequestResponse.statusCode !== 200
  ) {
    return JSON.parse(JSON.stringify(newPasswordRequestResponse))
  }

  const newAccountCredentials = await api.auth.fetchAccountDataById({
    id,
    pluck_fields: ['account_id'],
  })

  await LoginSubmit({
    username: newAccountCredentials?.account_id,
    password: account_secret,
  })
}
