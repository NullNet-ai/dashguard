'use client'

import { AttachAddon } from '@xterm/addon-attach'
import { useEffect } from 'react'
import { useXTerm } from 'react-xtermjs'
// No longer need useSearchParams since we're not using URL parameters

export default function WebTerminal() {
  const { instance, ref } = useXTerm()
  // No longer using searchParams

  useEffect(() => {
    if (!instance) return

    // No URL parameters - get the most recent session
    const currentSessionKey = localStorage.getItem('current_terminal_session')

    if (!currentSessionKey) {
      console.error('No active terminal session found')
      if (instance) {
        instance.write('\x1b[31mError: No active terminal session found\x1b[0m\r\n')
      }
      return
    }

    // Retrieve the WebSocket URL from localStorage
    const websocketUrl = localStorage.getItem(currentSessionKey)

    if (!websocketUrl) {
      console.error('WebSocket URL not found for the active session')
      if (instance) {
        instance.write('\x1b[31mError: Terminal session not found or expired\x1b[0m\r\n')
      }
      return
    }

    // Clear the current session marker (but keep the URL in case we need to reconnect)
    localStorage.removeItem('current_terminal_session')

    try {
      const socket = new WebSocket(websocketUrl)

      socket.onopen = () => {
        if (instance) {
          instance.write('\x1b[32mConnected to terminal server\x1b[0m\r\n')
        }
      }

      socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        if (instance) {
          instance.write(`\x1b[31mConnection error. Please check the URL: ${websocketUrl}\x1b[0m\r\n`)
        }
      }

      socket.onclose = () => {
        if (instance) {
          instance.write('\x1b[33mConnection closed\x1b[0m\r\n')
        }
      }

      const addon = new AttachAddon(socket)
      instance.loadAddon(addon)

      return () => {
        socket.close()
      }
    }
    catch (error: any) {
      console.error('Error connecting to WebSocket:', error)
      if (instance) {
        instance.write(`\x1b[31mError connecting to WebSocket: ${error.message}\x1b[0m\r\n`)
      }
    }
  }, [instance])

  return (
    <div className="container-terminal" style = { { width: '100vw', height: '100vh' } }>
      <div ref={ref} />
    </div>
  )
}
