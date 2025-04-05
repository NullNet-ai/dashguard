'use client';

import { createContext, useContext, useEffect } from 'react';
import { handleEvent } from '~/server/event-listeners';
import socketClient from '~/server/socketClient';

const SocketContext = createContext(socketClient);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Initialize socket connection and event listeners
    socketClient.socket?.on('MESSAGE', (...args: any) => {
      handleEvent(args?.[0]?.type, args?.[0]?.payload);
    });
    return () => {
      // Cleanup on unmount
      socketClient.socket?.removeAllListeners();
      socketClient.onDisconnect();
    };
  }, []);
  return (
    <SocketContext.Provider value={socketClient}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
