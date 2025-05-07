'use server'

import { api } from '~/trpc/server'

export const updateAccountStatus = async (data: any) => {
  try {
    console.info("🔍 ~  ~ src/app/portal/device/wizard/[code]/_actions/index.ts:5 ~ data:", {
      data,
      params : {
        device_id: data.identifier,
      }
    })
    const result = await api.device.activateDevice({
      device_id: data.identifier,
    })
    return result
  }
  catch (error) {
    throw error
  }
}