import axios from 'axios'

export async function disconnectRemoteAccess({ device_id, ra_type, token }: { device_id: string, ra_type: string, token: string }) {
  await axios.delete('http://wallguard.proxy.nullnetqa.net/v1/api/remote_access', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    data: {
      device_id,
      ra_type,
    },
  })  
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      console.log('%c Line:12 🥥 error', 'color:#93c0a4', error)
    })
}
