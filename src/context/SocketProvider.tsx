'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect } from 'react';
import socketClient from '~/server/socketClient';

const SocketContext = createContext(socketClient);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  useEffect(() => {
    if (socketClient && typeof socketClient.setRouter === 'function') {
      socketClient.setRouter(router);
    }
  }, [router]);
  // const handleEventAction = async (event: any) => {
  //   const response = await handleEvent(event?.type, event?.payload);
  //   console.debug("🚀 ~ handleEventAction ~ response:", response)
  //   if (response?.redirectTo) {
  //     router.push(response?.redirectTo);
  //   }
  // };
  // useEffect(() => {
  //   // Initialize socket connection and event listeners
  //   socketClient.socket?.on('MESSAGE', (...args: any) => {
  //     handleEventAction(args?.[0]);
  //   });
  //   return () => {
  //     // Cleanup on unmount
  //     socketClient.socket?.removeAllListeners();
  //   };
  // }, []);
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
