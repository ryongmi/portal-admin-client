import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { permissionService } from '@/services/permissionService';
import type { ServiceError } from '@/services/base';
import type {
  // Permission,
  PermissionSearchResult,
  PermissionSearchQuery,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  CheckPermissionRequest,
  // PermissionCheckResponse,
  PermissionDetail,
} from '@/types';
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
      return await permissionService.getPermissions(query);
    } catch (error) {
      const serviceError = error as ServiceError;
      return rejectWithValue(serviceError.message);
    }
  }
);

// 특정 권한 조회 비동기 액션
export const fetchPermissionById = createAsyncThunk(
  'permission/fetchPermissionById',
  async (permissionId: string, { rejectWithValue }) => {
    try {
      return await permissionService.getPermissionById(permissionId);
    } catch (error) {
      const serviceError = error as ServiceError;
      return rejectWithValue(serviceError.message);
    }
  }
);

// 권한 생성 비동기 액션
export const createPermission = createAsyncThunk(
  'permission/createPermission',
  async (permissionData: CreatePermissionRequest, { rejectWithValue }) => {
    try {
      await permissionService.createPermission(permissionData);
      return permissionData;
    } catch (error) {
      const serviceError = error as ServiceError;
      return rejectWithValue(serviceError.message);
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
      await permissionService.updatePermission(permissionId, permissionData);
      return { permissionId, permissionData };
    } catch (error) {
      const serviceError = error as ServiceError;
      return rejectWithValue(serviceError.message);
    }
  }
);

// 권한 삭제 비동기 액션
export const deletePermission = createAsyncThunk(
  'permission/deletePermission',
  async (permissionId: string, { rejectWithValue }) => {
    try {
      await permissionService.deletePermission(permissionId);
      return permissionId;
    } catch (error) {
      const serviceError = error as ServiceError;
      return rejectWithValue(serviceError.message);
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
      await permissionService.assignPermissionToRole(roleId, permissionId);
      return { roleId, permissionId };
    } catch (error) {
      const serviceError = error as ServiceError;
      return rejectWithValue(serviceError.message);
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
      await permissionService.removePermissionFromRole(roleId, permissionId);
      return { roleId, permissionId };
    } catch (error) {
      const serviceError = error as ServiceError;
      return rejectWithValue(serviceError.message);
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
      await permissionService.assignMultiplePermissionsToRole(roleId, permissionIds);
      return { roleId, permissionIds };
    } catch (error) {
      const serviceError = error as ServiceError;
      return rejectWithValue(serviceError.message);
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
      await permissionService.replaceRolePermissions(roleId, permissionIds);
      return { roleId, permissionIds };
    } catch (error) {
      const serviceError = error as ServiceError;
      return rejectWithValue(serviceError.message);
    }
  }
);

// 사용자 권한 확인 비동기 액션
export const checkUserPermission = createAsyncThunk(
  'permission/checkUserPermission',
  async (checkData: CheckPermissionRequest, { rejectWithValue }) => {
    try {
      return await permissionService.checkUserPermission(checkData);
    } catch (error) {
      const serviceError = error as ServiceError;
      return rejectWithValue(serviceError.message);
    }
  }
);

// 사용자의 권한 목록 조회 비동기 액션
export const fetchUserPermissions = createAsyncThunk(
  'permission/fetchUserPermissions',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await permissionService.getUserPermissions(userId);
    } catch (error) {
      const serviceError = error as ServiceError;
      return rejectWithValue(serviceError.message);
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
