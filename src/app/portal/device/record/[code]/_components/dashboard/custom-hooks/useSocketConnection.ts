import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

// const SOCKET_URL = 'http://localhost:5001';
const SOCKET_URL = 'http://datastore.nullnetqa.net';

export function useSocketConnection({channel_name, token}: {channel_name?: string, token: string | null}) {
  const socketRef = useRef<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socket: any = io(SOCKET_URL, {
      auth: { token: token },
      autoConnect: true,
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      
      setIsConnected(false);
    });

    socket.on('connect_error', (err: any) => {
      console.error('Connection error:', err.message);
      setIsConnected(false);
    });

    socket.on('packets_interfaces-dbcc1e63-eed0-4eb3-a181-019fb8c309e4', (data: any) => {
      console.log('%c Line:37 🍯 data', 'color:#ea7e5c', data);
      
    
    });

    if(channel_name) {
      socket.emit('updateHighWaterMark', { channel_name: channel_name, highWaterMark: 10 });
    }

    return () => {
      socket.disconnect();
      setIsConnected(false);
    };
  }, [token]);

  const handleDisconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setIsConnected(false);
    }
  };

  
  return {
    socket: socketRef.current,
    isConnected,
    handleDisconnectSocket,
  };
}
