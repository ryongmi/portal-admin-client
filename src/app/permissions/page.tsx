'use client';

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/queries/permissions';
import { useServices } from '@/hooks/queries/services';
import {
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
} from '@/hooks/mutations/permissions';
import { permissionService } from '@/services/permissionService';
import Layout from '@/components/layout/Layout';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Pagination from '@/components/common/Pagination';
import LoadingButton from '@/components/common/LoadingButton';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import PermissionFormModal from '@/components/modals/PermissionFormModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/components/common/ToastContainer';
import type {
  PermissionDetail,
  PermissionSearchResult,
  PermissionSearchQuery,
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from '@/types';
import { SortOrderType } from '@krgeobuk/core/enum';

export default function PermissionsPage(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState<PermissionSearchQuery>({});
  const [selectedPermission, setSelectedPermission] = useState<PermissionDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionInput, setActionInput] = useState('');

  const debouncedAction = useDebounce(actionInput, 500);
  const { handleApiError } = useErrorHandler();

  const { data: permissionsData, isPending: isLoading, error } = usePermissions(searchQuery);
  const permissions = permissionsData?.items ?? [];
  const pagination = permissionsData?.pageInfo;

  const { data: servicesData } = useServices({});
  const services = servicesData?.items ?? [];

  const createPermissionMutation = useCreatePermission();
  const updatePermissionMutation = useUpdatePermission();
  const deletePermissionMutation = useDeletePermission();

  useEffect(() => {
    const trimmed = debouncedAction.trim();
    setSearchQuery((prev) => {
      const newQuery = { ...prev };
      if (trimmed) {
        newQuery.action = trimmed;
      } else {
        delete newQuery.action;
      }
      return newQuery;
    });
  }, [debouncedAction]);

  const handleSearch = (query: PermissionSearchQuery): void => {
    setSearchQuery(query);
  };

  const handlePageChange = (page: number): void => {
    setSearchQuery((prev) => ({ ...prev, page }));
  };

  const handleOpenModal = async (
    permissionSearchResult?: PermissionSearchResult
  ): Promise<void> => {
    try {
      if (permissionSearchResult) {
        const detail = await permissionService.getPermissionById(permissionSearchResult.id);
        setSelectedPermission(detail);
      } else {
        setSelectedPermission(null);
      }
      setFormError(null);
      setIsModalOpen(true);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedPermission(null);
    setFormError(null);
  };

  const handleSubmitPermission = async (
    data: CreatePermissionRequest | UpdatePermissionRequest
  ): Promise<void> => {
    try {
      setFormError(null);
      if (selectedPermission?.id) {
        await updatePermissionMutation.mutateAsync({ id: selectedPermission.id, data: data as UpdatePermissionRequest });
        toast.success('권한 수정 완료', '권한이 성공적으로 수정되었습니다.');
      } else {
        await createPermissionMutation.mutateAsync(data as CreatePermissionRequest);
        toast.success('권한 생성 완료', '새 권한이 성공적으로 생성되었습니다.');
      }
      handleCloseModal();
    } catch (err: unknown) {
      const errorMessage = handleApiError(err, { showToast: false });
      setFormError(errorMessage);
      throw err;
    }
  };

  const handleOpenDeleteModal = async (
    permissionSearchResult: PermissionSearchResult
  ): Promise<void> => {
    try {
      const detail = await permissionService.getPermissionById(permissionSearchResult.id);
      setSelectedPermission(detail);
      setIsDeleteModalOpen(true);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleCloseDeleteModal = (): void => {
    setIsDeleteModalOpen(false);
    setSelectedPermission(null);
  };

  const handleDeletePermission = async (): Promise<void> => {
    if (selectedPermission?.id) {
      try {
        await deletePermissionMutation.mutateAsync(selectedPermission.id);
        toast.success('권한 삭제 완료', '권한이 성공적으로 삭제되었습니다.');
        handleCloseDeleteModal();
      } catch (err) {
        handleApiError(err);
        throw err;
      }
    }
  };

  const getActionBadgeColor = (action: string): string => {
    if (action.endsWith('.read')) return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700';
    if (action.endsWith('.write')) return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700';
    if (action.endsWith('.update')) return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700';
    if (action.endsWith('.delete')) return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700';
    return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600';
  };

  const columns = [
    {
      key: 'action' as keyof PermissionSearchResult,
      label: '액션',
      sortable: true,
      render: (value: PermissionSearchResult[keyof PermissionSearchResult]): JSX.Element => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionBadgeColor(value as string)}`}>
          {value as string}
        </span>
      ),
    },
    {
      key: 'description' as keyof PermissionSearchResult,
      label: '설명',
      sortable: false,
      render: (value: PermissionSearchResult[keyof PermissionSearchResult]): string =>
        String(value || '설명 없음'),
    },
    {
      key: 'roleCount' as keyof PermissionSearchResult,
      label: '역할 수',
      sortable: false,
      render: (value: PermissionSearchResult[keyof PermissionSearchResult]): string =>
        String(`${value || 0}개`),
    },
    {
      key: 'service' as keyof PermissionSearchResult,
      label: '서비스',
      sortable: false,
      render: (value: PermissionSearchResult[keyof PermissionSearchResult]): JSX.Element => {
        const service = value as PermissionSearchResult['service'];
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
            {service?.name || '알 수 없음'}
          </span>
        );
      },
    },
    {
      key: 'id' as keyof PermissionSearchResult,
      label: '작업',
      sortable: false,
      render: (
        _value: PermissionSearchResult[keyof PermissionSearchResult],
        row: PermissionSearchResult
      ): JSX.Element => (
        <div className="flex justify-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenModal(row)}>
            수정
          </Button>
          <LoadingButton
            size="sm"
            variant="outline"
            onClick={() => handleOpenDeleteModal(row)}
            isLoading={deletePermissionMutation.isPending}
            loadingText="삭제 중"
            className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            삭제
          </LoadingButton>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">권한 관리</h1>
                <p className="text-white/80 mt-1">권한 목록을 조회하고 관리합니다.</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => handleOpenModal()}
              className="!bg-white !text-green-700 hover:!bg-green-50"
            >
              새 권한 추가
            </Button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{String(error)}</p>
          </div>
        )}

        {/* 검색 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-600 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">액션</label>
              <input
                type="text"
                placeholder="액션을 입력하세요 (예: user.read)"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">서비스</label>
              <select
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 text-gray-900 dark:text-gray-100"
                onChange={(e) => {
                  const value = e.target.value;
                  const newQuery: PermissionSearchQuery = { ...searchQuery };
                  if (value !== '') {
                    newQuery.serviceId = value;
                  } else {
                    delete newQuery.serviceId;
                  }
                  handleSearch(newQuery);
                }}
              >
                <option value="">모든 서비스</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setActionInput('');
                  handleSearch({});
                }}
              >
                검색 초기화
              </Button>
            </div>
          </div>
        </div>

        {/* 테이블 */}
        <LoadingOverlay isLoading={isLoading} text="권한 목록을 불러오는 중...">
          <Table
            data={permissions}
            columns={columns}
            loading={false}
            sortBy="action"
            sortOrder={SortOrderType.DESC}
            onSort={(_column) => {}}
          />
        </LoadingOverlay>

        {/* 페이지네이션 */}
        <Pagination
          pageInfo={pagination}
          onPageChange={handlePageChange}
          onLimitChange={(limit) => handleSearch({ ...searchQuery, limit })}
        />

        {/* 권한 생성/수정 모달 */}
        <PermissionFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitPermission}
          permission={selectedPermission}
          services={services}
          isLoading={createPermissionMutation.isPending || updatePermissionMutation.isPending}
          error={formError}
          onErrorDismiss={() => setFormError(null)}
        />

        {/* 삭제 확인 모달 */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeletePermission}
          title="권한 삭제"
          message="정말로 이 권한을 삭제하시겠습니까?"
          {...(selectedPermission?.action && { itemName: selectedPermission.action })}
          isLoading={deletePermissionMutation.isPending}
        />
      </div>
    </Layout>
  );
}
