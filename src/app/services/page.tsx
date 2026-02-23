'use client';

import { useState, useEffect } from 'react';
import { useServices } from '@/hooks/queries/services';
import { useCreateService, useUpdateService, useDeleteService } from '@/hooks/mutations/services';
import { serviceService } from '@/services/serviceService';
import Layout from '@/components/layout/Layout';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Pagination from '@/components/common/Pagination';
import LoadingButton from '@/components/common/LoadingButton';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import ServiceFormModal from '@/components/modals/ServiceFormModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/components/common/ToastContainer';
import type {
  ServiceDetail,
  ServiceSearchResult,
  ServiceSearchQuery,
  CreateServiceRequest,
  UpdateServiceRequest,
} from '@/types';
import { SortOrderType } from '@krgeobuk/core/enum';

export default function ServicesPage(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState<ServiceSearchQuery>({});
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');

  const debouncedName = useDebounce(nameInput, 500);
  const { handleApiError } = useErrorHandler();

  const { data: servicesData, isPending: isLoading, error } = useServices(searchQuery);
  const services = servicesData?.items ?? [];
  const pagination = servicesData?.pageInfo;

  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();

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

  const handleSearch = (query: ServiceSearchQuery): void => {
    setSearchQuery(query);
  };

  const handlePageChange = (page: number): void => {
    setSearchQuery((prev) => ({ ...prev, page }));
  };

  const handleOpenModal = async (serviceSearchResult?: ServiceSearchResult): Promise<void> => {
    try {
      if (serviceSearchResult) {
        const detail = await serviceService.getServiceById(serviceSearchResult.id);
        setSelectedService(detail);
      } else {
        setSelectedService(null);
      }
      setFormError(null);
      setIsModalOpen(true);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedService(null);
    setFormError(null);
  };

  const handleSubmitService = async (
    data: CreateServiceRequest | UpdateServiceRequest
  ): Promise<void> => {
    try {
      setFormError(null);
      if (selectedService?.id) {
        await updateServiceMutation.mutateAsync({ id: selectedService.id, data: data as UpdateServiceRequest });
        toast.success('서비스 수정 완료', '서비스가 성공적으로 수정되었습니다.');
      } else {
        await createServiceMutation.mutateAsync(data as CreateServiceRequest);
        toast.success('서비스 생성 완료', '새 서비스가 성공적으로 생성되었습니다.');
      }
      handleCloseModal();
    } catch (err: unknown) {
      const errorMessage = handleApiError(err, { showToast: false });
      setFormError(errorMessage);
      throw err;
    }
  };

  const handleOpenDeleteModal = async (serviceSearchResult: ServiceSearchResult): Promise<void> => {
    try {
      const detail = await serviceService.getServiceById(serviceSearchResult.id);
      setSelectedService(detail);
      setIsDeleteModalOpen(true);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleCloseDeleteModal = (): void => {
    setIsDeleteModalOpen(false);
    setSelectedService(null);
  };

  const handleDeleteService = async (): Promise<void> => {
    if (selectedService?.id) {
      try {
        await deleteServiceMutation.mutateAsync(selectedService.id);
        toast.success('서비스 삭제 완료', '서비스가 성공적으로 삭제되었습니다.');
        handleCloseDeleteModal();
      } catch (err) {
        handleApiError(err);
        throw err;
      }
    }
  };

  const getVisibilityBadgeColor = (isVisible: boolean, isVisibleByRole: boolean): string => {
    if (!isVisible) return 'bg-gray-100 text-gray-800';
    if (isVisibleByRole) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getVisibilityText = (isVisible: boolean, isVisibleByRole: boolean): string => {
    if (!isVisible) return '비공개';
    if (isVisibleByRole) return '권한 기반';
    return '공개';
  };

  const columns = [
    { key: 'name' as keyof ServiceSearchResult, label: '서비스명', sortable: true },
    {
      key: 'displayName' as keyof ServiceSearchResult,
      label: '표시명',
      sortable: false,
      render: (value: ServiceSearchResult[keyof ServiceSearchResult]): string =>
        String(value || '미설정'),
    },
    {
      key: 'baseUrl' as keyof ServiceSearchResult,
      label: 'URL',
      sortable: false,
      render: (value: ServiceSearchResult[keyof ServiceSearchResult]): string =>
        String(value || '미설정'),
    },
    {
      key: 'isVisible' as keyof ServiceSearchResult,
      label: '가시성',
      sortable: false,
      render: (
        value: ServiceSearchResult[keyof ServiceSearchResult],
        row: ServiceSearchResult
      ): JSX.Element => {
        const isVisible = Boolean(value);
        const isVisibleByRole = Boolean(row.isVisibleByRole);
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getVisibilityBadgeColor(isVisible, isVisibleByRole)}`}
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
      render: (
        _value: ServiceSearchResult[keyof ServiceSearchResult],
        row: ServiceSearchResult
      ): JSX.Element => (
        <div className="flex justify-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenModal(row)}>
            수정
          </Button>
          <LoadingButton
            size="sm"
            variant="outline"
            onClick={() => handleOpenDeleteModal(row)}
            isLoading={deleteServiceMutation.isPending}
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
                <h1 className="text-2xl font-bold">서비스 관리</h1>
                <p className="text-white/80 mt-1">서비스 목록을 조회하고 관리합니다.</p>
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
            <p className="text-sm text-red-800">{String(error)}</p>
          </div>
        )}

        {/* 검색 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-600 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">서비스명</label>
              <input
                type="text"
                placeholder="서비스명을 입력하세요"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">가시성</label>
              <select
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-gray-100"
                onChange={(e) => {
                  const value = e.target.value;
                  const newQuery: ServiceSearchQuery = { ...searchQuery };
                  if (value !== '') {
                    newQuery.isVisible = value === 'true';
                  } else {
                    delete newQuery.isVisible;
                  }
                  handleSearch(newQuery);
                }}
              >
                <option value="">모든 가시성</option>
                <option value="true">가시적</option>
                <option value="false">비가시적</option>
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
        <LoadingOverlay isLoading={isLoading} text="서비스 목록을 불러오는 중...">
          <Table
            data={services}
            columns={columns}
            loading={false}
            sortBy="createdAt"
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

        {/* 서비스 생성/수정 모달 */}
        <ServiceFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitService}
          service={selectedService}
          isLoading={createServiceMutation.isPending || updateServiceMutation.isPending}
          error={formError}
          onErrorDismiss={() => setFormError(null)}
        />

        {/* 삭제 확인 모달 */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteService}
          title="서비스 삭제"
          message="정말로 이 서비스를 삭제하시겠습니까?"
          {...(selectedService?.name && { itemName: selectedService.name })}
          isLoading={deleteServiceMutation.isPending}
        />
      </div>
    </Layout>
  );
}
