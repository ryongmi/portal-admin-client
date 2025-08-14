import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authzApi } from '@/lib/httpClient';
import type {
  RoleSearchResult,
  RoleDetail,
  RoleSearchQuery,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '@/types';
import type { ApiResponse, PaginatedResponse } from '@/lib/httpClient';
import type { PaginatedResultBase } from '@krgeobuk/core/interfaces';

interface RoleState {
  roles: RoleSearchResult[];
  selectedRole: RoleDetail | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginatedResultBase;
}

const initialState: RoleState = {
  roles: [],
  selectedRole: null,
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

// 역할 목록 조회 비동기 액션
export const fetchRoles = createAsyncThunk(
  'role/fetchRoles',
  async (query: RoleSearchQuery = {}, { rejectWithValue }) => {
    try {
      const response = await authzApi.get<ApiResponse<PaginatedResponse<RoleSearchResult>>>(
        '/roles?page=1&limit=30',
        {
          params: query,
        }
      );
      return response.data.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || '역할 목록을 불러올 수 없습니다.'
      );
    }
  }
);

// 특정 역할 조회 비동기 액션
export const fetchRoleById = createAsyncThunk(
  'role/fetchRoleById',
  async (roleId: string, { rejectWithValue }) => {
    try {
      const response = await authzApi.get<ApiResponse<RoleDetail>>(`/roles/${roleId}`);
      return response.data.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || '역할 정보를 불러올 수 없습니다.'
      );
    }
  }
);

// 역할 생성 비동기 액션
export const createRole = createAsyncThunk(
  'role/createRole',
  async (roleData: CreateRoleRequest, { rejectWithValue }) => {
    try {
      await authzApi.post<ApiResponse<void>>('/roles', roleData);
      return roleData;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '역할 생성에 실패했습니다.');
    }
  }
);

// 역할 수정 비동기 액션
export const updateRole = createAsyncThunk(
  'role/updateRole',
  async (
    { roleId, roleData }: { roleId: string; roleData: UpdateRoleRequest },
    { rejectWithValue }
  ) => {
    try {
      await authzApi.patch<ApiResponse<void>>(`/roles/${roleId}`, roleData);
      return { roleId, roleData };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '역할 수정에 실패했습니다.');
    }
  }
);

// 역할 삭제 비동기 액션
export const deleteRole = createAsyncThunk(
  'role/deleteRole',
  async (roleId: string, { rejectWithValue }) => {
    try {
      await authzApi.delete<ApiResponse<void>>(`/roles/${roleId}`);
      return roleId;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '역할 삭제에 실패했습니다.');
    }
  }
);

// 사용자에게 역할 할당 비동기 액션
export const assignRoleToUser = createAsyncThunk(
  'role/assignRoleToUser',
  async ({ userId, roleId }: { userId: string; roleId: string }, { rejectWithValue }) => {
    try {
      await authzApi.post<ApiResponse<void>>(`/users/${userId}/roles/${roleId}`);
      return { userId, roleId };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '역할 할당에 실패했습니다.');
    }
  }
);

// 사용자에게서 역할 해제 비동기 액션
export const removeRoleFromUser = createAsyncThunk(
  'role/removeRoleFromUser',
  async ({ userId, roleId }: { userId: string; roleId: string }, { rejectWithValue }) => {
    try {
      await authzApi.delete<ApiResponse<void>>(`/users/${userId}/roles/${roleId}`);
      return { userId, roleId };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '역할 해제에 실패했습니다.');
    }
  }
);

// 사용자에게 다중 역할 할당 비동기 액션
export const assignMultipleRolesToUser = createAsyncThunk(
  'role/assignMultipleRolesToUser',
  async ({ userId, roleIds }: { userId: string; roleIds: string[] }, { rejectWithValue }) => {
    try {
      await authzApi.post<ApiResponse<void>>(`/users/${userId}/roles/batch`, { roleIds });
      return { userId, roleIds };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || '다중 역할 할당에 실패했습니다.'
      );
    }
  }
);

// 사용자의 역할 완전 교체 비동기 액션
export const replaceUserRoles = createAsyncThunk(
  'role/replaceUserRoles',
  async ({ userId, roleIds }: { userId: string; roleIds: string[] }, { rejectWithValue }) => {
    try {
      await authzApi.put<ApiResponse<void>>(`/users/${userId}/roles`, { roleIds });
      return { userId, roleIds };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '역할 교체에 실패했습니다.');
    }
  }
);

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedRole: (state, action: PayloadAction<RoleDetail | null>) => {
      state.selectedRole = action.payload;
    },
    clearRoles: (state) => {
      state.roles = [];
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      // 역할 목록 조회
      .addCase(fetchRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = action.payload.items;
        state.pagination = action.payload.pageInfo;
        state.error = null;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 특정 역할 조회
      .addCase(fetchRoleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoleById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRole = action.payload;
        state.error = null;
      })
      .addCase(fetchRoleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 역할 생성
      .addCase(createRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(createRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 역할 수정
      .addCase(updateRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.isLoading = false;
        const { roleId, roleData } = action.payload;
        const roleIndex = state.roles.findIndex((role) => role.id === roleId);
        if (roleIndex !== -1) {
          state.roles[roleIndex] = { 
            ...state.roles[roleIndex], 
            ...roleData,
            id: roleId, // id 속성 명시적으로 설정
          } as RoleSearchResult;
        }
        if (state.selectedRole && state.selectedRole.id === roleId) {
          state.selectedRole = { ...state.selectedRole, ...roleData };
        }
        state.error = null;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 역할 삭제
      .addCase(deleteRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = state.roles.filter((role) => role.id !== action.payload);
        if (state.selectedRole && state.selectedRole.id === action.payload) {
          state.selectedRole = null;
        }
        state.error = null;
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 역할 할당/해제/교체 액션들
      .addCase(assignRoleToUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignRoleToUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(assignRoleToUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(removeRoleFromUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeRoleFromUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(removeRoleFromUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(assignMultipleRolesToUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignMultipleRolesToUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(assignMultipleRolesToUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(replaceUserRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(replaceUserRoles.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(replaceUserRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedRole, clearRoles } = roleSlice.actions;
export default roleSlice.reducer;

