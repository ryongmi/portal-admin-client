'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchServices,
  fetchServiceById,
  createService,
  updateService,
  deleteService,
  setSelectedService,
  clearError,
} from '@/store/slices/serviceSlice';
import Layout from '@/components/layout/Layout';
import AdminAuthGuard from '@/components/auth/AdminAuthGuard';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Pagination from '@/components/common/Pagination';
import LoadingButton from '@/components/common/LoadingButton';
// Loading components available if needed
import FormField, { Input, Textarea, Checkbox } from '@/components/common/FormField';
import { ApiErrorMessage } from '@/components/common/ErrorMessage';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useDebounce } from '@/hooks/useDebounce';
import { mapServerErrorsToFormErrors } from '@/utils/formValidation';
import { toast } from '@/components/common/ToastContainer';
import type {
  ServiceDetail,
  ServiceSearchResult,
  ServiceSearchQuery,
  CreateServiceRequest,
  UpdateServiceRequest,
} from '@/types';
import { SortOrderType } from '@krgeobuk/core/enum';

const validationRules = {
  url: {
    pattern: {
      value: /^https?:\/\/.+/,
      message: '유효한 URL을 입력해주세요 (http:// 또는 https://로 시작)',
    },
  },
};

export default function ReduxServicesPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const { services, selectedService, isLoading, error, pagination } = useAppSelector(
    (state) => state.service
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<ServiceSearchQuery>({});
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
    description: string | null;
    baseUrl: string | null;
    displayName: string | null;
    iconUrl: string | null;
    isVisible: boolean;
    isVisibleByRole: boolean;
  }>({
    defaultValues: {
      name: '',
      description: null,
      baseUrl: null,
      displayName: null,
      iconUrl: null,
      isVisible: true,
      isVisibleByRole: false,
    },
    mode: 'onChange',
  });

  // 초기 데이터 로드
  useEffect(() => {
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
    dispatch(fetchServices(newQuery));
  }, [debouncedName, dispatch]);

  // 검색 처리
  const handleSearch = (query: ServiceSearchQuery): void => {
    setSearchQuery(query);
    dispatch(fetchServices(query));
  };

  // 페이지 변경 처리
  const handlePageChange = (page: number): void => {
    dispatch(fetchServices({ ...searchQuery, page }));
  };

  // 모달 열기
  const handleOpenModal = async (serviceSearchResult?: ServiceSearchResult): Promise<void> => {
    try {
      if (serviceSearchResult) {
        // 상세 데이터 API 호출
        const fullServiceData: ServiceDetail = await dispatch(
          fetchServiceById(serviceSearchResult.id)
        ).unwrap();

        // 전체 데이터로 폼 초기화
        reset({
          name: fullServiceData.name,
          description: fullServiceData.description || null,
          baseUrl: fullServiceData.baseUrl || null,
          displayName: fullServiceData.displayName || null,
          iconUrl: fullServiceData.iconUrl || null,
          isVisible: fullServiceData.isVisible ?? true,
          isVisibleByRole: fullServiceData.isVisibleByRole ?? false,
        });
      } else {
        dispatch(setSelectedService(null));
        reset({
          name: '',
          description: null,
          baseUrl: null,
          displayName: null,
          iconUrl: null,
          isVisible: true,
          isVisibleByRole: false,
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
    dispatch(setSelectedService(null));
    setFormError(null);
    reset();
  };

  // 서비스 저장
  const onSubmit = withLoading(
    'save',
    async (data: {
      name: string;
      description: string | null;
      baseUrl: string | null;
      displayName: string | null;
      iconUrl: string | null;
      isVisible: boolean;
      isVisibleByRole: boolean;
    }) => {
      try {
        setFormError(null);

        if (selectedService && selectedService.id) {
          const updateData: UpdateServiceRequest = {
            name: data.name,
            description: data.description || null,
            baseUrl: data.baseUrl || null,
            displayName: data.displayName || null,
            iconUrl: data.iconUrl || null,
            isVisible: data.isVisible,
            isVisibleByRole: data.isVisibleByRole,
          };
          await dispatch(
            updateService({ serviceId: selectedService.id, serviceData: updateData })
          ).unwrap();

          toast.success('서비스 수정 완료', '서비스가 성공적으로 수정되었습니다.');
        } else {
          const createData: CreateServiceRequest = {
            name: data.name,
            description: data.description || null,
            baseUrl: data.baseUrl || null,
            displayName: data.displayName || null,
            iconUrl: data.iconUrl || null,
            isVisible: data.isVisible,
            isVisibleByRole: data.isVisibleByRole,
          };
          await dispatch(createService(createData)).unwrap();

          toast.success('서비스 생성 완료', '새 서비스가 성공적으로 생성되었습니다.');
        }

        handleCloseModal();
        dispatch(fetchServices(searchQuery));
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
            field === 'baseUrl' ||
            field === 'displayName' ||
            field === 'iconUrl'
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
  const handleOpenDeleteModal = async (serviceSearchResult: ServiceSearchResult): Promise<void> => {
    try {
      // 상세 데이터 API 호출
      await dispatch(fetchServiceById(serviceSearchResult.id)).unwrap();
      setIsDeleteModalOpen(true);
    } catch (error) {
      handleApiError(error);
    }
  };

  // 삭제 모달 닫기
  const handleCloseDeleteModal = (): void => {
    setIsDeleteModalOpen(false);
    dispatch(setSelectedService(null));
  };

  // 서비스 삭제
  const handleDeleteService = withLoading('delete', async () => {
    if (selectedService && selectedService.id) {
      try {
        await dispatch(deleteService(selectedService.id)).unwrap();
        toast.success('서비스 삭제 완료', '서비스가 성공적으로 삭제되었습니다.');
        handleCloseDeleteModal();
        dispatch(fetchServices(searchQuery));
      } catch (error) {
        handleApiError(error);
      }
    }
  });

  // 가시성 배지 색상
  const getVisibilityBadgeColor = (isVisible: boolean, isVisibleByRole: boolean): string => {
    if (!isVisible) return 'bg-gray-100 text-gray-800';
    if (isVisibleByRole) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // 가시성 텍스트
  const getVisibilityText = (isVisible: boolean, isVisibleByRole: boolean): string => {
    if (!isVisible) return '비공개';
    if (isVisibleByRole) return '권한 기반';
    return '공개';
  };

  const _formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const columns = [
    { key: 'name' as keyof ServiceSearchResult, label: '서비스명', sortable: true },
    {
      key: 'displayName' as keyof ServiceSearchResult,
      label: '표시명',
      sortable: false,
      render: (value: ServiceSearchResult[keyof ServiceSearchResult]): string => String(value || '미설정'),
    },
    {
      key: 'baseUrl' as keyof ServiceSearchResult,
      label: 'URL',
      sortable: false,
      render: (value: ServiceSearchResult[keyof ServiceSearchResult]): string => String(value || '미설정'),
    },
    {
      key: 'isVisible' as keyof ServiceSearchResult,
      label: '가시성',
      sortable: false,
      render: (value: ServiceSearchResult[keyof ServiceSearchResult], row: ServiceSearchResult): JSX.Element => {
        const isVisible = Boolean(value);
        const isVisibleByRole = Boolean(row.isVisibleByRole);
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getVisibilityBadgeColor(
              isVisible,
              isVisibleByRole
            )}`}
          >
            {getVisibilityText(isVisible, isVisibleByRole)}
          </span>
        );
      },
    },
    {
      key: 'visibleRoleCount' as keyof ServiceSearchResult,
      label: '역할 수',
      sortable: false,
      render: (value: ServiceSearchResult[keyof ServiceSearchResult]): string => `${value || 0}개`,
    },
    {
      key: 'id' as keyof ServiceSearchResult,
      label: '작업',
      sortable: false,
      render: (value: ServiceSearchResult[keyof ServiceSearchResult], row: ServiceSearchResult): JSX.Element => (
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
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">서비스 관리 (Redux)</h1>
                  <p className="text-white/80 mt-1">Redux를 사용한 서비스 관리 시스템입니다.</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => handleOpenModal()}
                className="!bg-white !text-indigo-700 hover:!bg-indigo-50"
              >
                새 서비스 추가
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">서비스명</label>
                <input
                  type="text"
                  placeholder="서비스명을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">표시명</label>
                <input
                  type="text"
                  placeholder="표시명을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => handleSearch({ ...searchQuery, displayName: e.target.value })}
                />
              </div> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">가시성</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => {
                    const value = e.target.value;
                    handleSearch({
                      ...searchQuery,
                      isVisible: value === '' ? undefined : value === 'true',
                    });
                  }}
                >
                  <option value="">모든 가시성</option>
                  <option value="true">가시적</option>
                  <option value="false">비가시적</option>
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
          <Table
            data={services}
            columns={columns}
            loading={isLoading}
            sortBy="createdAt"
            sortOrder={SortOrderType.DESC}
            onSort={(_column) => {
              // Sort functionality placeholder
            }}
          />

          {/* 페이지네이션 */}
          <Pagination
            pageInfo={pagination}
            onPageChange={handlePageChange}
            onLimitChange={(limit) => {
              handleSearch({ ...searchQuery, limit });
            }}
          />

          {/* 서비스 생성/수정 모달 */}
          <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={selectedService ? '서비스 수정' : '새 서비스 추가'}
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
                label="서비스명"
                required
                {...(errors.name?.message && { error: errors.name.message })}
                className="pb-4"
              >
                <Input
                  type="text"
                  {...register('name', {
                    required: '서비스명을 입력해주세요',
                    minLength: {
                      value: 2,
                      message: '서비스명은 최소 2자 이상이어야 합니다',
                    },
                    maxLength: {
                      value: 100,
                      message: '서비스명은 최대 100자까지 입력 가능합니다',
                    },
                  })}
                  required
                  {...(errors.name?.message && { error: errors.name.message })}
                  placeholder="서비스명을 입력하세요"
                />
              </FormField>

              <FormField
                label="표시명"
                {...(errors.displayName?.message && { error: errors.displayName.message })}
                hint="사용자에게 표시될 이름입니다 (선택사항)"
                className="pb-4"
              >
                <Input
                  type="text"
                  {...register('displayName', {
                    maxLength: {
                      value: 100,
                      message: '표시명은 최대 100자까지 입력 가능합니다',
                    },
                  })}
                  {...(errors.displayName?.message && { error: errors.displayName.message })}
                  placeholder="사용자에게 표시될 이름 (선택사항)"
                />
              </FormField>

              <FormField
                label="설명"
                {...(errors.description?.message && { error: errors.description.message })}
                hint="서비스에 대한 상세한 설명을 입력하세요 (선택사항)"
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
                  placeholder="서비스에 대한 설명을 입력하세요 (선택사항)"
                />
              </FormField>

              <FormField
                label="Base URL"
                {...(errors.baseUrl?.message && { error: errors.baseUrl.message })}
                hint="서비스의 기본 URL입니다 (선택사항)"
                className="pb-4"
              >
                <Input
                  type="url"
                  {...register('baseUrl', validationRules.url)}
                  {...(errors.baseUrl?.message && { error: errors.baseUrl.message })}
                  placeholder="https://example.com (선택사항)"
                />
              </FormField>

              <FormField
                label="아이콘 URL"
                {...(errors.iconUrl?.message && { error: errors.iconUrl.message })}
                hint="서비스 아이콘의 URL입니다 (선택사항)"
                className="pb-4"
              >
                <Input
                  type="url"
                  {...register('iconUrl', validationRules.url)}
                  {...(errors.iconUrl?.message && { error: errors.iconUrl.message })}
                  placeholder="https://example.com/icon.png (선택사항)"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-4">
                <Checkbox
                  {...register('isVisible')}
                  label="포털에서 표시"
                  {...(errors.isVisible?.message && { error: errors.isVisible.message })}
                />
                <Checkbox
                  {...register('isVisibleByRole')}
                  label="권한 기반 표시"
                  {...(errors.isVisibleByRole?.message && {
                    error: errors.isVisibleByRole.message,
                  })}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  취소
                </Button>
                <LoadingButton
                  type="submit"
                  isLoading={isActionsLoading('save')}
                  loadingText="저장 중..."
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {selectedService ? '수정' : '생성'}
                </LoadingButton>
              </div>
            </form>
          </Modal>

          {/* 삭제 확인 모달 */}
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseDeleteModal}
            title="서비스 삭제"
            size="sm"
          >
            <div className="space-y-4">
              <p className="text-gray-700">
                정말로 <strong>{selectedService?.name}</strong> 서비스를 삭제하시겠습니까?
              </p>
              <p className="text-sm text-red-600">이 작업은 되돌릴 수 없습니다.</p>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={handleCloseDeleteModal}>
                  취소
                </Button>
                <LoadingButton
                  onClick={handleDeleteService}
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

