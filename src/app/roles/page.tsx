'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchRoles,
  fetchRoleById,
  createRole,
  updateRole,
  deleteRole,
  setSelectedRole,
  clearError,
} from '@/store/slices/roleSlice';
import { fetchServices } from '@/store/slices/serviceSlice';
import Layout from '@/components/layout/Layout';
import AdminAuthGuard from '@/components/auth/AdminAuthGuard';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Pagination from '@/components/common/Pagination';
import LoadingButton from '@/components/common/LoadingButton';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { TableRowSkeleton } from '@/components/common/SkeletonLoader';
import FormField, { Input, Textarea, Select } from '@/components/common/FormField';
import { ApiErrorMessage } from '@/components/common/ErrorMessage';
import RolePermissionModal from '@/components/modals/RolePermissionModal';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useDebounce } from '@/hooks/useDebounce';
import { mapServerErrorsToFormErrors } from '@/utils/formValidation';
import { toast } from '@/components/common/ToastContainer';
import type {
  RoleDetail,
  RoleSearchResult,
  RoleSearchQuery,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '@/types';
import { SortOrderType } from '@krgeobuk/core/enum';

export default function ReduxRolesPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const { roles, selectedRole, isLoading, error, pagination } = useAppSelector(
    (state) => state.role
  );
  const { services } = useAppSelector((state) => state.service);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<RoleSearchQuery>({});
  const [formError, setFormError] = useState<string | null>(null);

  // 디바운싱을 위한 로컬 입력 상태
  const [nameInput, setNameInput] = useState('');

  // 디바운싱된 값 (500ms 지연)
  const debouncedName = useDebounce(nameInput, 500);

  // 로딩 상태 관리
  const { isLoading: isActionsLoading, withLoading } = useLoadingState();

  // 에러 핸들러
  const { handleApiError } = useErrorHandler();

  // React Hook Form 설정
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<{
    name: string;
    description?: string | null;
    priority: number;
    serviceId: string;
  }>({
    defaultValues: {
      name: '',
      description: '',
      priority: 1,
      serviceId: '',
    },
    mode: 'onChange',
  });

  // 초기 데이터 로드
  useEffect(() => {
    dispatch(fetchRoles({}));
    dispatch(fetchServices({}));
  }, [dispatch]);

  // 에러 처리
  useEffect(() => {
    if (error) {
      // Error logged for debugging
      setTimeout(() => dispatch(clearError()), 5000);
    }
  }, [error, dispatch]);

  // 디바운싱된 name 값이 변경되면 검색 실행
  useEffect(() => {
    const trimmedValue = debouncedName.trim();
    const newQuery = {
      ...searchQuery,
      name: trimmedValue === '' ? undefined : trimmedValue,
    };
    setSearchQuery(newQuery);
    dispatch(fetchRoles(newQuery));
  }, [debouncedName, dispatch]);

  // 검색 처리 (useCallback으로 최적화)
  const handleSearch = useCallback((query: RoleSearchQuery): void => {
    setSearchQuery(query);
    dispatch(fetchRoles(query));
  }, [dispatch]);

  // 페이지 변경 처리 (useCallback으로 최적화)
  const handlePageChange = useCallback((page: number): void => {
    dispatch(fetchRoles({ ...searchQuery, page }));
  }, [dispatch, searchQuery]);

  // 모달 열기
  const handleOpenModal = async (roleSearchResult?: RoleSearchResult): Promise<void> => {
    try {
      if (roleSearchResult) {
        // 상세 데이터 API 호출
        const fullRoleData: RoleDetail = await dispatch(
          fetchRoleById(roleSearchResult.id)
        ).unwrap();

        // 전체 데이터로 폼 초기화
        reset({
          name: fullRoleData.name,
          description: fullRoleData.description || '',
          priority: fullRoleData.priority || 1,
          serviceId: fullRoleData.service?.id || '',
        });
      } else {
        dispatch(setSelectedRole(null));
        reset({
          name: '',
          description: '',
          priority: 1,
          serviceId: '',
        });
      }
      setFormError(null);
      setIsModalOpen(true);
    } catch (error) {
      handleApiError(error);
    }
  };

  // 모달 닫기 (useCallback으로 최적화)
  const handleCloseModal = useCallback((): void => {
    setIsModalOpen(false);
    dispatch(setSelectedRole(null));
    setFormError(null);
    reset();
  }, [dispatch, reset]);

  // 역할 저장
  const onSubmit = withLoading(
    'save',
    async (data: { name: string; description?: string | null; priority: number; serviceId: string }) => {
      try {
        setFormError(null);

        if (selectedRole) {
          const updateData: UpdateRoleRequest = {
            name: data.name,
            priority: data.priority,
            description: data.description && data.description.trim() ? data.description.trim() : null,
          };
          await dispatch(updateRole({ roleId: selectedRole.id!, roleData: updateData })).unwrap();

          toast.success('역할 수정 완료', '역할이 성공적으로 수정되었습니다.');
        } else {
          const createData: CreateRoleRequest = {
            name: data.name,
            priority: data.priority,
            serviceId: data.serviceId,
            ...(data.description && data.description.trim() && { description: data.description.trim() }),
          };
          await dispatch(createRole(createData)).unwrap();

          toast.success('역할 생성 완료', '새 역할이 성공적으로 생성되었습니다.');
        }

        handleCloseModal();
        dispatch(fetchRoles(searchQuery));
      } catch (error: unknown) {
        // 서버 에러를 폼 에러로 매핑
        const formErrors = mapServerErrorsToFormErrors(
          (error as { response?: { data?: { errors?: Record<string, string> } } })?.response?.data?.errors || {}
        );

        // 각 필드별 에러 설정
        Object.keys(formErrors).forEach((field) => {
          if (
            field === 'name' ||
            field === 'description' ||
            field === 'priority' ||
            field === 'serviceId'
          ) {
            const errorMessage = formErrors[field];
            if (errorMessage) {
              const message =
                typeof errorMessage === 'string'
                  ? errorMessage
                  : errorMessage.message || 'Invalid input';
              setError(field as keyof typeof data, { type: 'server', message });
            }
          }
        });

        // 일반적인 에러 메시지 설정
        const errorMessage = handleApiError(error as Error, { showToast: false });
        setFormError(errorMessage);
      }
    }
  );

  // 삭제 모달 열기
  const handleOpenDeleteModal = async (roleSearchResult: RoleSearchResult): Promise<void> => {
    try {
      // 상세 데이터 API 호출
      await dispatch(fetchRoleById(roleSearchResult.id)).unwrap();
      setIsDeleteModalOpen(true);
    } catch (error) {
      handleApiError(error);
    }
  };

  // 삭제 모달 닫기 (useCallback으로 최적화)
  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    dispatch(setSelectedRole(null));
  }, [dispatch]);

  // 권한 관리 모달 열기
  const handleOpenPermissionModal = async (roleSearchResult: RoleSearchResult): Promise<void> => {
    try {
      // 상세 데이터 API 호출
      await dispatch(fetchRoleById(roleSearchResult.id)).unwrap();
      setIsPermissionModalOpen(true);
    } catch (error) {
      handleApiError(error);
    }
  };

  // 권한 관리 모달 닫기 (useCallback으로 최적화)
  const handleClosePermissionModal = useCallback(() => {
    setIsPermissionModalOpen(false);
    dispatch(setSelectedRole(null));
  }, [dispatch]);

  // 역할 삭제
  const handleDeleteRole = withLoading('delete', async () => {
    if (selectedRole) {
      try {
        await dispatch(deleteRole(selectedRole.id!)).unwrap();
        toast.success('역할 삭제 완료', '역할이 성공적으로 삭제되었습니다.');
        handleCloseDeleteModal();
        dispatch(fetchRoles(searchQuery));
      } catch (error) {
        handleApiError(error);
      }
    }
  });

  // 서비스 이름 가져오기 (useMemo로 최적화)
  const _getServiceName = useMemo(() => {
    return (serviceId: string): string => {
      const service = services.find((s) => s.id === serviceId);
      return service?.name || '알 수 없음';
    };
  }, [services]);

  const _formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  }, []);

  // 테이블 컬럼 정의 (useMemo로 최적화)
  const columns = useMemo(() => [
    {
      key: 'name' as keyof RoleSearchResult,
      label: '역할명',
      sortable: true,
    },
    {
      key: 'description' as keyof RoleSearchResult,
      label: '설명',
      sortable: false,
      render: (value: RoleSearchResult[keyof RoleSearchResult]): string => String(value || '설명 없음'),
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
      render: (value: RoleSearchResult[keyof RoleSearchResult]): string => String(`${value || 0}명`),
    },
    {
      key: 'service' as keyof RoleSearchResult,
      label: '서비스',
      sortable: false,
      render: (value: RoleSearchResult[keyof RoleSearchResult]): JSX.Element => {
        const service = value as RoleSearchResult['service'];
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            {service?.name || '알 수 없음'}
          </span>
        );
      },
    },
    {
      key: 'id' as keyof RoleSearchResult,
      label: '작업',
      sortable: false,
      render: (_value: RoleSearchResult[keyof RoleSearchResult], row: RoleSearchResult): JSX.Element => (
        <div className="flex justify-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenModal(row)}>
            수정
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleOpenPermissionModal(row)}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            권한 관리
          </Button>
          <LoadingButton
            size="sm"
            variant="outline"
            onClick={() => handleOpenDeleteModal(row)}
            isLoading={isActionsLoading('delete')}
            loadingText="삭제 중"
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            삭제
          </LoadingButton>
        </div>
      ),
    },
  ], [handleOpenModal, handleOpenPermissionModal, handleOpenDeleteModal, isActionsLoading]);

  // 서비스 옵션 배열 메모이제이션
  const serviceOptions = useMemo(() => 
    services.map((service) => ({
      value: service.id!,
      label: service.name!,
    })), [services]
  );

  return (
    <AdminAuthGuard>
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
                  <h1 className="text-2xl font-bold">역할 관리 (Redux)</h1>
                  <p className="text-white/80 mt-1">Redux를 사용한 역할 관리 시스템입니다.</p>
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
              <div className="flex">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* 검색 */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">역할명</label>
                <input
                  type="text"
                  placeholder="역할명을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">서비스</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onChange={(e) => {
                    const value = e.target.value;
                    handleSearch({
                      ...searchQuery,
                      serviceId: value === '' ? undefined : value,
                    });
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
                <Button onClick={() => {
                  setNameInput('');
                  handleSearch({});
                }}>검색 초기화</Button>
              </div>
            </div>
          </div>

          {/* 테이블 */}
          <LoadingOverlay isLoading={isLoading} text="역할 목록을 불러오는 중...">
            {isLoading && roles.length === 0 ? (
              <div className="bg-white rounded-lg shadow space-y-4 p-6">
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))}
              </div>
            ) : (
              <Table
                data={roles}
                columns={columns}
                loading={false}
                sortBy="name"
                sortOrder={SortOrderType.DESC}
                onSort={(_column): void => {
                  // Sort functionality placeholder
                }}
              />
            )}
          </LoadingOverlay>

          {/* 페이지네이션 */}
          <Pagination
            pageInfo={pagination}
            onPageChange={handlePageChange}
            onLimitChange={(limit): void => {
              handleSearch({ ...searchQuery, limit });
            }}
          />

          {/* 역할 생성/수정 모달 */}
          <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={selectedRole ? '역할 수정' : '새 역할 추가'}
            size="lg"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 일반적인 에러 메시지 */}
              {formError && (
                <ApiErrorMessage
                  error={{ message: formError }}
                  onDismiss={() => setFormError(null)}
                />
              )}

              <FormField
                label="역할명"
                required
                {...(errors.name?.message && { error: errors.name.message })}
                className="pb-4"
              >
                <Input
                  type="text"
                  {...register('name', {
                    required: '역할명을 입력해주세요',
                    minLength: {
                      value: 2,
                      message: '역할명은 최소 2자 이상이어야 합니다',
                    },
                    maxLength: {
                      value: 50,
                      message: '역할명은 최대 50자까지 입력 가능합니다',
                    },
                  })}
                  required
                  {...(errors.name?.message && { error: errors.name.message })}
                  placeholder="역할명을 입력하세요"
                />
              </FormField>

              <FormField
                label="설명"
                {...(errors.description?.message && { error: errors.description.message })}
                hint="역할에 대한 상세한 설명을 입력하세요 (선택사항)"
                className="pb-4"
              >
                <Textarea
                  {...register('description', {
                    maxLength: {
                      value: 500,
                      message: '설명은 최대 500자까지 입력 가능합니다',
                    },
                  })}
                  {...(errors.description?.message && { error: errors.description.message })}
                  rows={3}
                  placeholder="역할에 대한 설명을 입력하세요 (선택사항)"
                />
              </FormField>

              <FormField
                label="우선순위"
                required
                {...(errors.priority?.message && { error: errors.priority.message })}
                hint="낮은 숫자일수록 높은 우선순위입니다 (1-100)"
                className="pb-4"
              >
                <Input
                  type="number"
                  {...register('priority', {
                    required: '우선순위를 입력해주세요',
                    min: {
                      value: 1,
                      message: '우선순위는 1 이상이어야 합니다',
                    },
                    max: {
                      value: 100,
                      message: '우선순위는 100 이하여야 합니다',
                    },
                    valueAsNumber: true,
                  })}
                  required
                  {...(errors.priority?.message && { error: errors.priority.message })}
                  placeholder="1"
                  min="1"
                  max="100"
                />
              </FormField>

              {!selectedRole && (
                <FormField
                  label="서비스"
                  required
                  {...(errors.serviceId?.message && { error: errors.serviceId.message })}
                  hint="이 역할이 속할 서비스를 선택하세요"
                  className="pb-4"
                >
                  <Select
                    {...register('serviceId', {
                      required: '서비스를 선택해주세요',
                    })}
                    required
                    {...(errors.serviceId?.message && { error: errors.serviceId.message })}
                    placeholder="서비스를 선택하세요"
                    options={serviceOptions}
                  />
                </FormField>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  취소
                </Button>
                <LoadingButton
                  type="submit"
                  isLoading={isActionsLoading('save')}
                  loadingText="저장 중..."
                  disabled={isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {selectedRole ? '수정' : '생성'}
                </LoadingButton>
              </div>
            </form>
          </Modal>

          {/* 삭제 확인 모달 */}
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseDeleteModal}
            title="역할 삭제"
            size="sm"
          >
            <div className="space-y-4">
              <p className="text-gray-700">
                정말로 <strong>{selectedRole?.name}</strong> 역할을 삭제하시겠습니까?
              </p>
              <p className="text-sm text-red-600">이 작업은 되돌릴 수 없습니다.</p>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={handleCloseDeleteModal}>
                  취소
                </Button>
                <LoadingButton
                  onClick={handleDeleteRole}
                  isLoading={isActionsLoading('delete')}
                  loadingText="삭제 중..."
                  className="bg-red-600 hover:bg-red-700"
                >
                  삭제
                </LoadingButton>
              </div>
            </div>
          </Modal>

          {/* 권한 관리 모달 */}
          <RolePermissionModal
            isOpen={isPermissionModalOpen}
            onClose={handleClosePermissionModal}
            role={selectedRole}
          />
        </div>
      </Layout>
    </AdminAuthGuard>
  );
}

