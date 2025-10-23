import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shampooches Staff Portal',
  description: 'Staff management portal for Shampooches grooming shop',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
