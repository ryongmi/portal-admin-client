import { authzApi } from "@/lib/httpClient";
import { BaseService } from "./base";

// 공유 라이브러리 인터페이스 활용
import type {
  RoleSearchQuery,
  RoleSearchResult,
  RoleDetail
} from "@krgeobuk/role";
import type { PaginatedResult } from "@krgeobuk/core";

// 역할 생성/수정을 위한 타입 정의
interface CreateRoleRequest {
  name: string;
  description?: string | null;
  priority: number;
  serviceId: string;
}

interface UpdateRoleRequest {
  name?: string;
  description?: string | null;
  priority?: number;
  serviceId?: string;
}

/**
 * 역할 관리 Service
 *
 * 역할 조회, 생성, 수정, 삭제 등을 담당
 */
export class RoleService extends BaseService {
  /**
   * 역할 목록 조회 (페이지네이션, 검색)
   */
  async getRoles(
    query: RoleSearchQuery = {}
  ): Promise<PaginatedResult<RoleSearchResult>> {
    try {
      const response = await authzApi.get<PaginatedResult<RoleSearchResult>>(
        "/roles",
        { params: query }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 역할 상세 조회
   */
  async getRoleById(id: string): Promise<RoleDetail> {
    try {
      const response = await authzApi.get<RoleDetail>(`/roles/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 역할 생성
   */
  async createRole(
    roleData: CreateRoleRequest
  ): Promise<RoleDetail> {
    try {
      const response = await authzApi.post<RoleDetail>(
        "/roles",
        roleData
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 역할 수정
   */
  async updateRole(
    id: string,
    roleData: UpdateRoleRequest
  ): Promise<RoleDetail> {
    try {
      const response = await authzApi.patch<RoleDetail>(
        `/roles/${id}`,
        roleData
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 역할 삭제
   */
  async deleteRole(id: string): Promise<void> {
    try {
      await authzApi.delete<void>(`/roles/${id}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 사용자에게 역할 할당
   */
  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    try {
      await authzApi.post<void>(`/users/${userId}/roles/${roleId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 사용자에게서 역할 해제
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    try {
      await authzApi.delete<void>(`/users/${userId}/roles/${roleId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 사용자에게 다중 역할 할당
   */
  async assignMultipleRolesToUser(userId: string, roleIds: string[]): Promise<void> {
    try {
      await authzApi.post<void>(`/users/${userId}/roles/batch`, { roleIds });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 사용자의 역할 완전 교체
   */
  async replaceUserRoles(userId: string, roleIds: string[]): Promise<void> {
    try {
      await authzApi.put<void>(`/users/${userId}/roles`, { roleIds });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 사용자의 역할 ID 목록 조회
   */
  async getUserRoles(userId: string): Promise<string[]> {
    try {
      const response = await authzApi.get<string[]>(`/users/${userId}/roles`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 사용자에게 역할 할당
   */
  async assignUserRole(userId: string, roleId: string): Promise<null> {
    try {
      const response = await authzApi.post<null>(`/users/${userId}/roles/${roleId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 사용자 역할 해제
   */
  async revokeUserRole(userId: string, roleId: string): Promise<null> {
    try {
      const response = await authzApi.delete<null>(`/users/${userId}/roles/${roleId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

// 싱글톤 인스턴스
export const roleService = new RoleService();
