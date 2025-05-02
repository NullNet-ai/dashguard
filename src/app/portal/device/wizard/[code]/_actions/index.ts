'use server'

import { api } from '~/trpc/server'

export const updateAccountStatus = async (data: any) => {
  try {
    const result = await api.device.activateDevice({
      device_id: data.identifier,
    })
    return result
  }
  catch (error) {
    throw error
  }
}