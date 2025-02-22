"use client"

import { useEffect } from 'react';
import Tracker from '@openreplay/tracker';

import { OpenReplayContext } from './context';
import { type OpenReplayProviderProps } from './types';

const tracker = new Tracker({
  projectKey: process.env.NEXT_PUBLIC_OPEN_REPLAY_PROJECT_KEY ?? '',
  ingestPoint: process.env.NEXT_PUBLIC_OPEN_REPLAY_INGEST_POINT,
});

export const OpenReplayProvider = ({ children }: OpenReplayProviderProps) => {
  
  useEffect(() => {
    tracker.start();
  }, []);

  return (
    <OpenReplayContext.Provider value={{ tracker }}>
      {children}
    </OpenReplayContext.Provider>
  );
};