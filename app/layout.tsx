import './globals.css'
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Benten UI — Modern View Switch', description: 'Customer / Brand / Program views with consistent My Projects' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="ja"><body>{children}</body></html>)
}
