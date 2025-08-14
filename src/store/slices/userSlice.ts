import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@/lib/httpClient';
import type { User, UserSearchResult, UserDetail, UserSearchQuery, UpdateMyProfileRequest, ChangePasswordRequest } from '@/types';
import type { ApiResponse, PaginatedResponse } from '@/lib/httpClient';
import type { PaginatedResultBase } from '@krgeobuk/core/interfaces';

interface UserState {
  users: UserSearchResult[];
  currentUser: UserDetail | null;
  selectedUser: UserDetail | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginatedResultBase;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  selectedUser: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 30,
    totalItems: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  },
};

// 사용자 목록 조회 비동기 액션
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (query: UserSearchQuery = {}, { rejectWithValue }) => {
    try {
      const response = await authApi.get<ApiResponse<PaginatedResponse<User>>>(
        '/users?page=1&limit=30',
        {
          params: query,
        }
      );
      return response.data.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || '사용자 목록을 불러올 수 없습니다.'
      );
    }
  }
);

// 특정 사용자 조회 비동기 액션
export const fetchUserById = createAsyncThunk(
  'user/fetchUserById',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await authApi.get<ApiResponse<UserDetail>>(`/users/${userId}`);
      return response.data.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || '사용자 정보를 불러올 수 없습니다.'
      );
    }
  }
);

// 내 프로필 수정 비동기 액션
export const updateMyProfile = createAsyncThunk(
  'user/updateMyProfile',
  async (profileData: UpdateMyProfileRequest, { rejectWithValue }) => {
    try {
      await authApi.patch<ApiResponse<void>>('/users/me', profileData);
      return profileData;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '프로필 수정에 실패했습니다.');
    }
  }
);

// 비밀번호 변경 비동기 액션
export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (passwordData: ChangePasswordRequest, { rejectWithValue }) => {
    try {
      await authApi.patch<ApiResponse<void>>('/users/password', passwordData);
      return null;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    }
  }
);

// 계정 삭제 비동기 액션
export const deleteMyAccount = createAsyncThunk(
  'user/deleteMyAccount',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.delete<ApiResponse<void>>('/users/me');
      return null;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '계정 삭제에 실패했습니다.');
    }
  }
);

// 관리자 기능: 사용자 생성
export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await authApi.post<ApiResponse<User>>('/users', userData);
      return response.data.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '사용자 생성에 실패했습니다.');
    }
  }
);

// 관리자 기능: 사용자 수정
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ userId, userData }: { userId: string; userData: Partial<User> }, { rejectWithValue }) => {
    try {
      const response = await authApi.patch<ApiResponse<User>>(`/users/${userId}`, userData);
      return response.data.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '사용자 수정에 실패했습니다.');
    }
  }
);

// 관리자 기능: 사용자 삭제
export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      await authApi.delete<ApiResponse<void>>(`/users/${userId}`);
      return userId;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '사용자 삭제에 실패했습니다.');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedUser: (state, action: PayloadAction<UserDetail | null>) => {
      state.selectedUser = action.payload;
    },
    clearUsers: (state) => {
      state.users = [];
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      // 사용자 목록 조회
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.items as unknown as UserSearchResult[];
        state.pagination = action.payload.pageInfo;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 특정 사용자 조회
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 내 프로필 수정
      .addCase(updateMyProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentUser) {
          state.currentUser = { ...state.currentUser, ...action.payload };
        }
        state.error = null;
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 비밀번호 변경
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 계정 삭제
      .addCase(deleteMyAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMyAccount.fulfilled, (state) => {
        state.isLoading = false;
        state.currentUser = null;
        state.error = null;
      })
      .addCase(deleteMyAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 관리자 기능: 사용자 생성
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.push(action.payload as unknown as UserSearchResult);
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 관리자 기능: 사용자 수정
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload as unknown as UserSearchResult;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload as unknown as UserDetail;
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 관리자 기능: 사용자 삭제
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedUser, clearUsers } = userSlice.actions;
export default userSlice.reducer;

