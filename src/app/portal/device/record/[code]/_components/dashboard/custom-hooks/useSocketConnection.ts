import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

// const SOCKET_URL = 'http://localhost:5001';

export function useSocketConnection({channel_name, token}: {channel_name?: string, token: string | null}) {
  const socketRef = useRef<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  
  
  useEffect(() => {
    if (!token) return;

    const socketUrl = `${process.env.NEXT_PUBLIC_SOCKET_URL}`;
    const socket: any = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
      transports: ['websocket'],
      auth: { token: token },
      autoConnect: true,
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      console.debug('[socket] connect', {
        url: socketUrl,
        id: socket.id,
        connected: socket.connected,
      });
      setIsConnected(true);
    });

    socket.on('disconnect', (reason: any, details: any) => {
      console.debug('[socket] disconnect', {
        id: socket.id,
        reason,
        details,
      });
      setIsConnected(false);
    });

    socket.on('connection_multi_graph-07da2369-432b-48f4-8714-372f9412ff57', (data: any) => {
      console.debug('[socket] event connection_multi_graph-07da2369-432b-48f4-8714-372f9412ff57', data);
    })
    
    socket.on('connect_error', (err: any) => {
      console.error('[socket] connect_error', {
        message: err?.message,
        name: err?.name,
        description: err?.description,
        context: err?.context,
      });
      setIsConnected(false);
    });

    if(channel_name) {
      const payload = { channel_name: channel_name, highWaterMark: 1 };
      console.debug('[socket] emit updateHighWaterMark', payload);
      socket.emit('updateHighWaterMark', payload, (ack: any) => {
        console.debug('[socket] ack updateHighWaterMark', ack);
      });
    }

    if (socket?.io?.on) {
      socket.io.on('reconnect_attempt', (attempt: any) => {
        console.debug('[socket] reconnect_attempt', { attempt });
      });

      socket.io.on('reconnect', (attempt: any) => {
        console.debug('[socket] reconnect', { attempt, id: socket.id });
      });

      socket.io.on('reconnect_error', (err: any) => {
        console.error('[socket] reconnect_error', { message: err?.message, err });
      });

      socket.io.on('reconnect_failed', () => {
        console.error('[socket] reconnect_failed');
      });
    }

    socket.on('error', (err: any) => {
      console.error('[socket] error', err);
    });

    socket.onAny((event: string, ...args: any[]) => {
      if (event === 'connect' || event === 'disconnect' || event === 'connect_error' || event === 'error') return;
      console.debug('[socket] onAny', { event, args });
    });

    return () => {
      socket.offAny();
      socket.removeAllListeners();
      if (socket?.io?.off) {
        socket.io.off('reconnect_attempt');
        socket.io.off('reconnect');
        socket.io.off('reconnect_error');
        socket.io.off('reconnect_failed');
      }
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
