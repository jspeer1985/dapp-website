import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletContextProvider } from '@/components/WalletContextProvider'
import WalletErrorBoundary from '@/components/ui/wallet-error-boundary'
import Navbar from '@/components/Navbar'
import OptikChatbot from '@/components/OptikChatbot'
import AuthGuard from '@/components/AuthGuard'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Optik | AI-Powered Web3 Application Factory',
  description: 'Optik generates production-ready Solana dApps and tokens in minutes. The ultimate automated dApp factory for the Solana ecosystem.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <WalletErrorBoundary>
          <WalletContextProvider>
            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <AuthGuard requireAuth={false}>
                  {children}
                </AuthGuard>
              </main>
              <OptikChatbot />
            </div>
          </WalletContextProvider>
        </WalletErrorBoundary>
      </body>
    </html>
  )
}
