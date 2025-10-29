'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

// Enhanced query client with better caching and error handling
export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - longer cache for better UX
            gcTime: 10 * 60 * 1000, // 10 minutes cache time (renamed from cacheTime)
            refetchOnWindowFocus: false, // Reduce unnecessary refetches
            refetchOnMount: false, // Prevent duplicate fetches
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors (client issues)
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              // Retry 3 times for server errors
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff, max 30s
            // Network mode for better offline experience
            networkMode: 'online',
            // Prevent infinite refetch loops
            refetchInterval: false,
          },
          mutations: {
            retry: 1, // Retry mutations once
            networkMode: 'online',
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}