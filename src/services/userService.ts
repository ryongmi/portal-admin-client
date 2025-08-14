import { authApi, type ApiResponse } from "@/lib/httpClient";
import type { UserProfile } from "@krgeobuk/user/interfaces";

// 공유 라이브러리 인터페이스 활용
import type { 
  UserSearchQuery,
  UserSearchResult,
  UserDetail,
  UpdateMyProfile,
  ChangePassword
} from "@krgeobuk/user";
import type { PaginatedResult } from "@krgeobuk/core";

export class UserService {
  /**
   * 사용자 목록 조회 (페이지네이션, 검색)
   */
  static async getUsers(
    query: UserSearchQuery = {}
  ): Promise<ApiResponse<PaginatedResult<UserSearchResult>>> {
    const response = await authApi.get<ApiResponse<PaginatedResult<UserSearchResult>>>(
      "/users",
      { params: query }
    );
    return response.data;
  }

  /**
   * 사용자 상세 조회
   */
  static async getUserById(id: string): Promise<ApiResponse<UserDetail>> {
    const response = await authApi.get<ApiResponse<UserDetail>>(`/users/${id}`);
    return response.data;
  }

  /**
   * 현재 사용자 정보 조회 (기본)
   */
  static async getMe(): Promise<ApiResponse<UserDetail>> {
    const response = await authApi.get<ApiResponse<UserDetail>>("/users/me");
    return response.data;
  }

  /**
   * 통합 사용자 프로필 조회
   * - 기본 사용자 정보
   * - OAuth 정보 (구글/네이버 인증 여부)
   * - 권한 정보 (roles, permissions)
   * - 사용 가능한 서비스 목록
   */
  static async getMyProfile(): Promise<ApiResponse<UserProfile>> {
    const response = await authApi.get<ApiResponse<UserProfile>>("/users/me");
    return response.data;
  }

  /**
   * 현재 사용자 프로필 수정
   */
  static async updateMyProfile(
    profileData: UpdateMyProfile
  ): Promise<ApiResponse<UserDetail>> {
    const response = await authApi.patch<ApiResponse<UserDetail>>(
      "/users/me",
      profileData
    );
    return response.data;
  }

  /**
   * 현재 사용자 비밀번호 변경
   */
  static async changePassword(
    passwordData: ChangePassword
  ): Promise<ApiResponse<null>> {
    const response = await authApi.patch<ApiResponse<null>>(
      "/users/me/password",
      passwordData
    );
    return response.data;
  }

  /**
   * 현재 사용자 계정 삭제
   */
  static async deleteMyAccount(): Promise<ApiResponse<null>> {
    const response = await authApi.delete<ApiResponse<null>>("/users/me");
    return response.data;
  }
}