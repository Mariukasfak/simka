import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin', 'latin-ext'] })

export const metadata: Metadata = {
  title: 'Susikurk savo dizainą | Siemka.lt',
  description: 'Interaktyvus įrankis, leidžiantis susikurti unikalius marškinėlius ar džemperius su savo logotipu. Greita peržiūra ir užsakymas internetu - Siemka.lt.',
  openGraph: {
    title: 'Susikurk savo marškinėlių dizainą',
    description: 'Įkelk savo logotipą ir matyk, kaip jis atrodys ant rūbų.',
    url: 'https://app.siemka.lt',
    siteName: 'Siemka.lt',
    locale: 'lt_LT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Susikurk savo dizainą | Siemka.lt',
    description: 'Interaktyvus įrankis marškinėlių ir džemperių dizainui',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="lt">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  )
}