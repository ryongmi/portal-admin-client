import { authzApi, type ApiResponse } from "@/lib/httpClient";

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
  description?: string;
  priority: number;
  serviceId: string;
}

interface UpdateRoleRequest {
  name?: string;
  description?: string;
  priority?: number;
  serviceId?: string;
}

export class RoleService {
  /**
   * 역할 목록 조회 (페이지네이션, 검색)
   */
  static async getRoles(
    query: RoleSearchQuery = {}
  ): Promise<ApiResponse<PaginatedResult<RoleSearchResult>>> {
    const response = await authzApi.get<ApiResponse<PaginatedResult<RoleSearchResult>>>(
      "/roles",
      { params: query }
    );
    return response.data;
  }

  /**
   * 역할 상세 조회
   */
  static async getRoleById(id: string): Promise<ApiResponse<RoleDetail>> {
    const response = await authzApi.get<ApiResponse<RoleDetail>>(`/roles/${id}`);
    return response.data;
  }

  /**
   * 역할 생성
   */
  static async createRole(
    roleData: CreateRoleRequest
  ): Promise<ApiResponse<RoleDetail>> {
    const response = await authzApi.post<ApiResponse<RoleDetail>>(
      "/roles",
      roleData
    );
    return response.data;
  }

  /**
   * 역할 수정
   */
  static async updateRole(
    id: string,
    roleData: UpdateRoleRequest
  ): Promise<ApiResponse<RoleDetail>> {
    const response = await authzApi.patch<ApiResponse<RoleDetail>>(
      `/roles/${id}`,
      roleData
    );
    return response.data;
  }

  /**
   * 역할 삭제
   */
  static async deleteRole(id: string): Promise<ApiResponse<null>> {
    const response = await authzApi.delete<ApiResponse<null>>(`/roles/${id}`);
    return response.data;
  }
}