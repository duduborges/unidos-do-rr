import { Barlow_Condensed, Inter } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-body' })
const barlow = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'Unidos do RR | Fut7',
  description: 'Unidos pelo bairro. Fut7 do Rio Vermelho, Florianopolis.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${barlow.variable}`}>{children}</body>
    </html>
  )
}
