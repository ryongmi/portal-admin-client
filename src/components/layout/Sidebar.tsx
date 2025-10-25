'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface MenuItem {
  id: string
  label: string
  icon: JSX.Element
  path?: string
  children?: MenuItem[]
}

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps): JSX.Element {
  const [activeMenu, setActiveMenu] = useState<string>('')
  const [currentPath, setCurrentPath] = useState<string>('')
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setCurrentPath(pathname)
    
    // 현재 경로에 따라 적절한 메뉴를 열어놓기
    if (pathname.startsWith('/roles') || pathname.startsWith('/permissions')) {
      setActiveMenu('authorization')
    } else if (pathname.startsWith('/users')) {
      setActiveMenu('auth')
    } else if (pathname.startsWith('/services')) {
      setActiveMenu('portal')
    } else if (pathname === '/') {
      setActiveMenu('')
    }
  }, [pathname])

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: '대시보드',
      path: '/',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: 'auth',
      label: '인증 관리',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      children: [
        { id: 'auth-user', label: '사용자 관리', icon: <></>, path: '/users' },
      ],
    },
    {
      id: 'authorization',
      label: '인가 관리',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      children: [
        { id: 'role', label: '역할 관리', icon: <></>, path: '/roles' },
        { id: 'permission', label: '권한 관리', icon: <></>, path: '/permissions' },
      ],
    },
    {
      id: 'portal',
      label: '포탈 관리',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      children: [
        { id: 'service', label: '서비스 관리', icon: <></>, path: '/services' },
      ],
    },
  ]

  const handleMenuClick = (menuId: string): void => {
    setActiveMenu(activeMenu === menuId ? '' : menuId)
  }

  const navigateToPage = (path: string): void => {
    router.push(path)
  }

  const renderMenuItem = (item: MenuItem, level: number = 0): JSX.Element => {
    const isActive = activeMenu === item.id
    const hasChildren = item.children && item.children.length > 0
    const isCurrentPath = item.path === currentPath

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (item.path) {
              navigateToPage(item.path)
            } else {
              handleMenuClick(item.id)
            }
          }}
          className={`w-full flex items-center rounded-lg transition-colors ${
            level === 0 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400 ml-4'
          } hover:bg-gray-100 dark:hover:bg-gray-700 ${
            isCurrentPath
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-r-2 border-blue-500 dark:border-blue-400'
              : isActive
                ? 'bg-gray-100 dark:bg-gray-700'
                : ''
          } ${
            isOpen
              ? 'justify-between px-4 py-3 text-left text-sm font-medium'
              : 'justify-center p-3'
          }`}
          title={!isOpen ? item.label : undefined}
        >
          <div className={`flex items-center ${isOpen ? 'space-x-3' : ''}`}>
            {item.icon}
            {isOpen && <span>{item.label}</span>}
          </div>
          {hasChildren && isOpen && (
            <svg
              className={`h-4 w-4 transition-transform ${isActive ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
        {hasChildren && isActive && isOpen && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* 사이드바 */}
      <div
        className={`fixed top-16 bottom-0 left-0 z-50 bg-white dark:bg-gray-800 shadow-xl transform transition-all duration-300 ease-in-out lg:static lg:top-0 lg:h-full ${
          isOpen
            ? 'w-64 translate-x-0'
            : 'w-64 -translate-x-full lg:w-16 lg:translate-x-0'
        }`}
      >
        <div className={`flex items-center h-16 border-b border-gray-200 dark:border-gray-700 ${isOpen ? 'justify-between px-4' : 'justify-center px-2'}`}>
          {isOpen && (
            <>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 lg:hidden">메뉴</h2>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 hidden lg:block">KRGeobuk</h2>
            </>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
        
        <nav className={`space-y-2 flex-1 overflow-y-auto ${isOpen ? 'p-4' : 'p-2'}`}>
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>
      </div>
    </>
  )
}