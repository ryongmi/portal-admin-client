import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { portalApi } from '@/lib/httpClient';
import type {
  Service,
  ServiceSearchResult,
  ServiceDetail,
  ServiceSearchQuery,
  CreateServiceRequest,
  UpdateServiceRequest,
} from '@/types';
import type { ApiResponse, PaginatedResponse } from '@/lib/httpClient';
import type { PaginatedResultBase } from '@krgeobuk/core/interfaces';

interface ServiceState {
  services: ServiceSearchResult[];
  selectedService: ServiceDetail | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginatedResultBase;
}

const initialState: ServiceState = {
  services: [],
  selectedService: null,
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

// 서비스 목록 조회 비동기 액션
export const fetchServices = createAsyncThunk(
  'service/fetchServices',
  async (query: ServiceSearchQuery = {}, { rejectWithValue }) => {
    try {
      const response = await portalApi.get<ApiResponse<PaginatedResponse<Service>>>('/services', {
        params: query,
      });
      return response.data.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || '서비스 목록을 불러올 수 없습니다.'
      );
    }
  }
);

// 특정 서비스 조회 비동기 액션
export const fetchServiceById = createAsyncThunk(
  'service/fetchServiceById',
  async (serviceId: string, { rejectWithValue }) => {
    try {
      const response = await portalApi.get<ApiResponse<ServiceDetail>>(`/services/${serviceId}`);
      return response.data.data;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || '서비스 정보를 불러올 수 없습니다.'
      );
    }
  }
);

// 서비스 생성 비동기 액션
export const createService = createAsyncThunk(
  'service/createService',
  async (serviceData: CreateServiceRequest, { rejectWithValue }) => {
    try {
      await portalApi.post<ApiResponse<void>>('/services', serviceData);
      return serviceData;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '서비스 생성에 실패했습니다.');
    }
  }
);

// 서비스 수정 비동기 액션
export const updateService = createAsyncThunk(
  'service/updateService',
  async (
    { serviceId, serviceData }: { serviceId: string; serviceData: UpdateServiceRequest },
    { rejectWithValue }
  ) => {
    try {
      await portalApi.patch<ApiResponse<void>>(`/services/${serviceId}`, serviceData);
      return { serviceId, serviceData };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '서비스 수정에 실패했습니다.');
    }
  }
);

// 서비스 삭제 비동기 액션
export const deleteService = createAsyncThunk(
  'service/deleteService',
  async (serviceId: string, { rejectWithValue }) => {
    try {
      await portalApi.delete<ApiResponse<void>>(`/services/${serviceId}`);
      return serviceId;
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '서비스 삭제에 실패했습니다.');
    }
  }
);

// 서비스에 가시성 역할 할당 비동기 액션
export const assignVisibleRoleToService = createAsyncThunk(
  'service/assignVisibleRoleToService',
  async ({ serviceId, roleId }: { serviceId: string; roleId: string }, { rejectWithValue }) => {
    try {
      await portalApi.post<ApiResponse<void>>(`/services/${serviceId}/roles/${roleId}`);
      return { serviceId, roleId };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || '가시성 역할 할당에 실패했습니다.'
      );
    }
  }
);

// 서비스에서 가시성 역할 해제 비동기 액션
export const removeVisibleRoleFromService = createAsyncThunk(
  'service/removeVisibleRoleFromService',
  async ({ serviceId, roleId }: { serviceId: string; roleId: string }, { rejectWithValue }) => {
    try {
      await portalApi.delete<ApiResponse<void>>(`/services/${serviceId}/roles/${roleId}`);
      return { serviceId, roleId };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || '가시성 역할 해제에 실패했습니다.'
      );
    }
  }
);

// 서비스에 다중 가시성 역할 할당 비동기 액션
export const assignMultipleVisibleRolesToService = createAsyncThunk(
  'service/assignMultipleVisibleRolesToService',
  async ({ serviceId, roleIds }: { serviceId: string; roleIds: string[] }, { rejectWithValue }) => {
    try {
      await portalApi.post<ApiResponse<void>>(`/services/${serviceId}/roles/batch`, { roleIds });
      return { serviceId, roleIds };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || '다중 가시성 역할 할당에 실패했습니다.'
      );
    }
  }
);

// 서비스의 가시성 역할 완전 교체 비동기 액션
export const replaceServiceVisibleRoles = createAsyncThunk(
  'service/replaceServiceVisibleRoles',
  async ({ serviceId, roleIds }: { serviceId: string; roleIds: string[] }, { rejectWithValue }) => {
    try {
      await portalApi.put<ApiResponse<void>>(`/services/${serviceId}/roles`, { roleIds });
      return { serviceId, roleIds };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || '가시성 역할 교체에 실패했습니다.'
      );
    }
  }
);

// 서비스의 가시성 역할 목록 조회 비동기 액션
export const fetchServiceVisibleRoles = createAsyncThunk(
  'service/fetchServiceVisibleRoles',
  async (serviceId: string, { rejectWithValue }) => {
    try {
      const response = await portalApi.get<ApiResponse<string[]>>(`/services/${serviceId}/roles`);
      return { serviceId, roleIds: response.data.data };
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || '서비스 가시성 역할 목록을 불러올 수 없습니다.'
      );
    }
  }
);

const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedService: (state, action: PayloadAction<ServiceDetail | null>) => {
      state.selectedService = action.payload;
    },
    clearServices: (state) => {
      state.services = [];
      state.pagination = initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      // 서비스 목록 조회
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload.items as unknown as ServiceSearchResult[];
        state.pagination = action.payload.pageInfo;
        state.error = null;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 특정 서비스 조회
      .addCase(fetchServiceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedService = action.payload;
        state.error = null;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 서비스 생성
      .addCase(createService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createService.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(createService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 서비스 수정
      .addCase(updateService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.isLoading = false;
        const { serviceId, serviceData } = action.payload;
        const serviceIndex = state.services.findIndex((service) => service.id === serviceId);
        if (serviceIndex !== -1) {
          state.services[serviceIndex] = {
            ...state.services[serviceIndex],
            ...serviceData,
          } as ServiceSearchResult;
        }
        if (state.selectedService && state.selectedService.id === serviceId) {
          state.selectedService = { ...state.selectedService, ...serviceData } as ServiceDetail;
        }
        state.error = null;
      })
      .addCase(updateService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 서비스 삭제
      .addCase(deleteService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = state.services.filter((service) => service.id !== action.payload);
        if (state.selectedService && state.selectedService.id === action.payload) {
          state.selectedService = null;
        }
        state.error = null;
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // 가시성 역할 관련 액션들
      .addCase(assignVisibleRoleToService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignVisibleRoleToService.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(assignVisibleRoleToService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(removeVisibleRoleFromService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeVisibleRoleFromService.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(removeVisibleRoleFromService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(assignMultipleVisibleRolesToService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignMultipleVisibleRolesToService.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(assignMultipleVisibleRolesToService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(replaceServiceVisibleRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(replaceServiceVisibleRoles.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(replaceServiceVisibleRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchServiceVisibleRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServiceVisibleRoles.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchServiceVisibleRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSelectedService, clearServices } = serviceSlice.actions;
export default serviceSlice.reducer;

