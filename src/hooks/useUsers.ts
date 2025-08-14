import { useState, useCallback } from 'react';
import { UserService } from '@/services/userService';
import type { UserSearchQuery, UserSearchResult, UserDetail } from '@krgeobuk/user';
// Paginated result type available if needed

export function useUsers(): {
  users: UserSearchResult[];
  loading: boolean;
  error: string | null;
  fetchUsers: (query?: UserSearchQuery) => Promise<{ items: UserSearchResult[] }>;
  getUserById: (id: string) => Promise<UserDetail>;
  updateProfile: (profileData: { nickname: string; profileImageUrl: string }) => Promise<unknown>;
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
      const response = await UserService.getUsers(query);
      setUsers(response.data.items);
      return response.data;
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
      const response = await UserService.getUserById(id);
      return response.data;
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
      const response = await UserService.updateMyProfile(profileData);
      return response.data;
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
      await UserService.changePassword(passwordData);
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
      await UserService.deleteMyAccount();
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