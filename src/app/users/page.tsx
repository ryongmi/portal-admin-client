'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchUsers,
  fetchUserById,
  setSelectedUser,
  clearError,
  updateUser,
  deleteUser,
} from '@/store/slices/userSlice';
import {
  fetchRoles,
  assignRoleToUser,
  removeRoleFromUser,
  fetchUserRoles
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
import FormField, { Input } from '@/components/common/FormField';
import { ApiErrorMessage } from '@/components/common/ErrorMessage';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { validationRules, mapServerErrorsToFormErrors } from '@/utils/formValidation';
import { toast } from '@/components/common/ToastContainer';
import type { UserDetail, UserSearchResult, UserSearchQuery } from '@/types';
import { SortOrderType } from '@krgeobuk/core/enum';

export default function ReduxUsersPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const { users, selectedUser, isLoading, error, pagination } = useAppSelector(
    (state) => state.user
  );
  const { roles } = useAppSelector((state) => state.role);
  const { services } = useAppSelector((state) => state.service);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<UserSearchQuery>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
    email: string;
    name: string;
    nickname: string;
    password: string;
  }>({
    defaultValues: {
      email: '',
      name: '',
      nickname: '',
      password: '',
    },
    mode: 'onChange',
  });

  // 초기 데이터 로드
  useEffect(() => {
    dispatch(fetchUsers({}));
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

  const handleSearch = (query: UserSearchQuery): void => {
    setSearchQuery(query);
    dispatch(fetchUsers(query));
  };

  const handlePageChange = (page: number): void => {
    dispatch(fetchUsers({ ...searchQuery, page }));
  };

  const handleOpenModal = async (userSearchResult?: UserSearchResult): Promise<void> => {
    try {
      if (userSearchResult) {
        // 상세 데이터 API 호출
        const fullUserData: UserDetail = await dispatch(
          fetchUserById(userSearchResult.id)
        ).unwrap();

        // 전체 데이터로 폼 초기화 (selectedUser는 reducer에서 자동 설정됨)
        reset({
          email: fullUserData.email || '',
          name: fullUserData.name || '',
          nickname: fullUserData.nickname || '',
          password: '',
        });
      } else {
        dispatch(setSelectedUser(null));
        reset({
          email: '',
          name: '',
          nickname: '',
          password: '',
        });
      }
      setFormError(null);
      setIsModalOpen(true);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    dispatch(setSelectedUser(null));
    setFormError(null);
    reset();
  };

  const handleOpenRoleModal = async (userSearchResult: UserSearchResult): Promise<void> => {
    try {
      // 사용자 ID 저장
      setCurrentUserId(userSearchResult.id);
      // 상세 데이터 API 호출
      await dispatch(fetchUserById(userSearchResult.id)).unwrap();
      // 사용자의 현재 역할 목록 조회 (Redux dispatch 사용)
      const userRolesResponse = await dispatch(fetchUserRoles(userSearchResult.id)).unwrap();
      setUserRoles(userRolesResponse);
      setIsRoleModalOpen(true);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleCloseRoleModal = (): void => {
    setIsRoleModalOpen(false);
    dispatch(setSelectedUser(null));
    setUserRoles([]);
    setCurrentUserId(null);
  };

  const handleAssignRole = withLoading('assignRole', async (userId: string, roleId: string) => {
    try {
      // Redux dispatch 사용하여 역할 할당
      await dispatch(assignRoleToUser({ userId, roleId })).unwrap();
      toast.success('역할 할당 완료', '사용자에게 역할이 성공적으로 할당되었습니다.');
      // 사용자 역할 목록 새로고침 (Redux dispatch 사용)
      const userRolesResponse = await dispatch(fetchUserRoles(userId)).unwrap();
      setUserRoles(userRolesResponse);
      // 사용자 목록 새로고침
      dispatch(fetchUsers(searchQuery));
    } catch (error) {
      handleApiError(error);
    }
  });

  const handleRemoveRole = withLoading('removeRole', async (userId: string, roleId: string) => {
    try {
      // Redux dispatch 사용하여 역할 제거
      await dispatch(removeRoleFromUser({ userId, roleId })).unwrap();
      toast.success('역할 제거 완료', '사용자에서 역할이 성공적으로 제거되었습니다.');
      // 사용자 역할 목록 새로고침 (Redux dispatch 사용)
      const userRolesResponse = await dispatch(fetchUserRoles(userId)).unwrap();
      setUserRoles(userRolesResponse);
      // 사용자 목록 새로고침
      dispatch(fetchUsers(searchQuery));
    } catch (error) {
      handleApiError(error);
    }
  });

  // Form data는 React Hook Form으로 관리되므로 별도의 handleFormChange 불필요

  const onSubmit = withLoading(
    'submit',
    async (data: { email: string; name: string; nickname: string; password: string }) => {
      try {
        setFormError(null);

        if (selectedUser) {
          // 수정
          await dispatch(
            updateUser({
              userId: selectedUser.id!,
              userData: {
                email: data.email,
                name: data.name,
                nickname: data.nickname,
              },
            })
          ).unwrap();

          toast.success('사용자 수정 완료', '사용자 정보가 성공적으로 수정되었습니다.');
        } else {
          // 사용자 생성 기능은 제거되었습니다
          toast.error('기능 제한', '사용자 생성 기능은 현재 지원되지 않습니다.');
          return;
        }

        handleCloseModal();
        dispatch(fetchUsers(searchQuery));
      } catch (error: unknown) {
        // 서버 에러를 폼 에러로 매핑
        const formErrors = mapServerErrorsToFormErrors(
          (error as { response?: { data?: { errors?: Record<string, string> } } })?.response?.data?.errors || {}
        );

        // 각 필드별 에러 설정
        Object.keys(formErrors).forEach((field) => {
          if (
            field === 'email' ||
            field === 'name' ||
            field === 'nickname' ||
            field === 'password'
          ) {
            const errorMessage = formErrors[field];
            if (errorMessage) {
              const message =
                typeof errorMessage === 'string'
                  ? errorMessage
                  : errorMessage.message || 'Invalid input';
              setError(field as keyof typeof data, { type: 'manual', message });
            }
          }
        });

        // 일반적인 에러 메시지 설정
        const errorMessage = handleApiError(error as Error, { showToast: false });
        setFormError(errorMessage);
      }
    }
  );

  const handleDelete = withLoading('delete', async (userId: string) => {
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        toast.success('사용자 삭제 완료', '사용자가 성공적으로 삭제되었습니다.');
        dispatch(fetchUsers(searchQuery));
      } catch (error) {
        handleApiError(error);
      }
    }
  });

  // Utility function for date formatting (currently unused)
  const _formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 서비스 이름 가져오기
  const _getServiceName = (serviceId: string): string => {
    const service = services.find((s) => s.id === serviceId);
    return service?.name || '알 수 없음';
  };

  // Utility function for status formatting (currently unused)
  const _formatStatus = (isEmailVerified: boolean, isIntegrated: boolean): JSX.Element => {
    if (isEmailVerified && isIntegrated) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          통합 완료
        </span>
      );
    } else if (isEmailVerified) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          이메일 인증됨
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          미인증
        </span>
      );
    }
  };

  const columns = [
    {
      key: 'email' as keyof UserSearchResult,
      label: '이메일',
      sortable: true,
      render: (value: UserSearchResult[keyof UserSearchResult]): string => String(value || 'N/A'),
    },
    {
      key: 'name' as keyof UserSearchResult,
      label: '이름',
      sortable: true,
      render: (value: UserSearchResult[keyof UserSearchResult]): string => String(value || 'N/A'),
    },
    {
      key: 'nickname' as keyof UserSearchResult,
      label: '닉네임',
      sortable: false,
      render: (value: UserSearchResult[keyof UserSearchResult]): string => String(value || '미설정'),
    },
    {
      key: 'isEmailVerified' as keyof UserSearchResult,
      label: '이메일 인증',
      sortable: false,
      render: (value: UserSearchResult[keyof UserSearchResult]): string => (value ? '인증완료' : '미인증'),
    },
    {
      key: 'isIntegrated' as keyof UserSearchResult,
      label: '통합계정',
      sortable: false,
      render: (value: UserSearchResult[keyof UserSearchResult]): string => (value ? '통합됨' : '연동안됨'),
    },
    {
      key: 'id' as keyof UserSearchResult,
      label: '작업',
      sortable: false,
      render: (_value: UserSearchResult[keyof UserSearchResult], row: UserSearchResult): JSX.Element => (
        <div className="flex justify-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenModal(row)}>
            수정
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleOpenRoleModal(row)}>
            역할 관리
          </Button>
          <LoadingButton
            size="sm"
            variant="outline"
            onClick={() => handleDelete(row.id)}
            isLoading={isActionsLoading('delete')}
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
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">사용자 관리 (Redux)</h1>
                  <p className="text-white/80 mt-1">Redux를 사용한 사용자 관리 시스템입니다.</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => handleOpenModal()}
                className="!bg-white !text-blue-600 hover:!bg-blue-50"
              >
                새 사용자 추가
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
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => handleSearch({ ...searchQuery, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  placeholder="이름을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => handleSearch({ ...searchQuery, name: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={() => handleSearch({})}>검색 초기화</Button>
              </div>
            </div>
          </div>

          {/* 테이블 */}
          <LoadingOverlay isLoading={isLoading} text="사용자 목록을 불러오는 중...">
            {isLoading && users.length === 0 ? (
              <div className="bg-white rounded-lg shadow space-y-4 p-6">
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))}
              </div>
            ) : (
              <Table
                data={users}
                columns={columns}
                loading={false}
                sortBy="createdAt"
                sortOrder={SortOrderType.DESC}
                onSort={(_column) => {
                  // 정렬 처리
                }}
              />
            )}
          </LoadingOverlay>

          {/* 페이지네이션 */}
          <Pagination
            pageInfo={pagination}
            onPageChange={handlePageChange}
            onLimitChange={(limit) => {
              handleSearch({ ...searchQuery, limit });
            }}
          />

          {/* 사용자 수정 모달 */}
          <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={selectedUser ? '사용자 수정' : '새 사용자 추가'}
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
                label="이메일"
                required
                {...(errors.email?.message && { error: errors.email.message })}
                className="pb-4"
              >
                <Input
                  type="email"
                  {...register('email', validationRules.email)}
                  {...(errors.email?.message && { error: errors.email.message })}
                  placeholder="example@domain.com"
                />
              </FormField>

              <FormField
                label="이름"
                required
                {...(errors.name?.message && { error: errors.name.message })}
                className="pb-4"
              >
                <Input
                  type="text"
                  {...register('name', validationRules.name)}
                  {...(errors.name?.message && { error: errors.name.message })}
                  placeholder="사용자 이름을 입력하세요"
                />
              </FormField>

              <FormField
                label="닉네임"
                {...(errors.nickname?.message && { error: errors.nickname.message })}
                hint="다른 사용자들에게 표시될 이름입니다"
                className="pb-4"
              >
                <Input
                  type="text"
                  {...register('nickname', {
                    maxLength: {
                      value: 30,
                      message: '닉네임은 최대 30자까지 입력 가능합니다',
                    },
                  })}
                  {...(errors.nickname?.message && { error: errors.nickname.message })}
                  placeholder="닉네임을 입력하세요 (선택사항)"
                />
              </FormField>

              {!selectedUser && (
                <FormField
                  label="비밀번호"
                  required
                  {...(errors.password?.message && { error: errors.password.message })}
                  hint="최소 8자, 대소문자, 숫자, 특수문자 포함"
                  className="pb-4"
                >
                  <Input
                    type="password"
                    {...register('password', validationRules.password)}
                    {...(errors.password?.message && { error: errors.password.message })}
                    placeholder="안전한 비밀번호를 입력하세요"
                  />
                </FormField>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  취소
                </Button>
                <LoadingButton
                  type="submit"
                  isLoading={isActionsLoading('submit')}
                  loadingText="처리 중..."
                  disabled={isSubmitting}
                >
                  {selectedUser ? '수정' : '추가'}
                </LoadingButton>
              </div>
            </form>
          </Modal>

          {/* 역할 관리 모달 */}
          <Modal
            isOpen={isRoleModalOpen}
            onClose={handleCloseRoleModal}
            title="역할 관리"
            size="xl"
          >
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900">사용자 정보</h4>
                <p className="text-sm text-blue-600">
                  이메일: {selectedUser?.email} | 이름: {selectedUser?.name}
                </p>
              </div>

              {/* 현재 할당된 역할 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">현재 할당된 역할</h4>
                {userRoles.length > 0 ? (
                  <div className="space-y-4">
                    {/* 서비스별 역할 그룹 */}
                    {services.map((service) => {
                      const serviceRoles = userRoles
                        .map((roleId) => roles.find((r) => r.id === roleId))
                        .filter((role) => role && role.service?.id === service.id);
                      
                      if (serviceRoles.length === 0) return null;

                      return (
                        <div key={service.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                          <div className="flex items-center space-x-2 mb-3">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="font-medium text-green-800">{service.name}</span>
                            <span className="text-xs text-green-600">({serviceRoles.length}개)</span>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {serviceRoles.map((role) => (
                              <div
                                key={role!.id}
                                className="flex items-center justify-between p-2 bg-white border border-green-200 rounded"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    <span className="font-medium text-green-800">{role!.name}</span>
                                  </div>
                                  <p className="text-xs text-green-600 mt-1">{role!.description}</p>
                                </div>
                                <LoadingButton
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    currentUserId && handleRemoveRole(currentUserId, role!.id!)
                                  }
                                  isLoading={isActionsLoading('removeRole')}
                                  loadingText="제거중"
                                  disabled={!currentUserId}
                                  className="text-red-600 border-red-300 hover:bg-red-50 ml-2"
                                >
                                  제거
                                </LoadingButton>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* 서비스에 속하지 않는 기타 역할 그룹 */}
                    {((): JSX.Element | null => {
                      const unassignedRoles = userRoles
                        .map((roleId) => roles.find((r) => r.id === roleId))
                        .filter((role) => role && !role.service?.id);
                      
                      if (unassignedRoles.length === 0) return null;

                      return (
                        <div key="unassigned" className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                          <div className="flex items-center space-x-2 mb-3">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="font-medium text-purple-800">시스템 관리자</span>
                            <span className="text-xs text-purple-600">({unassignedRoles.length}개)</span>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {unassignedRoles.map((role) => (
                              <div
                                key={role!.id}
                                className="flex items-center justify-between p-2 bg-white border border-purple-200 rounded"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                    <span className="font-medium text-purple-800">{role!.name}</span>
                                  </div>
                                  <p className="text-xs text-purple-600 mt-1">{role!.description}</p>
                                </div>
                                <LoadingButton
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    currentUserId && handleRemoveRole(currentUserId, role!.id!)
                                  }
                                  isLoading={isActionsLoading('removeRole')}
                                  loadingText="제거중"
                                  disabled={!currentUserId}
                                  className="text-red-600 border-red-300 hover:bg-red-50 ml-2"
                                >
                                  제거
                                </LoadingButton>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V9a4 4 0 00-4-4H9a4 4 0 00-4 4v4h14V9z" />
                    </svg>
                    <p className="mt-2">할당된 역할이 없습니다</p>
                  </div>
                )}
              </div>

              {/* 할당 가능한 역할 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">할당 가능한 역할</h4>
                <div className="max-h-80 overflow-y-auto space-y-4">
                  {/* 서비스별 할당 가능한 역할 그룹 */}
                  {services.map((service) => {
                    const availableRoles = roles.filter(
                      (role) => role.service?.id === service.id && !userRoles.includes(role.id!)
                    );
                    
                    if (availableRoles.length === 0) return null;

                    return (
                      <div key={service.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center space-x-2 mb-3">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="font-medium text-gray-800">{service.name}</span>
                          <span className="text-xs text-gray-600">({availableRoles.length}개)</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {availableRoles.map((role) => (
                            <div
                              key={role.id}
                              className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                                  <span className="font-medium text-gray-800">{role.name}</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{role.description}</p>
                              </div>
                              <LoadingButton
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  currentUserId && handleAssignRole(currentUserId, role.id!)
                                }
                                isLoading={isActionsLoading('assignRole')}
                                loadingText="할당중"
                                disabled={!currentUserId}
                                className="text-blue-600 border-blue-600 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-700 ml-2"
                              >
                                할당
                              </LoadingButton>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* 서비스에 속하지 않는 할당 가능한 시스템 관리자 역할 */}
                  {((): JSX.Element | null => {
                    const unassignedAvailableRoles = roles.filter(
                      (role) => !role.service?.id && !userRoles.includes(role.id!)
                    );
                    
                    if (unassignedAvailableRoles.length === 0) return null;

                    return (
                      <div key="unassigned-available" className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                        <div className="flex items-center space-x-2 mb-3">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="font-medium text-purple-800">시스템 관리자</span>
                          <span className="text-xs text-purple-600">({unassignedAvailableRoles.length}개)</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {unassignedAvailableRoles.map((role) => (
                            <div
                              key={role.id}
                              className="flex items-center justify-between p-2 bg-white border border-purple-200 rounded hover:bg-purple-50 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                  <span className="font-medium text-purple-800">{role.name}</span>
                                </div>
                                <p className="text-xs text-purple-600 mt-1">{role.description}</p>
                              </div>
                              <LoadingButton
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  currentUserId && handleAssignRole(currentUserId, role.id!)
                                }
                                isLoading={isActionsLoading('assignRole')}
                                loadingText="할당중"
                                disabled={!currentUserId}
                                className="text-purple-600 border-purple-600 hover:bg-purple-100 hover:text-purple-800 hover:border-purple-700 ml-2"
                              >
                                할당
                              </LoadingButton>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
                
                {roles.filter((role) => !userRoles.includes(role.id!)).length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-2">모든 역할이 이미 할당되었습니다</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-600">
                  총 {userRoles.length}개의 역할이 할당됨
                </div>
                <Button variant="outline" onClick={handleCloseRoleModal}>
                  닫기
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </Layout>
    </AdminAuthGuard>
  );
}

