import { authzApi, type ApiResponse } from '@/lib/httpClient';

export class UserRoleService {
  /**
   * 사용자의 역할 ID 목록 조회
   */
  static async getUserRoles(userId: string): Promise<ApiResponse<string[]>> {
    const response = await authzApi.get<ApiResponse<string[]>>(`/users/${userId}/roles`);
    return response.data;
  }

  /**
   * 역할의 사용자 ID 목록 조회
   */
  static async getRoleUsers(roleId: string): Promise<ApiResponse<string[]>> {
    const response = await authzApi.get<ApiResponse<string[]>>(`/roles/${roleId}/users`);
    return response.data;
  }

  /**
   * 사용자-역할 관계 존재 확인
   */
  static async checkUserRoleExists(userId: string, roleId: string): Promise<ApiResponse<boolean>> {
    const response = await authzApi.get<ApiResponse<boolean>>(`/users/${userId}/roles/${roleId}/exists`);
    return response.data;
  }

  /**
   * 사용자에게 역할 할당
   */
  static async assignUserRole(userId: string, roleId: string): Promise<ApiResponse<null>> {
    const response = await authzApi.post<ApiResponse<null>>(`/users/${userId}/roles/${roleId}`);
    return response.data;
  }

  /**
   * 사용자 역할 해제
   */
  static async revokeUserRole(userId: string, roleId: string): Promise<ApiResponse<null>> {
    const response = await authzApi.delete<ApiResponse<null>>(`/users/${userId}/roles/${roleId}`);
    return response.data;
  }

  /**
   * 사용자에게 여러 역할 할당
   */
  static async assignMultipleRoles(userId: string, roleIds: string[]): Promise<ApiResponse<null>> {
    const response = await authzApi.post<ApiResponse<null>>(`/users/${userId}/roles/batch`, { roleIds });
    return response.data;
  }

  /**
   * 사용자에게서 여러 역할 해제
   */
  static async revokeMultipleRoles(userId: string, roleIds: string[]): Promise<ApiResponse<null>> {
    const response = await authzApi.delete<ApiResponse<null>>(`/users/${userId}/roles/batch`, {
      data: { roleIds }
    });
    return response.data;
  }

  /**
   * 사용자 역할 완전 교체
   */
  static async replaceUserRoles(userId: string, roleIds: string[]): Promise<ApiResponse<null>> {
    const response = await authzApi.put<ApiResponse<null>>(`/users/${userId}/roles`, { roleIds });
    return response.data;
  }
}