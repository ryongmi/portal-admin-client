'use client';

import { useState, useEffect } from 'react';
import { useRoles } from '@/hooks/queries/roles';
import { useServices } from '@/hooks/queries/services';
import { useCreateRole, useUpdateRole, useDeleteRole } from '@/hooks/mutations/roles';
import { roleService } from '@/services/roleService';
import Layout from '@/components/layout/Layout';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Pagination from '@/components/common/Pagination';
import LoadingButton from '@/components/common/LoadingButton';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import RoleFormModal from '@/components/modals/RoleFormModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import RolePermissionModal from '@/components/modals/RolePermissionModal';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/components/common/ToastContainer';
import type {
  RoleDetail,
  RoleSearchResult,
  RoleSearchQuery,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '@/types';
import { SortOrderType } from '@krgeobuk/core/enum';

export default function RolesPage(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState<RoleSearchQuery>({});
  const [selectedRole, setSelectedRole] = useState<RoleDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');

  const debouncedName = useDebounce(nameInput, 500);
  const { handleApiError } = useErrorHandler();

  const { data: rolesData, isPending: isLoading, error } = useRoles(searchQuery);
  const roles = rolesData?.items ?? [];
  const pagination = rolesData?.pageInfo;

  const { data: servicesData } = useServices({});
  const services = servicesData?.items ?? [];

  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();

  useEffect(() => {
    const trimmed = debouncedName.trim();
    setSearchQuery((prev) => {
      const newQuery = { ...prev };
      if (trimmed) {
        newQuery.name = trimmed;
      } else {
        delete newQuery.name;
      }
      return newQuery;
    });
  }, [debouncedName]);

  const handleSearch = (query: RoleSearchQuery): void => {
    setSearchQuery(query);
  };

  const handlePageChange = (page: number): void => {
    setSearchQuery((prev) => ({ ...prev, page }));
  };

  const handleOpenModal = async (roleSearchResult?: RoleSearchResult): Promise<void> => {
    try {
      if (roleSearchResult) {
        const detail = await roleService.getRoleById(roleSearchResult.id);
        setSelectedRole(detail);
      } else {
        setSelectedRole(null);
      }
      setFormError(null);
      setIsModalOpen(true);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedRole(null);
    setFormError(null);
  };

  const handleSubmitRole = async (data: CreateRoleRequest | UpdateRoleRequest): Promise<void> => {
    try {
      setFormError(null);
      if (selectedRole?.id) {
        await updateRoleMutation.mutateAsync({ id: selectedRole.id, data: data as UpdateRoleRequest });
        toast.success('역할 수정 완료', '역할이 성공적으로 수정되었습니다.');
      } else {
        await createRoleMutation.mutateAsync(data as CreateRoleRequest);
        toast.success('역할 생성 완료', '새 역할이 성공적으로 생성되었습니다.');
      }
      handleCloseModal();
    } catch (err: unknown) {
      const errorMessage = handleApiError(err, { showToast: false });
      setFormError(errorMessage);
      throw err;
    }
  };

  const handleOpenDeleteModal = async (roleSearchResult: RoleSearchResult): Promise<void> => {
    try {
      const detail = await roleService.getRoleById(roleSearchResult.id);
      setSelectedRole(detail);
      setIsDeleteModalOpen(true);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleCloseDeleteModal = (): void => {
    setIsDeleteModalOpen(false);
    setSelectedRole(null);
  };

  const handleDeleteRole = async (): Promise<void> => {
    if (selectedRole?.id) {
      try {
        await deleteRoleMutation.mutateAsync(selectedRole.id);
        toast.success('역할 삭제 완료', '역할이 성공적으로 삭제되었습니다.');
        handleCloseDeleteModal();
      } catch (err) {
        handleApiError(err);
        throw err;
      }
    }
  };

  const handleOpenPermissionModal = async (roleSearchResult: RoleSearchResult): Promise<void> => {
    try {
      const detail = await roleService.getRoleById(roleSearchResult.id);
      setSelectedRole(detail);
      setIsPermissionModalOpen(true);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleClosePermissionModal = (): void => {
    setIsPermissionModalOpen(false);
    setSelectedRole(null);
  };

  const columns = [
    {
      key: 'name' as keyof RoleSearchResult,
      label: '역할명',
      sortable: true,
    },
    {
      key: 'description' as keyof RoleSearchResult,
      label: '설명',
      sortable: false,
      render: (value: RoleSearchResult[keyof RoleSearchResult]): string =>
        String(value || '설명 없음'),
    },
    {
      key: 'priority' as keyof RoleSearchResult,
      label: '우선순위',
      sortable: true,
    },
    {
      key: 'userCount' as keyof RoleSearchResult,
      label: '사용자 수',
      sortable: false,
      render: (value: RoleSearchResult[keyof RoleSearchResult]): string =>
        String(`${value || 0}명`),
    },
    {
      key: 'service' as keyof RoleSearchResult,
      label: '서비스',
      sortable: false,
      render: (value: RoleSearchResult[keyof RoleSearchResult]): JSX.Element => {
        const service = value as RoleSearchResult['service'];
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
            {service?.name || '알 수 없음'}
          </span>
        );
      },
    },
    {
      key: 'id' as keyof RoleSearchResult,
      label: '작업',
      sortable: false,
      render: (
        _value: RoleSearchResult[keyof RoleSearchResult],
        row: RoleSearchResult
      ): JSX.Element => (
        <div className="flex justify-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenModal(row)}>
            수정
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenPermissionModal(row)}
            className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
          >
            권한 관리
          </Button>
          <LoadingButton
            size="sm"
            variant="outline"
            onClick={() => handleOpenDeleteModal(row)}
            isLoading={deleteRoleMutation.isPending}
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
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">역할 관리</h1>
                <p className="text-white/80 mt-1">역할 목록을 조회하고 관리합니다.</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => handleOpenModal()}
              className="!bg-white !text-purple-700 hover:!bg-purple-50"
            >
              새 역할 추가
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">역할명</label>
              <input
                type="text"
                placeholder="역할명을 입력하세요"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">서비스</label>
              <select
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-gray-100"
                onChange={(e) => {
                  const value = e.target.value;
                  const newQuery: RoleSearchQuery = { ...searchQuery };
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
                  setNameInput('');
                  handleSearch({});
                }}
              >
                검색 초기화
              </Button>
            </div>
          </div>
        </div>

        {/* 테이블 */}
        <LoadingOverlay isLoading={isLoading} text="역할 목록을 불러오는 중...">
          <Table
            data={roles}
            columns={columns}
            loading={false}
            sortBy="name"
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

        {/* 역할 생성/수정 모달 */}
        <RoleFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitRole}
          role={selectedRole}
          services={services}
          isLoading={createRoleMutation.isPending || updateRoleMutation.isPending}
          error={formError}
          onErrorDismiss={() => setFormError(null)}
        />

        {/* 삭제 확인 모달 */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteRole}
          title="역할 삭제"
          message="정말로 이 역할을 삭제하시겠습니까?"
          {...(selectedRole?.name && { itemName: selectedRole.name })}
          isLoading={deleteRoleMutation.isPending}
        />

        {/* 권한 관리 모달 */}
        <RolePermissionModal
          isOpen={isPermissionModalOpen}
          onClose={handleClosePermissionModal}
          role={selectedRole}
        />
      </div>
    </Layout>
  );
}
