import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/authService';
import type { UserProfile } from '@krgeobuk/user/interfaces';

// import type { User } from '@/types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,  // ✅ 초기값을 true로 변경 (초기화 완료될 때까지 로딩)
  error: null,
  isInitialized: false,
};

// 로그아웃 비동기 액션
export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    return null;
  } catch (error: unknown) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(axiosError.response?.data?.message || '로그아웃에 실패했습니다.');
  }
});

// 사용자 정보 조회 비동기 액션
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getCurrentUser();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        axiosError.response?.data?.message || '사용자 정보를 불러올 수 없습니다.'
      );
    }
  }
);

// 앱 초기화 비동기 액션 (RefreshToken으로 AccessToken + 사용자 정보 한번에 조회)
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // /auth/initialize API 호출 (RefreshToken으로 AccessToken + 사용자 정보 반환)
      const { accessToken, user, isLogin } = await authService.initialize();
      return { accessToken, user, isLogin };
    } catch (error: unknown) {
      // 인증 실패 (RefreshToken이 없거나 만료됨)
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || '초기화에 실패했습니다.');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 사용자 정보 설정
    setUser: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },

    // 사용자 정보 초기화 (로그아웃)
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    // 로딩 상태 설정
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // 에러 상태 설정
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // 에러 초기화
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 앱 초기화
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.error = null;

        // isLogin 플래그를 우선 기준으로 인증 상태 판단
        if (action.payload.isLogin && action.payload.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })

      // 사용자 정보 조회
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })

      // 로그아웃
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, clearUser, setLoading, setError, clearError } = authSlice.actions;

export default authSlice.reducer;
