import axios from 'axios'

export async function createRemoteAccessSession({ device_id, ra_type, token, instanceId, tunnel_id }: { device_id: string, ra_type: string, token: string, instanceId: string, tunnel_id?: string }) {
  const params = {
    device_id,
    instance_id: instanceId,
    tunnel_id,
    username: 'root'
  }
  let route
  if (ra_type === 'ssh') {
    route = 'ssh_session'
  } else if (ra_type === 'tty') {
    route = 'tty_session'
  }
  return axios.post(`${process.env.REMOTE_ACCESS_API_URL}/wallguard/api/v1/${route}`, params, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })
}

export async function createRemoteAccessTunnel({ device_id, token, device_service_id }: { device_id: string, token: string, device_service_id?: string }) {
  const params = {
    device_id,
    service_id: device_service_id
  }
  return axios.post(`${process.env.REMOTE_ACCESS_API_URL}/wallguard/api/v1/tunnel`, params, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })
}