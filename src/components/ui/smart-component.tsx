'use client'
import React from "react";

type SmartContextType = {
  state: "wizard-summary" | "smart";
  action: React.Dispatch<React.SetStateAction<SmartContextType["state"]>>;
};

const SmartContext = React.createContext<SmartContextType | null>(null);

const SmartProvider: React.FC<React.PropsWithChildren<object>> = ({ children }) => {
  const [state, setState] = React.useState<SmartContextType["state"]>("smart");
  return (
    <SmartContext.Provider value={{ state, action: setState}}>{children}</SmartContext.Provider>
  );
};

export { SmartProvider, SmartContext };
