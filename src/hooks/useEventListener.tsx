import { useEffect } from "react";
import { useEventEmitter } from "~/context/EventEmitterProvider";

export type EventEmitter = {
  on: (event: string, listener: (...args: any[]) => void) => void;
  off: (event: string, listener: (...args: any[]) => void) => void;
};

interface UseEventListenerOptions {
  eventKey?: string;
  listener: (...args: any[]) => void;
}

export function useEventListener({
  eventKey,
  listener,
}: UseEventListenerOptions) {
  const eventEmitter = useEventEmitter();

  useEffect(() => {
    if (!eventKey) return;

    // Attach the event listener
    eventEmitter.on(eventKey, listener);

    // Clean up the listener when the component unmounts
    return () => {
      eventEmitter.off(eventKey, listener);
    };
  }, [eventEmitter, eventKey, listener]);
}
