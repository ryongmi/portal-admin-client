import { useState, useCallback } from 'react';
import { userService } from '@/services/userService';
import type { UserSearchQuery, UserSearchResult, UserDetail } from '@krgeobuk/user';
import type { PaginatedResult } from '@krgeobuk/core';

export function useUsers(): {
  users: UserSearchResult[];
  loading: boolean;
  error: string | null;
  fetchUsers: (query?: UserSearchQuery) => Promise<PaginatedResult<UserSearchResult>>;
  getUserById: (id: string) => Promise<UserDetail>;
  updateProfile: (profileData: { nickname: string; profileImageUrl: string }) => Promise<void>;
  changePassword: (passwordData: { currentPassword: string; newPassword: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
} {
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (query: UserSearchQuery = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getUsers(query);
      setUsers(response.items);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '사용자 목록 조회에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserById = useCallback(async (id: string): Promise<UserDetail> => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getUserById(id);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '사용자 상세 정보 조회에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData: { nickname: string; profileImageUrl: string }) => {
    setLoading(true);
    setError(null);
    try {
      await userService.updateMyProfile(profileData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '프로필 수정에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (passwordData: { currentPassword: string; newPassword: string }) => {
    setLoading(true);
    setError(null);
    try {
      await userService.changePassword(passwordData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await userService.deleteMyAccount();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '계정 삭제에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    getUserById,
    updateProfile,
    changePassword,
    deleteAccount,
  };
}