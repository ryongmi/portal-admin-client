import { HttpClient } from '@krgeobuk/http-client';
import type { ApiResponse } from '@krgeobuk/http-client/types';
import type { PaginatedResult } from '@krgeobuk/core/interfaces';
import type { AxiosRequestConfig } from 'axios';

// Type aliases for compatibility
export type PaginatedResponse<T> = PaginatedResult<T>;
export type { ApiResponse };

// HTTP 클라이언트 인스턴스 생성
export const httpClient = new HttpClient(
  {
    auth: {
      baseURL: process.env.NEXT_PUBLIC_AUTH_SERVER_URL!,
      withCredentials: true,
    },
    authz: {
      baseURL: process.env.NEXT_PUBLIC_AUTHZ_SERVER_URL!,
      withCredentials: true,
    },
    portal: {
      baseURL: process.env.NEXT_PUBLIC_PORTAL_SERVER_URL!,
      withCredentials: true,
    },
  },
  {
    refreshUrl: process.env.NEXT_PUBLIC_TOKEN_REFRESH_URL!,
    refreshBeforeExpiry: 5 * 60 * 1000, // 5분 전 갱신
  },
  {
    // 환경변수에서 허용된 오리진 읽기
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:8000',
      'http://localhost:3000',
      'http://localhost:3200',
    ],
    enableCSRF: true,
    enableInputValidation: true,
    enableSecurityLogging: true,
    rateLimitConfig: {
      maxAttempts: 100,
      windowMs: 60 * 1000, // 1분
    },
  }
);

// 토큰 매니저 접근자
export const tokenManager = httpClient.getTokenManager();

// 기존 API 인스턴스들을 대체하는 편의 함수들
export const authApi = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    httpClient.get<T>('auth', url, config),
  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => httpClient.post<T>('auth', url, data, config),
  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => httpClient.put<T>('auth', url, data, config),
  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => httpClient.patch<T>('auth', url, data, config),
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    httpClient.delete<T>('auth', url, config),
};

export const authzApi = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    httpClient.get<T>('authz', url, config),
  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => httpClient.post<T>('authz', url, data, config),
  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => httpClient.put<T>('authz', url, data, config),
  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => httpClient.patch<T>('authz', url, data, config),
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    httpClient.delete<T>('authz', url, config),
};

export const portalApi = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    httpClient.get<T>('portal', url, config),
  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => httpClient.post<T>('portal', url, data, config),
  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => httpClient.put<T>('portal', url, data, config),
  patch: <T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => httpClient.patch<T>('portal', url, data, config),
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> =>
    httpClient.delete<T>('portal', url, config),
};

// 기본 내보내기 (기존 방식과 호환)
export { httpClient as default };

