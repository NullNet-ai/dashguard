'use client';

import { createContext, useContext, useEffect } from 'react';
import { handleEvent } from '~/server/events';
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
    };
  }, []);
  return (
    <SocketContext.Provider value={socketClient}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
