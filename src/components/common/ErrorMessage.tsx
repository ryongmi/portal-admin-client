'use client';

import React from 'react';
import Button from './Button';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  showIcon?: boolean;
  onRetry?: (() => void) | undefined;
  onDismiss?: (() => void) | undefined;
  retryLabel?: string;
  dismissible?: boolean;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title,
  message,
  type = 'error',
  showIcon = true,
  onRetry,
  onDismiss,
  retryLabel = '다시 시도',
  dismissible = true,
  className = '',
}) => {
  const getIcon = (): JSX.Element => {
    switch (type) {
      case 'error':
        return (
          <svg
            className="w-5 h-5 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg
            className="w-5 h-5 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        );
      case 'info':
        return (
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const getBgColor = (): string => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = (): string => {
    switch (type) {
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getBgColor()} ${className}`} role="alert">
      <div className="flex">
        {showIcon && <div className="flex-shrink-0">{getIcon()}</div>}
        <div className={`${showIcon ? 'ml-3' : ''} flex-1`}>
          {title && <h3 className={`text-sm font-medium ${getTextColor()}`}>{title}</h3>}
          <p className={`${title ? 'mt-1' : ''} text-sm ${getTextColor()}`}>{message}</p>

          {(onRetry || onDismiss) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  className={`
                    ${type === 'error' ? 'border-red-300 text-red-700 hover:bg-red-100' : ''}
                    ${
                      type === 'warning'
                        ? 'border-yellow-300 text-yellow-700 hover:bg-yellow-100'
                        : ''
                    }
                    ${type === 'info' ? 'border-blue-300 text-blue-700 hover:bg-blue-100' : ''}
                  `}
                >
                  {retryLabel}
                </Button>
              )}
              {onDismiss && dismissible && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDismiss}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  닫기
                </Button>
              )}
            </div>
          )}
        </div>

        {dismissible && onDismiss && !onRetry && (
          <div className="flex-shrink-0 ml-4">
            <button
              onClick={onDismiss}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 에러 타입 정의
interface ApiError {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// 특화된 컴포넌트들
export const ApiErrorMessage: React.FC<{
  error: ApiError;
  onRetry?: () => void;
  onDismiss?: () => void;
}> = ({ error, onRetry, onDismiss }) => {
  const getErrorMessage = (error: ApiError): { title: string; message: string } => {
    if (error?.response?.status === 401) {
      return {
        title: '인증 오류',
        message: '로그인이 필요하거나 세션이 만료되었습니다. 다시 로그인해주세요.',
      };
    }

    if (error?.response?.status === 403) {
      return {
        title: '권한 오류',
        message: '이 작업을 수행할 권한이 없습니다.',
      };
    }

    if (error?.response?.status === 404) {
      return {
        title: '리소스를 찾을 수 없음',
        message: '요청한 리소스를 찾을 수 없습니다.',
      };
    }

    if (error?.response?.status && error.response.status >= 500) {
      return {
        title: '서버 오류',
        message: '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      };
    }

    if (error?.message?.includes('Network Error')) {
      return {
        title: '네트워크 오류',
        message: '네트워크 연결을 확인하고 다시 시도해주세요.',
      };
    }

    return {
      title: '오류 발생',
      message:
        error?.response?.data?.message || error?.message || '알 수 없는 오류가 발생했습니다.',
    };
  };

  const { title, message } = getErrorMessage(error);

  return (
    <ErrorMessage
      title={title}
      message={message}
      type="error"
      onRetry={onRetry}
      onDismiss={onDismiss}
    />
  );
};

export const NetworkErrorMessage: React.FC<{
  onRetry?: () => void;
  onDismiss?: () => void;
}> = ({ onRetry, onDismiss }) => (
  <ErrorMessage
    title="네트워크 오류"
    message="인터넷 연결을 확인하고 다시 시도해주세요."
    type="error"
    onRetry={onRetry}
    onDismiss={onDismiss}
    retryLabel="다시 연결"
  />
);

export const EmptyStateMessage: React.FC<{
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({ title = '데이터가 없습니다', message, action }) => (
  <div className="text-center py-12">
    <svg
      className="mx-auto w-16 h-16 text-gray-400 mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6">{message}</p>
    {action && <Button onClick={action.onClick}>{action.label}</Button>}
  </div>
);

export default ErrorMessage;
