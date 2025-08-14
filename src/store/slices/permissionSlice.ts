import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authzApi } from '@/lib/httpClient';
import type {
  Permission,
  PermissionSearchResult,
  PermissionSearchQuery,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  CheckPermissionRequest,
  PermissionCheckResponse,
  PermissionDetail,
} from '@/types';
import type { ApiResponse, PaginatedResponse } from '@/lib/httpClient';
import type { PaginatedResultBase } from '@krgeobuk/core/interfaces';

interface PermissionState {
  permissions: PermissionSearchResult[];
  selectedPermission: PermissionDetail | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginatedResultBase;
}

const initialState: PermissionState = {
  permissions: [],
  selectedPermission: null,
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

// 권한 목록 조회 비동기 액션
export const fetchPermissions = createAsyncThunk(
  'permission/fetchPermissions',
  async (query: PermissionSearchQuery = {}, { rejectWithValue }) => {
    try {
      const response = await authzApi.get<ApiResponse<PaginatedResponse<Permission>>>(
        '/permissions',
        {
          params: query,
        }
      );
      return response.data.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || '권한 목록을 불러올 수 없습니다.'
      );
    }
  }
);

// 특정 권한 조회 비동기 액션
export const fetchPermissionById = createAsyncThunk(
  'permission/fetchPermissionById',
  async (permissionId: string, { rejectWithValue }) => {
    try {
      const response = await authzApi.get<ApiResponse<PermissionDetail>>(
        `/permissions/${permissionId}`
      );
      return response.data.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || '권한 정보를 불러올 수 없습니다.'
      );
    }
  }
);

// 권한 생성 비동기 액션
export const createPermission = createAsyncThunk(
  'permission/createPermission',
  async (permissionData: CreatePermissionRequest, { rejectWithValue }) => {
    try {
      await authzApi.post<ApiResponse<void>>('/permissions', permissionData);
      return permissionData;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '권한 생성에 실패했습니다.');
    }
  }
);

// 권한 수정 비동기 액션
export const updatePermission = createAsyncThunk(
  'permission/updatePermission',
  async (
    {
      permissionId,
      permissionData,
    }: { permissionId: string; permissionData: UpdatePermissionRequest },
    { rejectWithValue }
  ) => {
    try {
      await authzApi.patch<ApiResponse<void>>(`/permissions/${permissionId}`, permissionData);
      return { permissionId, permissionData };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '권한 수정에 실패했습니다.');
    }
  }
);

// 권한 삭제 비동기 액션
export const deletePermission = createAsyncThunk(
  'permission/deletePermission',
  async (permissionId: string, { rejectWithValue }) => {
    try {
      await authzApi.delete<ApiResponse<void>>(`/permissions/${permissionId}`);
      return permissionId;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '권한 삭제에 실패했습니다.');
    }
  }
);

// 역할에 권한 할당 비동기 액션
export const assignPermissionToRole = createAsyncThunk(
  'permission/assignPermissionToRole',
  async (
    { roleId, permissionId }: { roleId: string; permissionId: string },
    { rejectWithValue }
  ) => {
    try {
      await authzApi.post<ApiResponse<void>>(`/roles/${roleId}/permissions/${permissionId}`);
      return { roleId, permissionId };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '권한 할당에 실패했습니다.');
    }
  }
);

// 역할에서 권한 해제 비동기 액션
export const removePermissionFromRole = createAsyncThunk(
  'permission/removePermissionFromRole',
  async (
    { roleId, permissionId }: { roleId: string; permissionId: string },
    { rejectWithValue }
  ) => {
    try {
      await authzApi.delete<ApiResponse<void>>(`/roles/${roleId}/permissions/${permissionId}`);
      return { roleId, permissionId };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '권한 해제에 실패했습니다.');
    }
  }
);

// 역할에 다중 권한 할당 비동기 액션
export const assignMultiplePermissionsToRole = createAsyncThunk(
  'permission/assignMultiplePermissionsToRole',
  async (
    { roleId, permissionIds }: { roleId: string; permissionIds: string[] },
    { rejectWithValue }
  ) => {
    try {
      await authzApi.post<ApiResponse<void>>(`/roles/${roleId}/permissions/batch`, {
        permissionIds,
      });
      return { roleId, permissionIds };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || '다중 권한 할당에 실패했습니다.'
      );
    }
  }
);

// 역할의 권한 완전 교체 비동기 액션
export const replaceRolePermissions = createAsyncThunk(
  'permission/replaceRolePermissions',
  async (
    { roleId, permissionIds }: { roleId: string; permissionIds: string[] },
    { rejectWithValue }
  ) => {
    try {
      await authzApi.put<ApiResponse<void>>(`/roles/${roleId}/permissions`, { permissionIds });
      return { roleId, permissionIds };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '권한 교체에 실패했습니다.');
    }
  }
);

// 사용자 권한 확인 비동기 액션
export const checkUserPermission = createAsyncThunk(
  'permission/checkUserPermission',
  async (checkData: CheckPermissionRequest, { rejectWithValue }) => {
    try {
      const response = await authzApi.post<ApiResponse<PermissionCheckResponse>>(
        '/authorization/check-permission',
        checkData
      );
      return response.data.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '권한 확인에 실패했습니다.');
    }
  }
);

// 사용자의 권한 목록 조회 비동기 액션
export const fetchUserPermissions = createAsyncThunk(
  'permission/fetchUserPermissions',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await authzApi.get<ApiResponse<string[]>>(
        `/authorization/users/${userId}/permissions`
      );
      return response.data.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || '사용자 권한 목록을 불러올 수 없습니다.'
      );
    }
  }
);

const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedPermission: (state, action: PayloadAction<PermissionDetail | null>) => {
      state.selectedPermission = action.payload;
    },
    clearPermissions: (state) => {
      state.permissions = [];
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      // 권한 목록 조회
      .addCase(fetchPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permissions = action.payload.items as unknown as PermissionSearchResult[];
        state.pagination = action.payload.pageInfo;
        state.error = null;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 특정 권한 조회
      .addCase(fetchPermissionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPermissionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPermission = action.payload;
        state.error = null;
      })
      .addCase(fetchPermissionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 권한 생성
      .addCase(createPermission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPermission.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(createPermission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 권한 수정
      .addCase(updatePermission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePermission.fulfilled, (state, action) => {
        state.isLoading = false;
        const { permissionId, permissionData } = action.payload;
        const permissionIndex = state.permissions.findIndex(
          (permission) => permission.id === permissionId
        );
        if (permissionIndex !== -1) {
          state.permissions[permissionIndex] = {
            ...state.permissions[permissionIndex],
            ...permissionData,
            id: permissionId, // id 속성 명시적으로 설정
          } as PermissionSearchResult;
        }
        if (state.selectedPermission && state.selectedPermission.id === permissionId) {
          state.selectedPermission = { ...state.selectedPermission, ...permissionData };
        }
        state.error = null;
      })
      .addCase(updatePermission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 권한 삭제
      .addCase(deletePermission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePermission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permissions = state.permissions.filter(
          (permission) => permission.id !== action.payload
        );
        if (state.selectedPermission && state.selectedPermission.id === action.payload) {
          state.selectedPermission = null;
        }
        state.error = null;
      })
      .addCase(deletePermission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 권한 할당/해제/교체 액션들
      .addCase(assignPermissionToRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignPermissionToRole.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(assignPermissionToRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(removePermissionFromRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removePermissionFromRole.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(removePermissionFromRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(assignMultiplePermissionsToRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignMultiplePermissionsToRole.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(assignMultiplePermissionsToRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(replaceRolePermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(replaceRolePermissions.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(replaceRolePermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 권한 확인
      .addCase(checkUserPermission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkUserPermission.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(checkUserPermission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 사용자 권한 목록 조회
      .addCase(fetchUserPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPermissions.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedPermission, clearPermissions } = permissionSlice.actions;
export default permissionSlice.reducer;

