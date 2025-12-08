"use client";

import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";
import { Transition } from "@headlessui/react";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Define the toast types
type ToastType = "success" | "error";

// Define the structure of a toast object
interface Toast {
  id: number;
  message: string;
  type: ToastType;
  position: ToastPosition;
}

// Define the positions for the toasts
type ToastPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

// Define the context type
interface ToastContextType {
  success: (msg: string, position?: ToastPosition) => void;
  error: (msg: string, position?: ToastPosition) => void;
}

// Create the context with the ToastContextType
const ToastContext = createContext<ToastContextType | null>(null);

// Custom hook to access the toast context
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// ToastProvider component
export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Function to add a toast with a default position of "bottom-right"
  const addToast = (
    message: string,
    type: ToastType = "success",
    position: ToastPosition = "bottom-right",
  ) => {
    const id = Date.now();
    setToasts((prevToasts) => {
      const newToasts = [...prevToasts, { id, message, type, position }];
      return newToasts;
    });
  };

  // Function to remove a specific toast by ID
  const removeToast = (id?: number) => {
    if (id) {
      setToasts((prevToasts) => {
        const filteredToasts = prevToasts.filter((toast) => toast.id !== id);
        return filteredToasts;
      });
    } else {
      // Fallback to the original behavior if no ID is provided
      setToasts((prevToasts) => prevToasts.slice(1));
    }
  };

  // Expose the toast functions (success and error) through the context
  const toast: ToastContextType = {
    success: (msg: string, position?: ToastPosition) =>
      addToast(msg, "success", position),
    error: (msg: string, position?: ToastPosition) =>
      addToast(msg, "error", position),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Render the toast container */}
      {["top-left", "top-right", "bottom-left", "bottom-right"].map((pos) => (
        <div
          key={pos}
          className={`pointer-events-none fixed flex w-full px-4 py-6 z-50 ${
            pos.includes("bottom") ? "bottom-0" : "top-0"
          } ${pos.includes("right") ? "right-0" : "left-0"} px-4 py-6 sm:p-6`}
        >
          <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
            {toasts
              .filter((toast) => toast.position === pos)
              .map((toast, index) => (
                <Toast
                  key={toast.id}
                  message={toast.message}
                  type={toast.type}
                  onClose={() => removeToast(toast.id)}
                  delay={index * 1000}
                />
              ))}
          </div>
        </div>
      ))}
    </ToastContext.Provider>
  );
}

// Toast component to display each individual toast
function Toast({ 
  message, 
  type, 
  onClose,
  delay = 0
}: { 
  message: string; 
  type: ToastType; 
  onClose: () => void;
  delay?: number; 
}) {
  const [show, setShow] = useState(false);
  
  // First mount effect - show the toast after a brief delay
  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShow(true);
    }, 50);

    return () => clearTimeout(showTimer);
  }, [message]);

  useEffect(() => {
    // Base timeout (3 seconds) plus any additional delay for staggered closing
    const closeDelay = 800 + delay;

    const timer = setTimeout(() => {
      setShow(false);

      setTimeout(() => {
        onClose();
      }, 300);
    }, closeDelay);

    return () => {
      clearTimeout(timer);
    };
  }, [message, onClose, delay]);

  return (
    <Transition
      show={show}
      appear={true}
      enter="transition ease-out duration-300 transform"
      enterFrom="opacity-0 translate-y-2 sm:translate-y-0 sm:translate-x-2"
      enterTo="opacity-100 translate-y-0 sm:translate-x-0"
      leave="transition ease-in duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0 translate-y-2 sm:translate-y-0 sm:translate-x-2"
    >
      <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black ring-opacity-5">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {type === "success" && (
                <CheckCircleIcon
                  aria-hidden="true"
                  className="h-6 w-6 text-green-400"
                />
              )}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{message}</p>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => {
                  setShow(false);
                  setTimeout(onClose, 300);
                }}
                className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  );
}
