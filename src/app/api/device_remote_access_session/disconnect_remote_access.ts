import axios from 'axios'

export async function disconnectRemoteAccess({ device_id, ra_type }: { device_id: string, ra_type: string }) {
  // @ts-expect-error - ignore
  await axios.delete('http://wallguard.proxy.nullnetqa.net/v1/api/remote_access', { device_id, ra_type })
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      console.log('%c Line:12 🥥 error', 'color:#93c0a4', error)
    })
}
