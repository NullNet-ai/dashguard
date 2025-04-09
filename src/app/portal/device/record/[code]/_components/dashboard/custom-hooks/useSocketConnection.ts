import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://datastore.nullnetqa.net:5001';
// const SOCKET_URL = 'http://datastore.nullnetqa.net';

export function useSocketConnection({channel_name, token}: {channel_name?: string, token: string | null}) {
  const socketRef = useRef<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  
  console.log('%c Line:12 🍅', 'color:#ffdd4d');
  useEffect(() => {
    if (!token) return;

    const socket: any = io(SOCKET_URL, {
      transports: ['websocket'],
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

    console.log('%c Line:35 🍯 socket', 'color:#465975', socket);
    socket.on('connect_error', (err: any) => {
      console.error('Connection error:', err.message);
      setIsConnected(false);
    });
    
    console.log('%c Line:38 🥃 socket', 'color:#7f2b82', socket);
    socket.on('packets_interfaces-dbcc1e63-eed0-4eb3-a181-019fb8c309e4', (data: any) => {
      console.log('%c Line:38 🥚 data', 'color:#33a5ff', data);
    
    });

    socket.on('packets_interfaces-dbcc1e63-eed0-4eb3-a181-019fb8c309e4', (data: any) => {
      console.log('%c Line:38 🥚 data', 'color:#33a5ff packets_interfaces', data);
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
