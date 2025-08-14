'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchPermissions,
  clearError,
} from '@/store/slices/permissionSlice';
// assignPermissionToRole, removePermissionFromRole, replaceRolePermissions available if needed
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import LoadingButton from '@/components/common/LoadingButton';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { toast } from '@/components/common/ToastContainer';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import type { RoleDetail, PermissionSearchResult, PermissionDetail } from '@/types';
import { RolePermissionService } from '@/services/rolePermissionService';

// PermissionSearchResult를 PermissionDetail로 안전하게 변환하는 함수
const _convertToPermissionDetail = (permission: PermissionSearchResult): PermissionDetail => ({
  id: permission.id,
  action: permission.action,
  description: permission.description,
  service: permission.service,
  roles: [], // PermissionSearchResult에는 roles 정보가 없으므로 빈 배열로 초기화
  createdAt: new Date(),
  updatedAt: new Date(),
});

interface RolePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: RoleDetail | null;
}

const RolePermissionModal = memo<RolePermissionModalProps>(function RolePermissionModal({
  isOpen,
  onClose,
  role,
}) {
  const dispatch = useAppDispatch();
  const { permissions, isLoading, error } = useAppSelector((state) => state.permission);

  // 로컬 상태
  const [currentRolePermissions, setCurrentRolePermissions] = useState<PermissionDetail[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [permissionSearch, setPermissionSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('');

  // 로딩 상태 관리
  const { isLoading: isActionsLoading, withLoading } = useLoadingState();

  // 에러 핸들러
  const { handleApiError } = useErrorHandler();

  // 권한 데이터 로드
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchPermissions({}));
    }
  }, [isOpen, dispatch]);

  // 권한 목록이 로드된 후 역할 권한 로드
  useEffect(() => {
    if (isOpen && role && permissions.length > 0) {
      loadRolePermissions(role.id!);
    }
  }, [isOpen, role, permissions]);

  // PermissionSearchResult를 PermissionDetail로 변환하는 헬퍼 함수
  const _convertToPermissionDetailCallback = useCallback((searchResult: PermissionSearchResult): PermissionDetail => {
    return {
      id: searchResult.id,
      action: searchResult.action,
      description: searchResult.description,
      service: searchResult.service,
      roles: [], // PermissionSearchResult에는 roles 정보가 없으므로 빈 배열로 초기화
    };
  }, []);

  // 역할의 현재 권한 로드
  const loadRolePermissions = async (roleId: string): Promise<void> => {
    try {
      const response = await RolePermissionService.getRolePermissions(roleId);
      const permissionIds = response.data || [];
      
      // 권한 ID 목록을 기반으로 실제 권한 정보 매핑 및 타입 변환
      const rolePermissions = permissions
        .filter(p => permissionIds.includes(p.id!))
        .map(_convertToPermissionDetail);
      
      setCurrentRolePermissions(rolePermissions);
      setSelectedPermissions(new Set(permissionIds));
    } catch (error) {
      handleApiError(error);
    }
  };

  // 서비스별 권한 그룹화
  const groupedPermissions = useMemo(() => {
    const filtered = permissions.filter(permission => {
      const matchesSearch = permission.action.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                           permission.description?.toLowerCase().includes(permissionSearch.toLowerCase());
      const matchesService = !serviceFilter || permission.service?.id === serviceFilter;
      return matchesSearch && matchesService;
    });

    return filtered.reduce((acc, permission) => {
      const serviceName = permission.service?.name || '알 수 없는 서비스';
      if (!acc[serviceName]) {
        acc[serviceName] = [];
      }
      acc[serviceName].push(permission);
      return acc;
    }, {} as Record<string, PermissionSearchResult[]>);
  }, [permissions, permissionSearch, serviceFilter]);

  // 사용 가능한 서비스 목록
  const availableServices = useMemo(() => {
    const services = permissions.reduce((acc, permission) => {
      if (permission.service && permission.service.name && !acc.find(s => s.id === permission.service!.id)) {
        acc.push({ id: permission.service.id, name: permission.service.name });
      }
      return acc;
    }, [] as Array<{ id: string; name: string }>);
    return services.sort((a, b) => a.name.localeCompare(b.name));
  }, [permissions]);

  // 권한 선택/해제 (useCallback으로 최적화)
  const handlePermissionToggle = useCallback((permissionId: string) => {
    setSelectedPermissions(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(permissionId)) {
        newSelected.delete(permissionId);
      } else {
        newSelected.add(permissionId);
      }
      return newSelected;
    });
  }, []);

  // 서비스별 전체 선택/해제 (useCallback으로 최적화)
  const handleServiceToggle = useCallback((serviceName: string) => {
    const servicePermissions = groupedPermissions[serviceName];
    if (!servicePermissions) return;
    const allSelected = servicePermissions.every(p => selectedPermissions.has(p.id!));
    
    setSelectedPermissions(prev => {
      const newSelected = new Set(prev);
      if (allSelected) {
        servicePermissions?.forEach(p => newSelected.delete(p.id!));
      } else {
        servicePermissions?.forEach(p => newSelected.add(p.id!));
      }
      return newSelected;
    });
  }, [groupedPermissions, selectedPermissions]);

  // 전체 선택/해제
  const handleSelectAll = (): void => {
    const allPermissionIds = Object.values(groupedPermissions)
      .flat()
      .map(p => p.id!);
    const allSelected = allPermissionIds.every(id => selectedPermissions.has(id));
    
    if (allSelected) {
      setSelectedPermissions(new Set());
    } else {
      setSelectedPermissions(new Set(allPermissionIds));
    }
  };

  // 변경사항 저장
  const handleSave = withLoading('save', async () => {
    if (!role) return;

    try {
      const newPermissionIds = Array.from(selectedPermissions);
      await RolePermissionService.replaceRolePermissions(role.id!, newPermissionIds);

      toast.success('권한 업데이트 완료', `${role.name} 역할의 권한이 성공적으로 업데이트되었습니다.`);
      onClose();
    } catch (error) {
      handleApiError(error);
    }
  });

  // 모달 닫기
  const handleClose = (): void => {
    setPermissionSearch('');
    setServiceFilter('');
    setSelectedPermissions(new Set());
    setCurrentRolePermissions([]);
    dispatch(clearError());
    onClose();
  };

  // 에러 처리
  useEffect(() => {
    if (error) {
      // Permission error logged for debugging
      setTimeout(() => dispatch(clearError()), 5000);
    }
  }, [error, dispatch]);

  if (!role) return <></>;

  const currentPermissionIds = new Set(currentRolePermissions.map(p => p.id!));
  const hasChanges = 
    selectedPermissions.size !== currentPermissionIds.size ||
    Array.from(selectedPermissions).some(id => !currentPermissionIds.has(id));

  const totalPermissions = Object.values(groupedPermissions).flat().length;
  const selectedCount = selectedPermissions.size;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      size="xl"
    >
      <div className="relative -mx-6 -mt-6">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                권한 관리
              </h3>
              <p className="text-white/80 text-sm mt-1">
                <span className="font-medium">{role.name}</span> 역할의 권한을 관리합니다
              </p>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* 통계 정보 */}
        <div className="mx-6 mt-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{selectedCount}</div>
                <div className="text-sm text-gray-600">선택된 권한</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalPermissions}</div>
                <div className="text-sm text-gray-600">전체 권한</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{Object.keys(groupedPermissions).length}</div>
                <div className="text-sm text-gray-600">서비스</div>
              </div>
            </div>
            {hasChanges && (
              <div className="flex items-center space-x-2 text-orange-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-sm font-medium">변경사항이 있습니다</span>
              </div>
            )}
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="mx-6 mt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">권한 검색</label>
              <input
                type="text"
                placeholder="권한명이나 설명을 검색하세요..."
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">서비스 필터</label>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">모든 서비스</option>
                {availableServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSelectAll}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              {selectedCount === totalPermissions ? '전체 해제' : '전체 선택'}
            </Button>
          </div>
        </div>

        {/* 권한 목록 */}
        <div className="mx-6 mt-4 max-h-96 overflow-y-auto">
          <LoadingOverlay isLoading={isLoading} text="권한 목록을 불러오는 중...">
            {Object.keys(groupedPermissions).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {permissionSearch || serviceFilter ? '검색 조건에 맞는 권한이 없습니다.' : '사용 가능한 권한이 없습니다.'}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {Object.entries(groupedPermissions).map(([serviceName, servicePermissions]) => {
                  const allSelected = servicePermissions.every(p => selectedPermissions.has(p.id!));
                  const someSelected = servicePermissions.some(p => selectedPermissions.has(p.id!));

                  return (
                    <div key={serviceName} className="border-b border-gray-100 last:border-b-0">
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            allSelected ? 'bg-blue-100' : someSelected ? 'bg-yellow-100' : 'bg-gray-100'
                          }`}>
                            <svg className={`w-4 h-4 ${
                              allSelected ? 'text-blue-600' : someSelected ? 'text-yellow-600' : 'text-gray-600'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{serviceName}</h4>
                            <p className="text-xs text-gray-500">
                              {servicePermissions.filter(p => selectedPermissions.has(p.id!)).length} / {servicePermissions.length} 권한 선택됨
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleServiceToggle(serviceName)}
                          className={`${
                            allSelected 
                              ? 'text-red-600 border-red-300 hover:bg-red-50' 
                              : 'text-blue-600 border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {allSelected ? '전체 해제' : '전체 선택'}
                        </Button>
                      </div>
                      <div className="p-3 space-y-2">
                        {servicePermissions.map((permission) => (
                          <label key={permission.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-all">
                            <input
                              type="checkbox"
                              checked={selectedPermissions.has(permission.id!)}
                              onChange={() => handlePermissionToggle(permission.id!)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">{permission.action.split(':')[0]}</span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                  {permission.action.split(':')[1]}
                                </span>
                              </div>
                              {permission.description && (
                                <div className="text-sm text-gray-500 mt-1">{permission.description}</div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </LoadingOverlay>
        </div>

        {/* 액션 버튼 */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-100 mt-4">
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isActionsLoading('save')}
            >
              취소
            </Button>
            <LoadingButton
              onClick={handleSave}
              isLoading={isActionsLoading('save')}
              loadingText="저장 중..."
              disabled={!hasChanges}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
            >
              권한 저장
            </LoadingButton>
          </div>
        </div>
      </div>
    </Modal>
  );
});

RolePermissionModal.displayName = 'RolePermissionModal';

export default RolePermissionModal;