'use client'

import { AttachAddon } from '@xterm/addon-attach'
import { FitAddon } from '@xterm/addon-fit'
import { useEffect, useState } from 'react'
import { useXTerm } from 'react-xtermjs'
import { isHeartbeatWithinSeconds } from '~/app/portal/device/utils/getHeartbeat'
import { api } from '~/trpc/react'

export default function WebTerminal() {
  const { instance, ref } = useXTerm()
  const fitAddon = new FitAddon()
  const [socket, setSocket] = useState<WebSocket | null>(null) // Track WebSocket instance
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [isConnectionClosed, setIsConnectionClosed] = useState(false) // Track WebSocket connection status
  const [connectionEndReason, setConnectionEndReason] = useState<'unexpected_end' | 'session_expired' | null>(null)
  const [deviceId, setDeviceId] = useState('')
  const [terminalSessionType, setTerminalSessionType] = useState<'ssh' | 'tty' | null>(null)
  const [terminalSessionToken, setTerminalSessionToken] = useState('')
  const createUpdate = api.deviceRemoteAccessSession.createUpdateDeviceRemoteAccessSessions.useMutation()

  useEffect(() => {
    setDeviceId(localStorage.getItem('device_id') || '')

    const currentSessionKey = localStorage.getItem('current_terminal_session')
    if (!currentSessionKey) {
      setTerminalSessionType(null)
      setTerminalSessionToken('')
      return
    }
    const websocketUrl = localStorage.getItem(currentSessionKey)
    if (!websocketUrl) {
      setTerminalSessionType(null)
      setTerminalSessionToken('')
      return
    }
    try {
      const url = new URL(websocketUrl)
      const sessionToken = url.hostname.split('.')[0] || ''
      setTerminalSessionToken(sessionToken.toUpperCase())

      const storedSessionType = localStorage.getItem('current_terminal_session_type')
      if (storedSessionType === 'ssh' || storedSessionType === 'tty') {
        setTerminalSessionType(storedSessionType)
      } else if (url.pathname.includes('/ssh')) {
        setTerminalSessionType('ssh')
      } else if (url.pathname.includes('/tty')) {
        setTerminalSessionType('tty')
      } else {
        setTerminalSessionType(null)
      }
    } catch {
      setTerminalSessionToken('')
      setTerminalSessionType(null)
    }
  }, [])

  const { data: lastHeartbeat, isLoading: isLastHeartbeatLoading } =
    api.deviceHeartbeat.getLastHeartbeat.useQuery(
      { device_id: deviceId },
      { enabled: Boolean(deviceId), refetchInterval: 1000 },
    )

  const remoteAccessSessionQueryInput =
    terminalSessionType && terminalSessionToken
      ? {
          remote_access_type: terminalSessionType,
          remote_access_session: terminalSessionToken,
        }
      : {
          remote_access_type: 'ssh' as const,
          remote_access_session: '',
        }

  const { data: remoteAccessSessionStatus } =
    api.deviceRemoteAccessSession.getRemoteAccessSessionStatus.useQuery(
      remoteAccessSessionQueryInput,
      {
        enabled: Boolean(terminalSessionType && terminalSessionToken && connectionEndReason !== 'session_expired'),
        refetchInterval: (query) => {
          const status = String((query.state.data as any)?.session_status || '').toLowerCase()
          if (status === 'terminated' || status === 'expired') return false
          return 2000
        },
      },
    )

  const handleReconnect = async () => {
    setIsConnectionClosed(false)
    setConnectionEndReason(null)
    setIsReconnecting(true)
    initializeWebSocket()
    return
    setIsReconnecting(true)

    const remote_access_type = localStorage.getItem('current_terminal_session_type')

    const res = await createUpdate.mutateAsync({
      device_id: deviceId || '',
      // @ts-expect-error - No type yet
      remote_access_type,
      // @ts-expect-error - No type yet
      category: remote_access_type
    })
    if (res.success) {

      const { remote_access_session } = res?.data[0] as Record<string, any>

      const wsUrl = {
          ssh: `wss://${remote_access_session}.${process.env.NEXT_PUBLIC_REMOTE_ACCESS_URL?.replace('https://', '')}/wallguard/gateway/ssh`,
          tty: `wss://${remote_access_session}.${process.env.NEXT_PUBLIC_REMOTE_ACCESS_URL?.replace('https://', '')}/wallguard/gateway/tty`,
          // @ts-expect-error - No type yet
        }[remote_access_type]
      
      setIsConnectionClosed(false) // Reset connection status
      setIsReconnecting(false)
      initializeWebSocket(wsUrl) // Reinitialize the WebSocket connection
    }
  }

  const initializeWebSocket = (wsUrl?: string) => {
    const currentSessionKey = localStorage.getItem('current_terminal_session')
    if (!currentSessionKey && !wsUrl) {
      console.error('No active terminal session found')
      instance?.write('\x1b[31mError: No active terminal session found\x1b[0m\r\n')
      return
    }

    // @ts-expect-error - No type yet
    const websocketUrl = localStorage.getItem(currentSessionKey)
    if (!websocketUrl && !wsUrl) {
      console.error('WebSocket URL not found')
      instance?.write('\x1b[31mError: Terminal session not found or expired\x1b[0m\r\n')
      return
    }

    try {
      socket?.close()
      // @ts-expect-error - No type yet
      const newSocket = new WebSocket(websocketUrl || wsUrl)

      newSocket.onopen = () => {
        instance?.write('\x1b[32mConnected to terminal server\x1b[0m\r\n')
        setIsConnectionClosed(false) // Reset connection status when connected
        setConnectionEndReason(null)
        setIsReconnecting(false)
      }

      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error)
        instance?.write('\x1b[31mYour session has expired. Please start a new session to keep going.\x1b[0m\r\n')
        setConnectionEndReason('session_expired')
        setIsConnectionClosed(true)
        setIsReconnecting(false)
      }

      newSocket.onclose = () => {
        instance?.write('\x1b[33mConnection closed\x1b[0m\r\n')
        setIsConnectionClosed(true) // Set connection status to closed dynamically
        setConnectionEndReason((prev) => (prev === 'session_expired' ? prev : 'unexpected_end'))
        setIsReconnecting(false)
        // localStorage.removeItem('current_terminal_session')
      }

      const addon = new AttachAddon(newSocket)
      instance?.loadAddon(addon)

      setSocket(newSocket) // Update the WebSocket instance in state
    } catch (error: any) {
      console.error('Error connecting to WebSocket:', error)
      instance?.write(`\x1b[31mError: ${error.message}\x1b[0m\r\n`)
      setIsReconnecting(false)
    }
  }

  useEffect(() => {
    if (!instance) return

    initializeWebSocket()

    return () => {
      // Close the WebSocket connection when the component unmounts
      socket?.close()
    }
  }, [instance])

  useEffect(() => {
    // Load the fit addon
    instance?.loadAddon(fitAddon)

    const handleResize = () => fitAddon.fit()

    // Fit terminal when component mounts
    if (ref.current) {
      handleResize()
    }

    // Handle resize event
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [ref, instance])

  
  const lastHeartbeatTimestamp = lastHeartbeat?.data?.[0]?.bucket
  // const isDeviceOfflineOrMissing =
  //   Boolean(deviceId) &&
  //   !isLastHeartbeatLoading &&
  //   !isHeartbeatWithinSeconds(lastHeartbeatTimestamp, 60)
  const isDeviceOfflineOrMissing = false

  const isSessionTerminated =
    String(remoteAccessSessionStatus?.session_status || '').toLowerCase() === 'terminated'

  const shouldShowPopup = isSessionTerminated || isConnectionClosed || isDeviceOfflineOrMissing
  const shouldShowReconnectButton = !isSessionTerminated && connectionEndReason !== 'session_expired'
  const popupMessage =
    isSessionTerminated
      ? 'Your session has terminated. Please start a new session to keep going.'
      : connectionEndReason === 'session_expired'
      ? 'Your session has expired. Please start a new session to keep going.'
      : isDeviceOfflineOrMissing
        ? 'The connection was closed. Please restart pfSense or the WallGuard agent, then try connecting again.'
        : 'The connection ended unexpectedly. Please reconnect to continue.'

  useEffect(() => {
    if (!shouldShowPopup) return
    // localStorage.removeItem('device_id')
  }, [shouldShowPopup])

  // Render the terminal if the session is active
  return (
    <div className="relative h-screen w-screen">
      <div ref={ref as React.RefObject<HTMLDivElement>} style={{ width: '100%', height: '100%' }} />
      {shouldShowPopup ? (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-800/95">
          <p className="text-white text-lg mb-4">
            {popupMessage}
          </p>
          {shouldShowReconnectButton ? (
            <button
              onClick={handleReconnect}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={isReconnecting}
            >
              {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
