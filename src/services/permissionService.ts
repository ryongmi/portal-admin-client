import { authzApi, type ApiResponse } from "@/lib/httpClient";

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
  description?: string;
  serviceId: string;
}

interface UpdatePermissionRequest {
  action?: string;
  description?: string;
  serviceId?: string;
}

export class PermissionService {
  /**
   * 권한 목록 조회 (페이지네이션, 검색)
   */
  static async getPermissions(
    query: PermissionSearchQuery = {}
  ): Promise<ApiResponse<PaginatedResult<PermissionSearchResult>>> {
    const response = await authzApi.get<ApiResponse<PaginatedResult<PermissionSearchResult>>>(
      "/permissions",
      { params: query }
    );
    return response.data;
  }

  /**
   * 권한 상세 조회
   */
  static async getPermissionById(id: string): Promise<ApiResponse<PermissionDetail>> {
    const response = await authzApi.get<ApiResponse<PermissionDetail>>(`/permissions/${id}`);
    return response.data;
  }

  /**
   * 권한 생성
   */
  static async createPermission(
    permissionData: CreatePermissionRequest
  ): Promise<ApiResponse<PermissionDetail>> {
    const response = await authzApi.post<ApiResponse<PermissionDetail>>(
      "/permissions",
      permissionData
    );
    return response.data;
  }

  /**
   * 권한 수정
   */
  static async updatePermission(
    id: string,
    permissionData: UpdatePermissionRequest
  ): Promise<ApiResponse<PermissionDetail>> {
    const response = await authzApi.patch<ApiResponse<PermissionDetail>>(
      `/permissions/${id}`,
      permissionData
    );
    return response.data;
  }

  /**
   * 권한 삭제
   */
  static async deletePermission(id: string): Promise<ApiResponse<null>> {
    const response = await authzApi.delete<ApiResponse<null>>(`/permissions/${id}`);
    return response.data;
  }
}