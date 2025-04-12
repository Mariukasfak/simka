import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Susikurk savo dizainą | Siemka.lt',
  description: 'Interaktyvus įrankis, leidžiantis susikurti unikalius marškinėlius ar džemperius su savo logotipu.',
  openGraph: {
    title: 'Susikurk savo marškinėlių dizainą',
    description: 'Įkelk savo logotipą ir matyk, kaip jis atrodys ant rūbų.',
    url: 'https://app.siemka.lt',
    siteName: 'Siemka.lt',
    locale: 'lt_LT',
    type: 'website',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="lt" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow bg-gray-50 py-8">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }} 
        />
      </body>
    </html>
  )
}