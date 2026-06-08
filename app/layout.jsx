// Font di-bundle lokal via Fontsource — tidak butuh internet (offline-first)
import '@fontsource/sora/500.css'
import '@fontsource/sora/600.css'
import '@fontsource/sora/700.css'
import '@fontsource/sora/800.css'
import '@fontsource/plus-jakarta-sans/400.css'
import '@fontsource/plus-jakarta-sans/500.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'
import './globals.css'

export const metadata = {
  title: 'Kasflow — Buku Kas Digital',
  description: 'Aplikasi catatan keuangan untuk bisnis. Dibuat oleh Pagiverse Studio.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kasflow',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

// Next.js 14: themeColor & viewport dipisah dari metadata
export const viewport = {
  themeColor: '#10b981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
