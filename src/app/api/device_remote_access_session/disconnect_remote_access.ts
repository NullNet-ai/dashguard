import axios from 'axios'

export async function disconnectRemoteAccess({ remote_access_session, token, tunnel_type }: { remote_access_session: string, token: string, tunnel_type: string }) {
  let route
  if (tunnel_type === 'ssh') {
    route = 'ssh_session'
  } else if (tunnel_type === 'tty') {
    route = 'tty_session'
  }
  await axios.delete(`${process.env.REMOTE_ACCESS_API_URL}/wallguard/api/v1/${route}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    data: {
      session_id: remote_access_session,
    },
  })  
    .then((response) => {
      return response.data
    })
    .catch((error) => {
      console.error('%c Line:12 🥥 error', 'color:#93c0a4', error)
    })
}
