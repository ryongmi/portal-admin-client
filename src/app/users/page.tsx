'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchUsers,
  fetchUserById,
  setSelectedUser,
  clearError,
  updateUser,
} from '@/store/slices/userSlice';
import {
  fetchRoles,
  assignRoleToUser,
  removeRoleFromUser,
  fetchUserRoles,
} from '@/store/slices/roleSlice';
import { fetchServices } from '@/store/slices/serviceSlice';
import Layout from '@/components/layout/Layout';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Pagination from '@/components/common/Pagination';
// import LoadingButton from '@/components/common/LoadingButton';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import UserFormModal from '@/components/modals/UserFormModal';
import UserRoleModal from '@/components/modals/UserRoleModal';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/components/common/ToastContainer';
import type { UserSearchResult, UserSearchQuery } from '@/types';
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

  // 디바운싱을 위한 로컬 입력 상태
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  // 디바운싱된 값 (500ms 지연)
  const debouncedEmail = useDebounce(emailInput, 500);
  const debouncedName = useDebounce(nameInput, 500);

  // 로딩 상태 관리
  const { isLoading: isActionsLoading, withLoading } = useLoadingState();

  // 에러 핸들러
  const { handleApiError } = useErrorHandler();

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

  // 디바운싱된 email 값이 변경되면 검색 실행
  useEffect(() => {
    const trimmedValue = debouncedEmail.trim();
    const newQuery: UserSearchQuery = {
      ...searchQuery,
    };
    if (trimmedValue !== '') {
      newQuery.email = trimmedValue;
    }
    setSearchQuery(newQuery);
    dispatch(fetchUsers(newQuery));
  }, [debouncedEmail, dispatch]);

  // 디바운싱된 name 값이 변경되면 검색 실행
  useEffect(() => {
    const trimmedValue = debouncedName.trim();
    const newQuery: UserSearchQuery = {
      ...searchQuery,
    };
    if (trimmedValue !== '') {
      newQuery.name = trimmedValue;
    }
    setSearchQuery(newQuery);
    dispatch(fetchUsers(newQuery));
  }, [debouncedName, dispatch]);

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
        await dispatch(fetchUserById(userSearchResult.id)).unwrap();
      } else {
        dispatch(setSelectedUser(null));
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
  };

  const handleOpenRoleModal = async (userSearchResult: UserSearchResult): Promise<void> => {
    try {
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

  const handleSubmitUser = withLoading(
    'save',
    async (data: { email: string; name: string; nickname: string; password?: string }) => {
      try {
        setFormError(null);

        if (selectedUser && selectedUser.id) {
          await dispatch(
            updateUser({
              userId: selectedUser.id,
              userData: {
                email: data.email,
                name: data.name,
                nickname: data.nickname,
              },
            })
          ).unwrap();
          toast.success('사용자 수정 완료', '사용자 정보가 성공적으로 수정되었습니다.');
        }

        handleCloseModal();
        dispatch(fetchUsers(searchQuery));
      } catch (error: unknown) {
        const errorMessage = handleApiError(error as Error, { showToast: false });
        setFormError(errorMessage);
        throw error;
      }
    }
  );

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
      render: (value: UserSearchResult[keyof UserSearchResult]): string =>
        String(value || '미설정'),
    },
    {
      key: 'isEmailVerified' as keyof UserSearchResult,
      label: '이메일 인증',
      sortable: false,
      render: (value: UserSearchResult[keyof UserSearchResult]): string =>
        value ? '인증완료' : '미인증',
    },
    {
      key: 'isIntegrated' as keyof UserSearchResult,
      label: '통합계정',
      sortable: false,
      render: (value: UserSearchResult[keyof UserSearchResult]): string =>
        value ? '통합됨' : '연동안됨',
    },
    {
      key: 'id' as keyof UserSearchResult,
      label: '작업',
      sortable: false,
      render: (
        _value: UserSearchResult[keyof UserSearchResult],
        row: UserSearchResult
      ): JSX.Element => (
        <div className="flex justify-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenModal(row)}>
            수정
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleOpenRoleModal(row)}>
            역할 관리
          </Button>
        </div>
      ),
    },
  ];

  return (
    
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
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                <input
                  type="text"
                  placeholder="이름을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setEmailInput('');
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
          <LoadingOverlay isLoading={isLoading} text="사용자 목록을 불러오는 중...">
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
          <UserFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleSubmitUser}
            user={selectedUser}
            isLoading={isActionsLoading('save')}
            error={formError}
            onErrorDismiss={() => setFormError(null)}
          />

          {/* 역할 관리 모달 */}
          <UserRoleModal
            isOpen={isRoleModalOpen}
            onClose={handleCloseRoleModal}
            user={selectedUser}
            roles={roles}
            userRoles={userRoles}
            onAssignRole={handleAssignRole}
            onRemoveRole={handleRemoveRole}
            services={services}
          />
        </div>
      </Layout>
    
  );
}
