'use client'

import { AttachAddon } from '@xterm/addon-attach'
import { FitAddon } from '@xterm/addon-fit'
import { useEffect, useState } from 'react'
import { useXTerm } from 'react-xtermjs'
import { api } from '~/trpc/react'

export default function WebTerminal() {
  const { instance, ref } = useXTerm()
  const fitAddon = new FitAddon()
  const [socket, setSocket] = useState<WebSocket | null>(null) // Track WebSocket instance
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [isConnectionClosed, setIsConnectionClosed] = useState(false) // Track WebSocket connection status
  const createUpdate = api.deviceRemoteAccessSession.createUpdateDeviceRemoteAccessSessions.useMutation()

  const device_id = localStorage.getItem('device_id')

  const { data: devices, refetch } = api.deviceRemoteAccessSession.fetchDevices.useQuery({
    limit: 100,
    device_id: device_id || ""
  })

  const handleReconnect = async () => {
    setIsReconnecting(true)
    const res = await createUpdate.mutateAsync({
      device_id: device_id || '',
      remote_access_type: 'Shell',
      category: 'Console'
    })
    if (res.success) {
      setIsConnectionClosed(false) // Reset connection status
      setIsReconnecting(false)
      initializeWebSocket() // Reinitialize the WebSocket connection
    }
  }

  const initializeWebSocket = () => {
    const currentSessionKey = localStorage.getItem('current_terminal_session')
    if (!currentSessionKey) {
      console.error('No active terminal session found')
      instance?.write('\x1b[31mError: No active terminal session found\x1b[0m\r\n')
      return
    }

    const websocketUrl = localStorage.getItem(currentSessionKey)
    if (!websocketUrl) {
      console.error('WebSocket URL not found')
      instance?.write('\x1b[31mError: Terminal session not found or expired\x1b[0m\r\n')
      return
    }

    try {
      const newSocket = new WebSocket(websocketUrl)

      newSocket.onopen = () => {
        instance?.write('\x1b[32mConnected to terminal server\x1b[0m\r\n')
        setIsConnectionClosed(false) // Reset connection status when connected
      }

      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error)
        instance?.write(`\x1b[31mConnection error: ${websocketUrl}\x1b[0m\r\n`)
      }

      newSocket.onclose = () => {
        instance?.write('\x1b[33mConnection closed\x1b[0m\r\n')
        setIsConnectionClosed(true) // Set connection status to closed dynamically
        localStorage.removeItem('current_terminal_session')
      }

      const addon = new AttachAddon(newSocket)
      instance?.loadAddon(addon)

      setSocket(newSocket) // Update the WebSocket instance in state
    } catch (error: any) {
      console.error('Error connecting to WebSocket:', error)
      instance?.write(`\x1b[31mError: ${error.message}\x1b[0m\r\n`)
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

  // If the remote session is terminated or WebSocket is closed, display a message and reconnect button
  if (devices?.[0]?.device_status?.toLowerCase() === 'offline' || isConnectionClosed) {
    localStorage.removeItem('device_id')
    return (
      <div className="relative h-screen w-screen flex flex-col justify-center items-center bg-gray-800">
        <p className="text-white text-lg mb-4">
          {devices?.[0]?.device_status?.toLowerCase() === 'offline' || !devices?.length
            ? `The remote session has been terminated. Please log in to Proxmox and restart pfSense to bring it back online before attempting to reconnect.`
            : 'Connection is closed. Please log in to Proxmox and restart pfSense to bring it back online before attempting to reconnect.'}
        </p>
        <button
          onClick={handleReconnect}
          className={isReconnecting || isConnectionClosed || devices?.[0]?.device_status?.toLowerCase() === 'offline' || !devices?.length ? "px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" :"px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"}
          disabled={isReconnecting || isConnectionClosed || devices?.[0]?.device_status?.toLowerCase() === 'offline' || !devices?.length}
        >
          {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
        </button>
      </div>
    )
  }

  // Render the terminal if the session is active
  return (
    <div className="relative h-screen w-screen">
      <div ref={ref as React.RefObject<HTMLDivElement>} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}