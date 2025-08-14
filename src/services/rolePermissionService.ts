import { authzApi, type ApiResponse } from "@/lib/httpClient";

// 공유 라이브러리 인터페이스 활용
// Permission types available if needed

// 역할-권한 관계 관리를 위한 타입 정의
// Request interfaces defined but not used in current implementation

export class RolePermissionService {
  /**
   * 역할의 권한 ID 목록 조회
   */
  static async getRolePermissions(roleId: string): Promise<ApiResponse<string[]>> {
    const response = await authzApi.get<ApiResponse<string[]>>(
      `/roles/${roleId}/permissions`
    );
    return response.data;
  }

  /**
   * 역할에 권한 할당
   */
  static async assignPermissionToRole(
    roleId: string,
    permissionId: string
  ): Promise<ApiResponse<null>> {
    const response = await authzApi.post<ApiResponse<null>>(
      `/roles/${roleId}/permissions/${permissionId}`
    );
    return response.data;
  }

  /**
   * 역할에서 권한 제거
   */
  static async removePermissionFromRole(
    roleId: string,
    permissionId: string
  ): Promise<ApiResponse<null>> {
    const response = await authzApi.delete<ApiResponse<null>>(
      `/roles/${roleId}/permissions/${permissionId}`
    );
    return response.data;
  }

  /**
   * 역할-권한 관계 존재 확인
   */
  static async checkRolePermissionExists(
    roleId: string,
    permissionId: string
  ): Promise<ApiResponse<boolean>> {
    const response = await authzApi.get<ApiResponse<boolean>>(
      `/roles/${roleId}/permissions/${permissionId}/exists`
    );
    return response.data;
  }

  /**
   * 역할에 여러 권한 할당 (배치)
   */
  static async assignMultiplePermissionsToRole(
    roleId: string,
    permissionIds: string[]
  ): Promise<ApiResponse<null>> {
    const response = await authzApi.post<ApiResponse<null>>(
      `/roles/${roleId}/permissions/batch`,
      { permissionIds }
    );
    return response.data;
  }

  /**
   * 역할에서 여러 권한 해제 (배치)
   */
  static async removeMultiplePermissionsFromRole(
    roleId: string,
    permissionIds: string[]
  ): Promise<ApiResponse<null>> {
    const response = await authzApi.delete<ApiResponse<null>>(
      `/roles/${roleId}/permissions/batch`,
      { data: { permissionIds } }
    );
    return response.data;
  }

  /**
   * 역할 권한 완전 교체
   */
  static async replaceRolePermissions(
    roleId: string,
    permissionIds: string[]
  ): Promise<ApiResponse<null>> {
    const response = await authzApi.put<ApiResponse<null>>(
      `/roles/${roleId}/permissions`,
      { permissionIds }
    );
    return response.data;
  }
}