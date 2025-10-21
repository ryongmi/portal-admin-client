/**
 * Service Layer 에러 클래스
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

/**
 * 중앙 집중식 에러 핸들러
 *
 * Axios 에러를 ServiceError로 변환하여 일관된 에러 처리 제공
 */
export class ErrorHandler {
  /**
   * Axios 에러를 ServiceError로 변환
   */
  static handleError(error: unknown): ServiceError {
    // Axios 에러 타입 처리
    const axiosError = error as {
      response?: {
        data?: { message?: string; code?: string };
        status?: number;
      };
      code?: string;
      message?: string;
    };

    const status = axiosError.response?.status || 0;
    const message =
      axiosError.response?.data?.message ||
      axiosError.message ||
      '요청 처리 중 오류가 발생했습니다';
    const code = axiosError.response?.data?.code || `HTTP_${status}`;

    // 재시도 가능한 에러 판단
    // - 5xx 서버 에러
    // - 408 Request Timeout
    // - 429 Too Many Requests
    const isRetryable = status >= 500 || status === 408 || status === 429;

    return new ServiceError(message, code, isRetryable);
  }

  /**
   * 네트워크 에러 확인
   */
  static isNetworkError(error: unknown): boolean {
    const axiosError = error as { code?: string };
    return (
      axiosError.code === 'ECONNABORTED' ||
      axiosError.code === 'ERR_NETWORK' ||
      axiosError.code === 'ECONNREFUSED'
    );
  }

  /**
   * 인증 에러 확인
   */
  static isAuthError(error: unknown): boolean {
    const axiosError = error as { response?: { status?: number } };
    return axiosError.response?.status === 401 || axiosError.response?.status === 403;
  }
}
