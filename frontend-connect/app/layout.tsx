import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import QueryProvider from './providers/QueryClientProvider'
import { EmbeddedComponentBorderProvider } from './hooks/EmbeddedComponentBorderProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Furever - Stripe Connect Dashboard',
  description: 'Pet care platform with Stripe Connect payments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Permissions-Policy" content="payment=*" />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <EmbeddedComponentBorderProvider>
            {children}
          </EmbeddedComponentBorderProvider>
        </QueryProvider>
      </body>
    </html>
  )
}