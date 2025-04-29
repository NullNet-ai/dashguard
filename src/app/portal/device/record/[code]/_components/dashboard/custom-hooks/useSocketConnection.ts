import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://datastore.nullnetqa.net:5001';
// const SOCKET_URL = 'http://localhost:5001';

export function useSocketConnection({channel_name, token}: {channel_name?: string, token: string | null}) {
  const socketRef = useRef<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  
  
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

    console.debug('%c Line:35 🥒 socket', 'color:#4fff4B', socket);
    socket.on('connection_multi_graph-07da2369-432b-48f4-8714-372f9412ff57', (data: any) => {
      console.debug('%c Line:35 🍌 data', 'color:#3f7cff', data);
    })
    
    socket.on('connect_error', (err: any) => {
      console.error('Connection error:', err.message);
      setIsConnected(false);
    });

    if(channel_name) {
      socket.emit('updateHighWaterMark', { channel_name: channel_name, highWaterMark: 1 });
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
