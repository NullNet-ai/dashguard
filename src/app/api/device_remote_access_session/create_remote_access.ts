import axios from 'axios'

export async function createRemoteAccess({ device_id, ra_type, token }: { device_id: string, ra_type: string, token: string }) {
  await axios.post(`${process.env.REMOTE_ACCESS_URL}/v1/api/remote_access`, { device_id, ra_type }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      console.log('%c Line:12 🥥 error', 'color:#93c0a4', error)
    })
}
