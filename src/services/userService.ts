import { authApi } from '@/lib/httpClient';
import { BaseService } from './base';

// 공유 라이브러리 인터페이스 활용
import type {
  UserSearchQuery,
  UserSearchResult,
  UserDetail,
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
