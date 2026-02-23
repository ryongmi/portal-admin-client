import { portalApi } from '@/lib/httpClient';
import { BaseService } from './base';
import type {
  ServiceSearchResult,
  ServiceDetail,
  ServiceSearchQuery,
  CreateServiceRequest,
  UpdateServiceRequest,
} from '@/types';
import type { PaginatedResult } from '@krgeobuk/core/interfaces';

/**
 * 서비스 관리 Service
 *
 * 서비스 조회, 생성, 수정, 삭제 및 가시성 역할 관리
 */
export class ServiceService extends BaseService {
  /**
   * 서비스 목록 조회 (페이지네이션, 검색)
   */
  async getServices(query: ServiceSearchQuery = {}): Promise<PaginatedResult<ServiceSearchResult>> {
    try {
      const response = await portalApi.get<PaginatedResult<ServiceSearchResult>>('/services', {
        params: query,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 서비스 상세 조회
   */
  async getServiceById(serviceId: string): Promise<ServiceDetail> {
    try {
      const response = await portalApi.get<ServiceDetail>(`/services/${serviceId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 서비스 생성
   */
  async createService(serviceData: CreateServiceRequest): Promise<void> {
    try {
      await portalApi.post<void>('/services', serviceData);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 서비스 수정
   */
  async updateService(serviceId: string, serviceData: UpdateServiceRequest): Promise<void> {
    try {
      await portalApi.patch<void>(`/services/${serviceId}`, serviceData);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 서비스 삭제
   */
  async deleteService(serviceId: string): Promise<void> {
    try {
      await portalApi.delete<void>(`/services/${serviceId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 서비스에 가시성 역할 할당
   */
  async assignVisibleRoleToService(serviceId: string, roleId: string): Promise<void> {
    try {
      await portalApi.post<void>(`/services/${serviceId}/roles/${roleId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 서비스에서 가시성 역할 해제
   */
  async removeVisibleRoleFromService(serviceId: string, roleId: string): Promise<void> {
    try {
      await portalApi.delete<void>(`/services/${serviceId}/roles/${roleId}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 서비스에 다중 가시성 역할 할당
   */
  async assignMultipleVisibleRolesToService(serviceId: string, roleIds: string[]): Promise<void> {
    try {
      await portalApi.post<void>(`/services/${serviceId}/roles/batch`, { roleIds });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 서비스의 가시성 역할 완전 교체
   */
  async replaceServiceVisibleRoles(serviceId: string, roleIds: string[]): Promise<void> {
    try {
      await portalApi.put<void>(`/services/${serviceId}/roles`, { roleIds });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 서비스의 가시성 역할 목록 조회
   */
  async getServiceVisibleRoles(serviceId: string): Promise<string[]> {
    try {
      const response = await portalApi.get<string[]>(`/services/${serviceId}/roles`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

// 싱글톤 인스턴스
export const serviceService = new ServiceService();
