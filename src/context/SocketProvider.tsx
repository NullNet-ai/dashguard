'use client';

import { createContext, useContext, useEffect } from 'react';
import { handleEvent } from '~/server/event-listeners';
import socketClient from '~/server/socketClient';

const SocketContext = createContext(socketClient);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SocketContext.Provider value={socketClient}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
