'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface EmbeddedComponentBorderContextType {
  enableBorder: boolean;
  setEnableBorder: (enabled: boolean) => void;
}

const EmbeddedComponentBorderContext = createContext<EmbeddedComponentBorderContextType | null>(null);

export function EmbeddedComponentBorderProvider({ children }: { children: ReactNode }) {
  const [enableBorder, setEnableBorder] = useState(false);

  return (
    <EmbeddedComponentBorderContext.Provider value={{ enableBorder, setEnableBorder }}>
      {children}
    </EmbeddedComponentBorderContext.Provider>
  );
}

export function useEmbeddedComponentBorder() {
  const context = useContext(EmbeddedComponentBorderContext);
  if (!context) {
    throw new Error('useEmbeddedComponentBorder must be used within EmbeddedComponentBorderProvider');
  }
  return context;
}