'use client';

import { ConnectComponentsProvider } from '@stripe/react-connect-js';
import { EmbeddedComponentProvider } from '@/app/hooks/EmbeddedComponentProvider';
import { useConnect } from '@/app/hooks/useConnect';
import { ReactNode } from 'react';

interface EmbeddedComponentWrapperProps {
  demoOnboarding?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

export function EmbeddedComponentWrapper({
  demoOnboarding = false,
  children,
  fallback
}: EmbeddedComponentWrapperProps) {
  const { hasError, stripeConnectInstance } = useConnect(!!demoOnboarding);

  if (hasError || !stripeConnectInstance) {
    return fallback || null;
  }

  return (
    <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
      <EmbeddedComponentProvider
        connectInstance={stripeConnectInstance}
        hasError={hasError}
      >
        {children}
      </EmbeddedComponentProvider>
    </ConnectComponentsProvider>
  );
}