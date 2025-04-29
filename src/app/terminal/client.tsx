'use client'

import { AttachAddon } from '@xterm/addon-attach'
import { useEffect } from 'react'
import { useXTerm } from 'react-xtermjs'

export default function WebTerminal() {
  const { instance, ref } = useXTerm()

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

    localStorage.removeItem('current_terminal_session')

    try {
      const socket = new WebSocket(websocketUrl)

      socket.onopen = () => instance.write('\x1b[32mConnected to terminal server\x1b[0m\r\n')
      socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        instance.write(`\x1b[31mConnection error: ${websocketUrl}\x1b[0m\r\n`)
      }
      socket.onclose = () => instance.write('\x1b[33mConnection closed\x1b[0m\r\n')

      const addon = new AttachAddon(socket)
      instance.loadAddon(addon)

      return () => socket.close()
    } catch (error: any) {
      console.error('Error connecting to WebSocket:', error)
      instance.write(`\x1b[31mError: ${error.message}\x1b[0m\r\n`)
    }
  }, [instance])

  return (
    <div className="container-terminal" style={{ width: '100vw', height: '100vh' }}>
      <div ref={ref} />
    </div>
  )
}
