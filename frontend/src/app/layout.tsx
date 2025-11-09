// frontend/src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import QueryProvider from '@/providers/QueryProvider'

export const metadata: Metadata = {
  title: 'پارسا گلد - سیستم معاملات طلا، نقره و نفت',
  description: 'پلتفرم پیشرفته معاملات طلا، نقره و نفت پارسا گلد',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="font-primary">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}