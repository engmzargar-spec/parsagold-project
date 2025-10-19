import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'پارسا گلد - معاملات طلا، نقره و نفت',
  description: 'پلتفرم مطمئن برای معاملات آنلاین طلا، نقره و نفت',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}