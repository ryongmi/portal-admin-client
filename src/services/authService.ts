import { authApi, tokenManager, type ApiResponse } from "@/lib/httpClient";
import type { User } from "@/types";

export class AuthService {
  /**
   * 로그아웃
   */
  static async logout(): Promise<ApiResponse<null>> {
    const response = await authApi.post<ApiResponse<null>>("/auth/logout");

    // 토큰 제거
    tokenManager.clearAccessToken();

    return response.data;
  }

  /**
   * 클라이언트 초기화 (RefreshToken으로 AccessToken 및 사용자 정보 반환)
   * 페이지 로드 시 한 번만 호출하여 인증 상태 복원
   */
  static async initialize(): Promise<{ accessToken: string; user: User; isLogin: boolean }> {
    const response = await authApi.post<{ accessToken: string; user: User }>(
      "/auth/initialize"
    );

    const { accessToken, user } = response.data;
    const { isLogin } = response;

    // AccessToken을 TokenManager에 저장
    tokenManager.setAccessToken(accessToken);

    return { accessToken, user, isLogin };
  }

  /**
   * 현재 사용자 정보 조회
   */
  static async getCurrentUser(): Promise<User> {
    const response = await authApi.get<User>("/users/me");
    return response.data;
  }

  /**
   * 현재 로그인 상태 확인 (토큰 존재 여부)
   */
  static isLoggedIn(): boolean {
    const token = tokenManager.getAccessToken();
    return !!token && tokenManager.isValidToken(token);
  }

  /**
   * 토큰 갱신 (shared-lib에서 자동 처리되므로 백업용)
   */
  static async refreshToken(): Promise<string> {
    try {
      // shared-lib의 TokenManager를 통한 자동 갱신
      return await tokenManager.refreshToken();
    } catch (error) {
      // 갱신 실패 시 로그아웃 처리
      tokenManager.clearAccessToken();
      throw error;
    }
  }
}