import { authApi } from '@/lib/httpClient';
import type { UserProfile } from '@krgeobuk/user/interfaces';
import { BaseService } from './base';

// 공유 라이브러리 인터페이스 활용
import type {
  UserSearchQuery,
  UserSearchResult,
  UserDetail,
  UpdateMyProfile,
  ChangePassword,
} from '@krgeobuk/user';
import type { PaginatedResult } from '@krgeobuk/core';
import type { User } from '@/types';

/**
 * 사용자 관리 Service
 *
 * 사용자 조회, 수정, 삭제 등을 담당
 */
export class UserService extends BaseService {
  /**
   * 사용자 목록 조회 (페이지네이션, 검색)
   */
  async getUsers(query: UserSearchQuery = {}): Promise<PaginatedResult<UserSearchResult>> {
    try {
      const response = await authApi.get<PaginatedResult<UserSearchResult>>('/users', {
        params: query,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 사용자 상세 조회
   */
  async getUserById(id: string): Promise<UserDetail> {
    try {
      const response = await authApi.get<UserDetail>(`/users/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 현재 사용자 정보 조회 (기본)
   */
  async getMe(): Promise<UserDetail> {
    try {
      const response = await authApi.get<UserDetail>('/users/me');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 통합 사용자 프로필 조회
   * - 기본 사용자 정보
   * - OAuth 정보 (구글/네이버 인증 여부)
   * - 권한 정보 (roles, permissions)
   * - 사용 가능한 서비스 목록
   */
  async getMyProfile(): Promise<UserProfile> {
    try {
      const response = await authApi.get<UserProfile>('/users/me');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 현재 사용자 프로필 수정
   */
  async updateMyProfile(profileData: UpdateMyProfile): Promise<void> {
    try {
      await authApi.patch<void>('/users/me', profileData);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 현재 사용자 비밀번호 변경
   */
  async changePassword(passwordData: ChangePassword): Promise<void> {
    try {
      await authApi.patch<void>('/users/me/password', passwordData);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 현재 사용자 계정 삭제
   */
  async deleteMyAccount(): Promise<void> {
    try {
      await authApi.delete<void>('/users/me');
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 관리자 기능: 사용자 생성
   */
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const response = await authApi.post<User>('/users', userData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 관리자 기능: 사용자 수정
   */
  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await authApi.patch<User>(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 관리자 기능: 사용자 삭제
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await authApi.delete<void>(`/users/${userId}`);
    } catch (error) {
      this.handleError(error);
    }
  }
}

// 싱글톤 인스턴스
export const userService = new UserService();
