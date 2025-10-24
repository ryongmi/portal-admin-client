'use client'

import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import { useSkipLink } from '@/hooks/useFocusManagement'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)
  const { skipLinkRef, handleSkipToContent } = useSkipLink()

  const handleMenuToggle = (): void => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSidebarToggle = (): void => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Skip Links for Keyboard Navigation */}
      <div className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:bg-blue-600 focus:text-white focus:p-2 focus:z-50">
        <a
          ref={skipLinkRef}
          href="#main-content"
          onKeyDown={handleSkipToContent}
          className="focus:outline-none focus:ring-2 focus:ring-white"
        >
          메인 콘텐츠로 바로가기
        </a>
        <a
          href="#navigation"
          className="ml-2 focus:outline-none focus:ring-2 focus:ring-white"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              const nav = document.querySelector('#navigation');
              if (nav) (nav as HTMLElement).focus();
            }
          }}
        >
          네비게이션으로 바로가기
        </a>
      </div>

      <Header onMenuToggle={handleMenuToggle} />
      
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
        
        <main 
          id="main-content"
          className="flex-1 transition-all duration-300 overflow-auto"
          role="main"
          tabIndex={-1}
          aria-label="주요 콘텐츠"
        >
          <div className="p-4 sm:p-6 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}