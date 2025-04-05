import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { userToken } from './userToken';

const SOCKET_URL = 'http://datastore.nullnetqa.net';

export function useSocketConnection(channel_name?: string) {
  const socketRef = useRef<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userToken) return;

    const socket: any = io(SOCKET_URL, {
      auth: { token: userToken },
      autoConnect: true,
    });

    console.log('%c Line:20 🍅 socket', 'color:#93c0a4', socket);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (err: any) => {
      console.error('Connection error:', err.message);
      setIsConnected(false);
    });

    if(channel_name) {
      socket.emit('updateHighWaterMark', { channel_name: channel_name, highWaterMark: 10 });
    }

    return () => {
      socket.disconnect();
      setIsConnected(false);
    };
  }, [userToken]);

  const handleDisconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setIsConnected(false);
    }
  };

  console.log('%c Line:50 🍎', 'color:#93c0a4', socketRef.current);
  return {
    socket: socketRef.current,
    isConnected,
    handleDisconnectSocket,
  };
}
