import type { Metadata } from 'next'
import './globals.css'
import '@/styles/accessibility.css'
import { Providers } from '@/components/providers/Providers'

export const metadata: Metadata = {
  title: 'KRGeobuk Portal Admin',
  description: 'KRGeobuk 서비스 통합 관리 포탈',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <html lang="ko">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
