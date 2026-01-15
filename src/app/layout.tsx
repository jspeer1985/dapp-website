import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletContextProvider } from '@/components/WalletContextProvider'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'dApp Factory - AI-Powered Solana dApp Generation',
  description: 'Generate production-ready Solana dApps with AI in minutes. No coding required.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletContextProvider>
          <Navbar />
          <main>{children}</main>
        </WalletContextProvider>
      </body>
    </html>
  )
}
