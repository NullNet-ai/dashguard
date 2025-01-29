
import React, { createContext } from 'react';
const LayoutContext = createContext<string | null>(null);

export const LayoutProvider = ({ children, layout } : {  children: React.ReactNode, layout: string}  ) => {
  
  return (
    <LayoutContext.Provider value={layout}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = React.useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
