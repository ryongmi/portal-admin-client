'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchPermissions,
  fetchPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  setSelectedPermission,
  clearError,
} from '@/store/slices/permissionSlice';
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
import { useLoadingState } from '@/hooks/useLoadingState';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { mapServerErrorsToFormErrors } from '@/utils/formValidation';
import { toast } from '@/components/common/ToastContainer';
import type {
  PermissionDetail,
  PermissionSearchResult,
  PermissionSearchQuery,
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from '@/types';
import { SortOrderType } from '@krgeobuk/core/enum';

// 폼 데이터 타입 정의
type PermissionFormData = {
  action: string;
  description: string;
  serviceId: string;
};

export default function ReduxPermissionsPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const { permissions, selectedPermission, isLoading, error, pagination } = useAppSelector(
    (state) => state.permission
  );
  const { services } = useAppSelector((state) => state.service);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<PermissionSearchQuery>({});
  const [formError, setFormError] = useState<string | null>(null);

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
  } = useForm<PermissionFormData>({
    defaultValues: {
      action: '',
      description: '',
      serviceId: '',
    },
    mode: 'onChange',
  });

  // 초기 데이터 로드
  useEffect(() => {
    dispatch(fetchPermissions({}));
    dispatch(fetchServices({}));
  }, [dispatch]);

  // 에러 처리
  useEffect(() => {
    if (error) {
      // Error logged for debugging
      setTimeout(() => dispatch(clearError()), 5000);
    }
  }, [error, dispatch]);

  // 검색 처리
  const handleSearch = (query: PermissionSearchQuery): void => {
    setSearchQuery(query);
    dispatch(fetchPermissions(query));
  };

  // 페이지 변경 처리
  const handlePageChange = (page: number): void => {
    dispatch(fetchPermissions({ ...searchQuery, page }));
  };

  // 모달 열기
  const handleOpenModal = async (permissionSearchResult?: PermissionSearchResult): Promise<void> => {
    try {
      if (permissionSearchResult) {
        // 상세 데이터 API 호출
        const fullPermissionData: PermissionDetail = await dispatch(
          fetchPermissionById(permissionSearchResult.id)
        ).unwrap();

        // 전체 데이터로 폼 초기화
        reset({
          action: fullPermissionData.action || '',
          description: fullPermissionData.description || '',
          serviceId: fullPermissionData.service?.id || '',
        });
      } else {
        dispatch(setSelectedPermission(null));
        reset({
          action: '',
          description: '',
          serviceId: '',
        });
      }
      setFormError(null);
      setIsModalOpen(true);
    } catch (error) {
      handleApiError(error);
    }
  };

  // 모달 닫기
  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    dispatch(setSelectedPermission(null));
    setFormError(null);
    reset();
  };

  // 권한 저장
  const onSubmit = withLoading(
    'save',
    async (data: { action: string; description: string; serviceId: string }) => {
      try {
        setFormError(null);

        if (selectedPermission && selectedPermission.id) {
          const updateData: UpdatePermissionRequest = {
            action: data.action,
            description: data.description,
          };
          await dispatch(
            updatePermission({ permissionId: selectedPermission.id, permissionData: updateData })
          ).unwrap();

          toast.success('권한 수정 완료', '권한이 성공적으로 수정되었습니다.');
        } else {
          const createData: CreatePermissionRequest = {
            action: data.action,
            description: data.description,
            serviceId: data.serviceId,
          };
          await dispatch(createPermission(createData)).unwrap();

          toast.success('권한 생성 완료', '새 권한이 성공적으로 생성되었습니다.');
        }

        handleCloseModal();
        dispatch(fetchPermissions(searchQuery));
      } catch (error: unknown) {
        // 서버 에러를 폼 에러로 매핑
        const formErrors = mapServerErrorsToFormErrors(
          (error as { response?: { data?: { errors?: Record<string, string> } } })?.response?.data?.errors || {}
        );

        // 각 필드별 에러 설정
        Object.keys(formErrors).forEach((field) => {
          if (field === 'action' || field === 'description' || field === 'serviceId') {
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
  const handleOpenDeleteModal = async (permissionSearchResult: PermissionSearchResult): Promise<void> => {
    try {
      // 상세 데이터 API 호출
      await dispatch(fetchPermissionById(permissionSearchResult.id)).unwrap();
      setIsDeleteModalOpen(true);
    } catch (error) {
      handleApiError(error);
    }
  };

  // 삭제 모달 닫기
  const handleCloseDeleteModal = (): void => {
    setIsDeleteModalOpen(false);
    dispatch(setSelectedPermission(null));
  };

  // 권한 삭제
  const handleDeletePermission = withLoading('delete', async () => {
    if (selectedPermission && selectedPermission.id) {
      try {
        await dispatch(deletePermission(selectedPermission.id)).unwrap();
        toast.success('권한 삭제 완료', '권한이 성공적으로 삭제되었습니다.');
        handleCloseDeleteModal();
        dispatch(fetchPermissions(searchQuery));
      } catch (error) {
        handleApiError(error);
      }
    }
  });

  // 서비스 이름 가져오기
  const _getServiceName = (serviceId: string): string => {
    const service = services.find((s) => s.id === serviceId);
    return service?.name || '알 수 없음';
  };

  // 액션 타입에 따른 배지 색상
  const getActionBadgeColor = (action: string): string => {
    if (action.endsWith('.read')) return 'bg-blue-100 text-blue-800';
    if (action.endsWith('.write')) return 'bg-green-100 text-green-800';
    if (action.endsWith('.update')) return 'bg-yellow-100 text-yellow-800';
    if (action.endsWith('.delete')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const _formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const columns = [
    {
      key: 'action' as keyof PermissionSearchResult,
      label: '액션',
      sortable: true,
      render: (value: PermissionSearchResult[keyof PermissionSearchResult]): JSX.Element => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getActionBadgeColor(
            value as string
          )}`}
        >
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
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
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
            isLoading={isActionsLoading('delete')}
            loadingText="삭제 중"
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            삭제
          </LoadingButton>
        </div>
      ),
    },
  ];

  return (
    <AdminAuthGuard>
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
                  <h1 className="text-2xl font-bold">권한 관리 (Redux)</h1>
                  <p className="text-white/80 mt-1">Redux를 사용한 권한 관리 시스템입니다.</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">액션</label>
                <input
                  type="text"
                  placeholder="액션을 입력하세요 (예: user.read)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  onChange={(e) => handleSearch({ ...searchQuery, action: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">서비스</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  onChange={(e) => handleSearch({ ...searchQuery, serviceId: e.target.value })}
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
                <Button onClick={() => handleSearch({})}>검색 초기화</Button>
              </div>
            </div>
          </div>

          {/* 테이블 */}
          <LoadingOverlay isLoading={isLoading} text="권한 목록을 불러오는 중...">
            {isLoading && permissions.length === 0 ? (
              <div className="bg-white rounded-lg shadow space-y-4 p-6">
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))}
              </div>
            ) : (
              <Table
                data={permissions}
                columns={columns}
                loading={false}
                sortBy="action"
                sortOrder={SortOrderType.DESC}
                onSort={(_column) => {
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

          {/* 권한 생성/수정 모달 */}
          <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={selectedPermission ? '권한 수정' : '새 권한 추가'}
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
                label="액션"
                required
                {...(errors.action?.message && { error: errors.action.message })}
                hint="일반적으로 리소스.액션 형태로 입력합니다. (예: user.read, role.write)"
                className="pb-4"
              >
                <Input
                  type="text"
                  {...register('action', {
                    required: '액션을 입력해주세요',
                    pattern: {
                      value: /^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/,
                      message: '액션은 "resource:action" 형식이어야 합니다',
                    },
                    minLength: {
                      value: 3,
                      message: '액션은 최소 3자 이상이어야 합니다',
                    },
                    maxLength: {
                      value: 100,
                      message: '액션은 최대 100자까지 입력 가능합니다',
                    },
                  })}
                  required
                  {...(errors.action?.message && { error: errors.action.message })}
                  placeholder="예: user.read, user.write, user.delete"
                />
              </FormField>

              <FormField
                label="설명"
                {...(errors.description?.message && { error: errors.description.message })}
                hint="권한에 대한 상세한 설명을 입력하세요 (선택사항)"
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
                  placeholder="권한에 대한 설명을 입력하세요 (선택사항)"
                />
              </FormField>

              {!selectedPermission && (
                <FormField
                  label="서비스"
                  required
                  {...(errors.serviceId?.message && { error: errors.serviceId.message })}
                  hint="이 권한이 속할 서비스를 선택하세요"
                  className="pb-4"
                >
                  <Select
                    {...register('serviceId', {
                      required: '서비스를 선택해주세요',
                    })}
                    {...(errors.serviceId?.message && { error: errors.serviceId.message })}
                    placeholder="서비스를 선택하세요"
                    options={services.map((service) => ({
                      value: service.id!,
                      label: service?.name ?? '',
                    }))}
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
                  className="bg-green-600 hover:bg-green-700"
                >
                  {selectedPermission ? '수정' : '생성'}
                </LoadingButton>
              </div>
            </form>
          </Modal>

          {/* 삭제 확인 모달 */}
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseDeleteModal}
            title="권한 삭제"
            size="sm"
          >
            <div className="space-y-4">
              <p className="text-gray-700">
                정말로 <strong>{selectedPermission?.action}</strong> 권한을 삭제하시겠습니까?
              </p>
              <p className="text-sm text-red-600">이 작업은 되돌릴 수 없습니다.</p>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={handleCloseDeleteModal}>
                  취소
                </Button>
                <LoadingButton
                  onClick={handleDeletePermission}
                  isLoading={isActionsLoading('delete')}
                  loadingText="삭제 중..."
                  className="bg-red-600 hover:bg-red-700"
                >
                  삭제
                </LoadingButton>
              </div>
            </div>
          </Modal>
        </div>
      </Layout>
    </AdminAuthGuard>
  );
}

