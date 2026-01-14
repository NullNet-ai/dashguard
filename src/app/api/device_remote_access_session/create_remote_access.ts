import axios from 'axios'

export async function createRemoteAccess({ device_id, ra_type, token, instanceId, device_service_id }: { device_id: string, ra_type: string, token: string, instanceId: string, device_service_id?: string }) {
  let params = {
    device_id,
    session_type: ra_type,
    instance_id: instanceId,
  }
  if (ra_type === 'ui') {
    params = {
      ...params,
      // @ts-expect-error - No type yet
      data: {
        service_id: device_service_id
    }
    }
  }
  return axios.post(`${process.env.REMOTE_ACCESS_URL}/wallguard/api/v1/remote_access`, params, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })
}
