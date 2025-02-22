import { ReactNode } from 'react';
import Tracker from '@openreplay/tracker';

export interface OpenReplayContextType {
  tracker: Tracker | null;
}

export interface OpenReplayProviderProps {
  children: ReactNode;
}