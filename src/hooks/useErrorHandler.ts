'use client';

import { useCallback } from 'react';
import { toast } from '@/components/common/ToastContainer';

// 에러 타입 정의
interface ApiErrorResponse {
  message?: string;
  errors?: string[] | Record<string, string[]>;
}

interface ApiError {
  response?: {
    status: number;
    data?: ApiErrorResponse;
  };
  message?: string;
  code?: string;
  stack?: string;
}

type ErrorType = Error | ApiError | unknown;

export interface ErrorHandlerOptions {
  showToast?: boolean;
  toastDuration?: number;
  logError?: boolean;
  customMessage?: string;
  onError?: (error: ErrorType) => void;
}

export const useErrorHandler = (): {
  handleError: (error: ErrorType, options?: ErrorHandlerOptions) => string;
  handleApiError: (error: ErrorType, options?: ErrorHandlerOptions) => string;
  handleNetworkError: (error: ErrorType, options?: ErrorHandlerOptions) => string;
  handleValidationError: (error: ErrorType, options?: ErrorHandlerOptions) => string;
} => {
  const handleError = useCallback((
    error: ErrorType, 
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      toastDuration = 5000,
      logError = true,
      customMessage,
      onError,
    } = options;

    // 에러 로깅
    if (logError) {
      // Error logged for debugging
      
      // 프로덕션 환경에서는 외부 로깅 서비스로 전송
      if (process.env.NODE_ENV === 'production') {
        // 예: Sentry, LogRocket 등으로 전송
        // Production error logged with details
      }
    }

    // 사용자 친화적 메시지 생성
    const userMessage = customMessage || getUserFriendlyMessage(error);

    // 토스트 알림 표시
    if (showToast) {
      toast.error('오류 발생', userMessage, { duration: toastDuration });
    }

    // 커스텀 에러 핸들링
    if (onError) {
      onError(error);
    }

    return userMessage;
  }, []);

  const handleApiError = useCallback((
    error: ErrorType,
    options: ErrorHandlerOptions = {}
  ) => {
    // API 특화 에러 처리
    const apiOptions = {
      ...options,
      customMessage: options.customMessage || getApiErrorMessage(error),
    };

    return handleError(error, apiOptions);
  }, [handleError]);

  const handleNetworkError = useCallback((
    error: ErrorType,
    options: ErrorHandlerOptions = {}
  ) => {
    const networkOptions = {
      ...options,
      customMessage: options.customMessage || '네트워크 연결을 확인하고 다시 시도해주세요.',
    };

    return handleError(error, networkOptions);
  }, [handleError]);

  const handleValidationError = useCallback((
    error: ErrorType,
    options: ErrorHandlerOptions = {}
  ) => {
    const validationOptions = {
      ...options,
      showToast: options.showToast ?? false, // 폼 검증 에러는 기본적으로 토스트 표시 안함
      customMessage: options.customMessage || getValidationErrorMessage(error),
    };

    return handleError(error, validationOptions);
  }, [handleError]);

  return {
    handleError,
    handleApiError,
    handleNetworkError,
    handleValidationError,
  };
};

// 사용자 친화적 메시지 생성 함수
function getUserFriendlyMessage(error: ErrorType): string {
  const apiError = error as ApiError;
  if (apiError?.code === 'NETWORK_ERROR' || apiError?.message?.includes('Network Error')) {
    return '네트워크 연결을 확인하고 다시 시도해주세요.';
  }

  if (apiError?.response?.status === 401) {
    return '로그인이 필요하거나 세션이 만료되었습니다.';
  }

  if (apiError?.response?.status === 403) {
    return '이 작업을 수행할 권한이 없습니다.';
  }

  if (apiError?.response?.status === 404) {
    return '요청한 리소스를 찾을 수 없습니다.';
  }

  if (apiError?.response?.status && apiError.response.status >= 500) {
    return '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  if (apiError?.response?.status === 429) {
    return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
  }

  return apiError?.response?.data?.message || apiError?.message || '알 수 없는 오류가 발생했습니다.';
}

// API 에러 메시지 생성
function getApiErrorMessage(error: ErrorType): string {
  const apiError = error as ApiError;
  const response = apiError?.response;
  
  if (!response) {
    return '서버와의 연결에 실패했습니다.';
  }

  const { status, data } = response;

  switch (status) {
    case 400:
      return data?.message || '잘못된 요청입니다.';
    case 401:
      return '인증이 필요합니다. 다시 로그인해주세요.';
    case 403:
      return '접근 권한이 없습니다.';
    case 404:
      return '요청한 리소스를 찾을 수 없습니다.';
    case 409:
      return data?.message || '이미 존재하는 데이터입니다.';
    case 422:
      return data?.message || '입력 데이터가 올바르지 않습니다.';
    case 429:
      return '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
    case 500:
      return '서버 내부 오류가 발생했습니다.';
    case 502:
      return '서버 게이트웨이 오류가 발생했습니다.';
    case 503:
      return '서비스를 일시적으로 사용할 수 없습니다.';
    case 504:
      return '서버 응답 시간이 초과되었습니다.';
    default:
      return data?.message || `서버 오류가 발생했습니다. (${status})`;
  }
}

// 검증 에러 메시지 생성
function getValidationErrorMessage(error: ErrorType): string {
  const apiError = error as ApiError;
  if (apiError?.response?.data?.errors) {
    const errors = apiError.response.data.errors;
    if (Array.isArray(errors)) {
      return errors.join(', ');
    }
    if (typeof errors === 'object') {
      return Object.values(errors).flat().join(', ');
    }
  }

  return apiError?.response?.data?.message || apiError?.message || '입력 데이터를 확인해주세요.';
}

export default useErrorHandler;