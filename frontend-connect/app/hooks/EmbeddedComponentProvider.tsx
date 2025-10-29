'use client';

import { createContext, useContext, ReactNode } from 'react';
import { StripeConnectInstance } from '@stripe/connect-js';

interface EmbeddedComponentContextType {
    connectInstance: StripeConnectInstance | null;
    hasError: boolean;
    isLoading: boolean;
}

const EmbeddedComponentContext = createContext<EmbeddedComponentContextType | null>(null);

interface EmbeddedComponentProviderProps {
    children: ReactNode;
    connectInstance: StripeConnectInstance | null;
    hasError: boolean;
    isLoading?: boolean;
}

export function EmbeddedComponentProvider({
    children,
    connectInstance,
    hasError,
    isLoading = false
}: EmbeddedComponentProviderProps) {
    const contextValue: EmbeddedComponentContextType = {
        connectInstance,
        hasError,
        isLoading,
    };

    return (
        <EmbeddedComponentContext.Provider value={contextValue}>
            {children}
        </EmbeddedComponentContext.Provider>
    );
}

export function useEmbeddedComponent() {
    const context = useContext(EmbeddedComponentContext);

    if (!context) {
        throw new Error('useEmbeddedComponent must be used within an EmbeddedComponentProvider');
    }

    return context;
}

type IConnectJSContext = {
    connectInstance?: StripeConnectInstance;
};

const ConnectJSContext = createContext<IConnectJSContext>({});
export const useConnectJSContext = () => {
    const context = useContext(ConnectJSContext);
    return context;
};