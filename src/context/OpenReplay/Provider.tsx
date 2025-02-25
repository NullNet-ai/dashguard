"use client"

import { useEffect } from 'react';
import Tracker from '@openreplay/tracker';

import { OpenReplayContext } from './context';
import { type OpenReplayProviderProps } from './types';



export const OpenReplayProvider = ({ children }: OpenReplayProviderProps) => {
  
  useEffect(() => {
    try {
      const tracker = new Tracker({
        projectKey: process.env.NEXT_PUBLIC_OPEN_REPLAY_PROJECT_KEY ?? '',
        ingestPoint: process.env.NEXT_PUBLIC_OPEN_REPLAY_INGEST_POINT,
        __DISABLE_SECURE_MODE: true,
      });
      tracker.start();
      console.info('@@@ OpenReplay started');
    } catch (e) {
      console.error('@@@ error starting OpenReplay', e);
    }
  }, []);

  return (
    <OpenReplayContext.Provider value={{ tracker: null }}>
      {children}
    </OpenReplayContext.Provider>
  );
};