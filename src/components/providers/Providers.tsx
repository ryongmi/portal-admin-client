'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeInitializer } from '@/components/common/ThemeInitializer';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import ToastContainer, { toast } from '@/components/common/ToastContainer';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps): React.JSX.Element {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  useEffect(() => {
    // 전역 toast 함수를 window 객체에 등록 (axios interceptor에서 사용)
    if (typeof window !== 'undefined') {
      (window as { showToast?: typeof toast }).showToast = toast;
    }

    // 전역 에러 핸들러
    const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
      // Unhandled promise rejection logged for debugging

      // 프로덕션에서는 에러 로깅 서비스로 전송
      if (process.env.NODE_ENV === 'production') {
        // Production Unhandled Rejection logged to external service
        // Error details would be sent to logging service
      }

      // 사용자에게 알림 (너무 많은 알림을 피하기 위해 제한)
      if (!event.reason?.message?.includes('Network Error')) {
        toast.error('예상치 못한 오류', '문제가 지속되면 페이지를 새로고침해주세요.', {
          duration: 3000,
        });
      }
    };

    const handleError = (_event: ErrorEvent): void => {
      // Global error logged for debugging

      // 프로덕션에서는 에러 로깅 서비스로 전송
      if (process.env.NODE_ENV === 'production') {
        // Production Global Error logged to external service
        // Error details would be sent to logging service
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // 정리 함수
    return (): void => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);

      // window 객체에서 toast 함수 제거
      if (typeof window !== 'undefined') {
        delete (window as { showToast?: typeof toast }).showToast;
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeInitializer />
        <AuthProvider>
          {children}
          <ToastContainer position="top-right" maxToasts={5} />
        </AuthProvider>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
