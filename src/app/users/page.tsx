'use client';

import { useState, useEffect } from 'react';
import { useUsers } from '@/hooks/queries/users';
import { useRoles } from '@/hooks/queries/roles';
import { useServices } from '@/hooks/queries/services';
import { useUserRoles } from '@/hooks/queries/roles';
import { useUpdateUser } from '@/hooks/mutations/users';
import { useAssignRoleToUser, useRemoveRoleFromUser } from '@/hooks/mutations/roles';
import { userService } from '@/services/userService';
import Layout from '@/components/layout/Layout';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Pagination from '@/components/common/Pagination';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import UserFormModal from '@/components/modals/UserFormModal';
import UserRoleModal from '@/components/modals/UserRoleModal';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from '@/components/common/ToastContainer';
import type { UserDetail, UserSearchResult, UserSearchQuery } from '@/types';
import type { User } from '@/types';
import { SortOrderType } from '@krgeobuk/core/enum';

export default function UsersPage(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState<UserSearchQuery>({});
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  const debouncedEmail = useDebounce(emailInput, 500);
  const debouncedName = useDebounce(nameInput, 500);

  const { handleApiError } = useErrorHandler();

  const { data: usersData, isPending: isLoading, error } = useUsers(searchQuery);
  const users = usersData?.items ?? [];
  const pagination = usersData?.pageInfo;

  const { data: rolesData } = useRoles({});
  const roles = rolesData?.items ?? [];

  const { data: servicesData } = useServices({});
  const services = servicesData?.items ?? [];

  const { data: userRolesData } = useUserRoles(selectedUserId);
  const userRoles = userRolesData ?? [];

  const updateUserMutation = useUpdateUser();
  const assignRoleMutation = useAssignRoleToUser();
  const removeRoleMutation = useRemoveRoleFromUser();

  useEffect(() => {
    const trimmed = debouncedEmail.trim();
    setSearchQuery((prev) => {
      const newQuery = { ...prev };
      if (trimmed) {
        newQuery.email = trimmed;
      } else {
        delete newQuery.email;
      }
      return newQuery;
    });
  }, [debouncedEmail]);

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

  const handleSearch = (query: UserSearchQuery): void => {
    setSearchQuery(query);
  };

  const handlePageChange = (page: number): void => {
    setSearchQuery((prev) => ({ ...prev, page }));
  };

  const handleOpenModal = async (userSearchResult?: UserSearchResult): Promise<void> => {
    try {
      if (userSearchResult) {
        const detail = await userService.getUserById(userSearchResult.id);
        setSelectedUser(detail);
      } else {
        setSelectedUser(null);
      }
      setFormError(null);
      setIsModalOpen(true);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setFormError(null);
  };

  const handleSubmitUser = async (
    data: { email: string; name: string; nickname: string; password?: string }
  ): Promise<void> => {
    try {
      setFormError(null);
      if (selectedUser?.id) {
        await updateUserMutation.mutateAsync({
          id: selectedUser.id,
          data: {
            email: data.email,
            name: data.name,
            nickname: data.nickname,
          } as Partial<User>,
        });
        toast.success('사용자 수정 완료', '사용자 정보가 성공적으로 수정되었습니다.');
        handleCloseModal();
      }
    } catch (err: unknown) {
      const errorMessage = handleApiError(err, { showToast: false });
      setFormError(errorMessage);
      throw err;
    }
  };

  const handleOpenRoleModal = async (userSearchResult: UserSearchResult): Promise<void> => {
    try {
      const detail = await userService.getUserById(userSearchResult.id);
      setSelectedUser(detail);
      setSelectedUserId(userSearchResult.id);
      setIsRoleModalOpen(true);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleCloseRoleModal = (): void => {
    setIsRoleModalOpen(false);
    setSelectedUser(null);
    setSelectedUserId(null);
  };

  const handleAssignRole = async (userId: string, roleId: string): Promise<void> => {
    try {
      await assignRoleMutation.mutateAsync({ userId, roleId });
      toast.success('역할 할당 완료', '사용자에게 역할이 성공적으로 할당되었습니다.');
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string): Promise<void> => {
    try {
      await removeRoleMutation.mutateAsync({ userId, roleId });
      toast.success('역할 제거 완료', '사용자에서 역할이 성공적으로 제거되었습니다.');
    } catch (err) {
      handleApiError(err);
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
                <h1 className="text-2xl font-bold">사용자 관리</h1>
                <p className="text-white/80 mt-1">사용자 목록을 조회하고 관리합니다.</p>
              </div>
            </div>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이메일</label>
              <input
                type="email"
                placeholder="이메일을 입력하세요"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">이름</label>
              <input
                type="text"
                placeholder="이름을 입력하세요"
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
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
            onSort={(_column) => {}}
          />
        </LoadingOverlay>

        {/* 페이지네이션 */}
        <Pagination
          pageInfo={pagination}
          onPageChange={handlePageChange}
          onLimitChange={(limit) => handleSearch({ ...searchQuery, limit })}
        />

        {/* 사용자 수정 모달 */}
        <UserFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitUser}
          user={selectedUser}
          isLoading={updateUserMutation.isPending}
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
