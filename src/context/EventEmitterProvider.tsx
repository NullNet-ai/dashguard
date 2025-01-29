"use client";
import React, { createContext, useContext, useMemo, useRef } from "react";
import EventEmitter from "events";

// Create a context for EventEmitter
const EventEmitterContext = createContext<EventEmitter | undefined>(undefined);

// EventEmitterProvider component that provides the EventEmitter instance
export const EventEmitterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const emitterRef = useRef<EventEmitter | null>(null);

  if (!emitterRef.current) {
    emitterRef.current = new EventEmitter();
  }

  // Memoize the emitter so it's stable across re-renders
  const value = useMemo(() => emitterRef.current!, []);
  // useEffect(() => {
  //   if (!emitterRef.current) return;
  //   const events = emitterRef.current.eventNames(); // Get all event names
  // }, [emitterRef.current]);

  // Set Limit of Listeners
  emitterRef.current.setMaxListeners(20);

  // log debug list of listeners
  console.debug(emitterRef.current.eventNames());

  return (
    <EventEmitterContext.Provider value={value}>
      {children}
    </EventEmitterContext.Provider>
  );
};

// Custom hook to access the EventEmitter
export const useEventEmitter = (): EventEmitter => {
  const context = useContext(EventEmitterContext);
  if (!context) {
    throw new Error(
      "useEventEmitter must be used within an EventEmitterProvider",
    );
  }
  return context;
};
