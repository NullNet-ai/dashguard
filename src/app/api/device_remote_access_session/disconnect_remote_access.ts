import axios from 'axios'

export async function disconnectRemoteAccess({ remote_access_session, token }: { remote_access_session: string, token: string }) {
  await axios.delete(`${process.env.REMOTE_ACCESS_URL}/wallguard/api/v1/remote_access`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    data: {
      session: remote_access_session,
    },
  })  
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      console.error('%c Line:12 🥥 error', 'color:#93c0a4', error)
    })
}
