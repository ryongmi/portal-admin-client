import { authzApi } from "@/lib/httpClient";
import { BaseService } from "./base";

// 공유 라이브러리 인터페이스 활용
import type {
  PermissionSearchQuery,
  PermissionSearchResult,
  PermissionDetail
} from "@krgeobuk/permission";
import type { PaginatedResult } from "@krgeobuk/core";

// 권한 생성/수정을 위한 타입 정의
interface CreatePermissionRequest {
  action: string;
  description?: string | null;
  serviceId: string;
}

interface UpdatePermissionRequest {
  action?: string;
  description?: string | null;
  serviceId?: string;
}

/**
 * 권한 관리 Service
 *
 * 권한 조회, 생성, 수정, 삭제 등을 담당
 */
export class PermissionService extends BaseService {
  /**
   * 권한 목록 조회 (페이지네이션, 검색)
   */
  async getPermissions(
    query: PermissionSearchQuery = {}
  ): Promise<PaginatedResult<PermissionSearchResult>> {
    try {
      const response = await authzApi.get<PaginatedResult<PermissionSearchResult>>(
        "/permissions",
        { params: query }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 권한 상세 조회
   */
  async getPermissionById(id: string): Promise<PermissionDetail> {
    try {
      const response = await authzApi.get<PermissionDetail>(`/permissions/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 권한 생성
   */
  async createPermission(
    permissionData: CreatePermissionRequest
  ): Promise<PermissionDetail> {
    try {
      const response = await authzApi.post<PermissionDetail>(
        "/permissions",
        permissionData
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 권한 수정
   */
  async updatePermission(
    id: string,
    permissionData: UpdatePermissionRequest
  ): Promise<PermissionDetail> {
    try {
      const response = await authzApi.patch<PermissionDetail>(
        `/permissions/${id}`,
        permissionData
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 권한 삭제
   */
  async deletePermission(id: string): Promise<void> {
    try {
      await authzApi.delete<void>(`/permissions/${id}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 사용자 권한 확인
   */
  async checkUserPermission(checkData: { userId: string; action: string; serviceId?: string }): Promise<{ hasPermission: boolean }> {
    try {
      const response = await authzApi.post<{ hasPermission: boolean }>(
        '/authorization/check-permission',
        checkData
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 사용자의 권한 목록 조회
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const response = await authzApi.get<string[]>(
        `/authorization/users/${userId}/permissions`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 역할에 권한 할당
   */
  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    try {
      await authzApi.post<void>(`/roles/${roleId}/permissions/${permissionId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 역할에서 권한 해제
   */
  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    try {
      await authzApi.delete<void>(`/roles/${roleId}/permissions/${permissionId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 역할에 다중 권한 할당
   */
  async assignMultiplePermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    try {
      await authzApi.post<void>(`/roles/${roleId}/permissions/batch`, {
        permissionIds,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 역할의 권한 완전 교체
   */
  async replaceRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    try {
      await authzApi.put<void>(`/roles/${roleId}/permissions`, { permissionIds });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 역할의 권한 ID 목록 조회
   */
  async getRolePermissions(roleId: string): Promise<string[]> {
    try {
      const response = await authzApi.get<string[]>(`/roles/${roleId}/permissions`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

// 싱글톤 인스턴스
export const permissionService = new PermissionService();
