'use client'

import { AttachAddon } from '@xterm/addon-attach'
import { useEffect, useState } from 'react'
import { useXTerm } from 'react-xtermjs'
import { api } from '~/trpc/react'

export default function WebTerminal() {
  const { instance, ref } = useXTerm()
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [isConnectionClosed, setIsConnectionClosed] = useState(false) // Track WebSocket connection status
  const createUpdate = api.deviceRemoteAccessSession.createUpdateDeviceRemoteAccessSessions.useMutation()

  const device_id = localStorage.getItem('device_id')

  const { data: devices, refetch } = api.deviceRemoteAccessSession.fetchDevices.useQuery({
    limit: 100,
    device_id: device_id || ""
  })

  const handleReconnect = async () => {
    const res = await createUpdate.mutateAsync({
      device_id: device_id || '',
      remote_access_type: 'Shell',
      category: 'Console'
    })
    if(res.success) {
      window.location.reload()
    }
  }


  useEffect(() => {
    if (!instance) return

    const currentSessionKey = localStorage.getItem('current_terminal_session')
    if (!currentSessionKey) {
      console.error('No active terminal session found')
      instance.write('\x1b[31mError: No active terminal session found\x1b[0m\r\n')
      return
    }

    const websocketUrl = localStorage.getItem(currentSessionKey)
    if (!websocketUrl) {
      console.error('WebSocket URL not found')
      instance.write('\x1b[31mError: Terminal session not found or expired\x1b[0m\r\n')
      return
    }

    try {
      const socket = new WebSocket(websocketUrl)

      socket.onopen = () => {
        instance.write('\x1b[32mConnected to terminal server\x1b[0m\r\n')
        setIsConnectionClosed(false) // Reset connection status when connected
      }

      socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        instance.write(`\x1b[31mConnection error: ${websocketUrl}\x1b[0m\r\n`)
      }

      socket.onclose = () => {
        instance.write('\x1b[33mConnection closed\x1b[0m\r\n')
        setIsConnectionClosed(true) // Set connection status to closed
        // Remove the session only when the WebSocket connection is closed
        localStorage.removeItem('current_terminal_session')
      }

      const addon = new AttachAddon(socket)
      instance.loadAddon(addon)

      return () => {
        // Close the WebSocket connection when the component unmounts
        socket.close()
      }
    } catch (error: any) {
      console.error('Error connecting to WebSocket:', error)
      instance.write(`\x1b[31mError: ${error.message}\x1b[0m\r\n`)
    }
  }, [instance])

  return (
    <div className="relative" style={{ width: '100vw', height: '100vh' }}>
      {(devices?.[0]?.device_status?.toLowerCase() === 'offline' || isConnectionClosed) ? (
        <div
          className="absolute inset-0 bg-gray-800 bg-opacity-50 flex flex-col justify-center items-center"
          style={{ backdropFilter: 'blur(5px)' }}
        >
          <p className="text-white text-lg mb-4">
            {devices?.[0]?.device_status?.toLowerCase() === 'offline'
              ? 'Remote Session is terminated.'
              : 'Connection is closed.'}
          </p>
          <button
            onClick={handleReconnect}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isReconnecting}
          >
            {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
          </button>
        </div>
      ) : (
        <div ref={ref as React.RefObject<HTMLDivElement>} />
      )}
    </div>
  )
}