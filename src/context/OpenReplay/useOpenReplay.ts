import { useContext } from 'react';
import { OpenReplayContext } from './context';

export const useOpenReplay = () => {
  const context = useContext(OpenReplayContext);
  if (!context) {
    throw new Error('useOpenReplay must be used within an OpenReplayProvider');
  }
  return context;
};