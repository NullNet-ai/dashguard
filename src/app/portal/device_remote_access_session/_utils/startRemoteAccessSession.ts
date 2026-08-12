export function openRemoteAccessSession(
  remote_access_session: string,
  remote_access_type: string,
  device_id: string,
) {
  const remote_access = ['ssh', 'tty', 'rd'];

  if (remote_access?.includes(remote_access_type)) {
    const wsUrl = {
      ssh: `wss://${remote_access_session}.${process.env.NEXT_PUBLIC_REMOTE_ACCESS_API_URL?.replace('https://', '')}/wallguard/gateway/ssh`,
      tty: `wss://${remote_access_session}.${process.env.NEXT_PUBLIC_REMOTE_ACCESS_API_URL?.replace('https://', '')}/wallguard/gateway/tty`,
      rd: `ws://${process.env.NEXT_PUBLIC_REMOTE_ACCESS_API_IP?.replace('https://', '')}/wallguard/gateway/rd?tunnel_id=${remote_access_session}`,
    }[remote_access_type];

    const sessionKey = `terminal_session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    // @ts-expect-error - No type yet
    localStorage.setItem(sessionKey, wsUrl);
    localStorage.setItem('current_terminal_session', sessionKey);
    localStorage.setItem('current_terminal_session_type', remote_access_type);
    localStorage.setItem('device_id', device_id);
    localStorage.setItem('reload_previous_tab', 'true');

    if (remote_access_type === 'rd') {
      window.open('/rd', '_blank');
    } else {
      window.open('/terminal', '_blank');
    }
  } else {
    localStorage.setItem('reload_previous_tab', 'true');
    window.open(
      `https://${remote_access_session}.${process.env.NEXT_PUBLIC_REMOTE_ACCESS_URL?.replace('https://', '')}/`,
      '_blank',
    );
  }
}
