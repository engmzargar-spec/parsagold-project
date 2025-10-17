import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'پارساگلد - اتاق معاملات طلا و نفت',
  description: 'اولین اتاق معامله آنلاین نفت ایران - خرید و فروش امن طلا، نقره و نفت',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <style>
          {`
            @font-face {
              font-family: 'ParsagoldFont';
              src: url('/fonts/parasagold-font.woff2') format('woff2');
              font-weight: normal;
              font-style: normal;
              font-display: swap;
            }
          `}
        </style>
      </head>
      <body className="font-sans" style={{ fontFamily: "'ParsagoldFont', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}