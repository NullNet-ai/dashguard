"use client"

import { createContext } from 'react';
import { type OpenReplayContextType } from './types';

export const OpenReplayContext = createContext<OpenReplayContextType>({ tracker: null });