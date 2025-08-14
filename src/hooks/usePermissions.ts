import { useState, useCallback } from 'react';
import { PermissionService } from '@/services/permissionService';
import type { PermissionSearchQuery, PermissionSearchResult, PermissionDetail } from '@krgeobuk/permission';
import type { PaginatedResult } from '@krgeobuk/core';

interface CreatePermissionData {
  action: string;
  description?: string;
  serviceId: string;
}

interface UpdatePermissionData {
  action?: string;
  description?: string;
  serviceId?: string;
}

export function usePermissions(): {
  permissions: PermissionSearchResult[];
  loading: boolean;
  error: string | null;
  fetchPermissions: (query?: PermissionSearchQuery) => Promise<PaginatedResult<PermissionSearchResult>>;
  getPermissionById: (id: string) => Promise<PermissionDetail>;
  createPermission: (permissionData: CreatePermissionData) => Promise<PermissionDetail>;
  updatePermission: (id: string, permissionData: UpdatePermissionData) => Promise<PermissionDetail>;
  deletePermission: (id: string) => Promise<void>;
} {
  const [permissions, setPermissions] = useState<PermissionSearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async (query: PermissionSearchQuery = {}): Promise<PaginatedResult<PermissionSearchResult>> => {
    setLoading(true);
    setError(null);
    try {
      const response = await PermissionService.getPermissions(query);
      setPermissions(response.data.items);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '권한 목록 조회에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPermissionById = useCallback(async (id: string): Promise<PermissionDetail> => {
    setLoading(true);
    setError(null);
    try {
      const response = await PermissionService.getPermissionById(id);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '권한 상세 정보 조회에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPermission = useCallback(async (permissionData: CreatePermissionData): Promise<PermissionDetail> => {
    setLoading(true);
    setError(null);
    try {
      const response = await PermissionService.createPermission(permissionData);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '권한 생성에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePermission = useCallback(async (id: string, permissionData: UpdatePermissionData): Promise<PermissionDetail> => {
    setLoading(true);
    setError(null);
    try {
      const response = await PermissionService.updatePermission(id, permissionData);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '권한 수정에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePermission = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await PermissionService.deletePermission(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '권한 삭제에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    permissions,
    loading,
    error,
    fetchPermissions,
    getPermissionById,
    createPermission,
    updatePermission,
    deletePermission,
  };
}