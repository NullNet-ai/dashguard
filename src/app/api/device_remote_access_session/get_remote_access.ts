import axios from 'axios'

export async function getRemoteAccess(body: { device_id: string, ra_type: string, token: string }) {
  const { device_id, ra_type, token } = body

  const data = await axios.get(`http://wallguard.proxy.nullnetqa.net/v1/api/remote_access?device_id=${device_id}&ra_type=${ra_type}`, { headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  } }).then((response) => {
    return response.data
  }
  )
    .catch((error) => {
      console.error('Error:', error)
    })

  return data
}
