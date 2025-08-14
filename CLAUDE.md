# CLAUDE.md - Portal Admin Client

이 파일은 portal-admin-client 작업 시 Claude Code의 가이드라인을 제공합니다.

## 프로젝트 개요

portal-admin-client는 krgeobuk 생태계의 중앙 관리 인터페이스로, Next.js 15로 구축된 관리자 전용 웹 애플리케이션입니다. 사용자, 역할, 권한, 서비스를 통합 관리할 수 있는 현대적이고 안전한 관리자 포탈을 제공합니다.

### 기술 스택
- **Next.js 15** - App Router 기반 React 프레임워크  
- **TypeScript** - 엄격 모드가 활성화된 완전한 타입 안전성
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **Redux Toolkit** - 상태 관리 및 비동기 처리
- **React Hook Form** - 성능 최적화된 폼 관리
- **@krgeobuk/http-client** - 통합 HTTP 클라이언트
- **Lucide React** - 모던 아이콘 시스템

## 핵심 명령어

### 개발
```bash
# 개발 서버 시작 (포트 3210)
npm run dev

# 빌드
npm run build              # 프로덕션 빌드
npm run start              # 프로덕션 서버 시작 (포트 3210)

# 타입 검사
npm run type-check         # TypeScript 타입 검사
```

### 코드 품질
```bash
# 린팅
npm run lint               # ESLint 실행
npm run lint:fix           # 자동 수정과 함께 린팅
```

## 아키텍처 구조

### 관리자 전용 아키텍처
- **관리자 권한 검증**: AdminAuthGuard를 통한 역할 기반 접근 제어
- **자동 리다이렉트**: 비인가 사용자는 일반 포탈로 자동 이동
- **통합 관리**: 다중 백엔드 서비스 통합 인터페이스
- **실시간 모니터링**: 시스템 현황 실시간 대시보드

### 서비스 통합 아키텍처
portal-admin-client는 krgeobuk 마이크로서비스들의 관리 인터페이스입니다:

1. **auth-server (8000)** - 사용자 인증 및 사용자 관리
2. **authz-server (8100)** - 역할, 권한, 사용자-역할 관리
3. **portal-server (8200)** - 서비스 등록 및 관리

### 관리자 인터페이스 구조
단순화된 라우팅 구조 (admin prefix 없음):
- **대시보드** (`/`)
- **사용자 관리** (`/users`)
- **역할 관리** (`/roles`)
- **권한 관리** (`/permissions`)
- **서비스 관리** (`/services`)
- **프로필 관리** (`/profile`)

---

# 🔥 Portal Admin Client 개발 표준

> **중요**: 이 섹션은 portal-admin-client의 **모든 개발 작업**에서 적용되는 표준입니다.

## 관리자 권한 시스템

### 1. AdminAuthGuard 구현 패턴
```typescript
// src/components/auth/AdminAuthGuard.tsx
export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      // 비로그인 사용자 → 로그인 페이지
      const currentUrl = window.location.href;
      const redirectUri = encodeURIComponent(currentUrl);
      const loginUrl = `${process.env.NEXT_PUBLIC_AUTH_SERVER_URL}/api/auth/login?redirect_uri=${redirectUri}`;
      window.location.href = loginUrl;
    }
    
    if (isAuthenticated && user && !hasAdminRole(user)) {
      // 일반 사용자 → 포탈 클라이언트로 리다이렉트
      window.location.href = process.env.NEXT_PUBLIC_PORTAL_CLIENT_URL || 'http://localhost:3200';
    }
  }, [isAuthenticated, user, isLoading]);

  // 로딩 또는 권한 검증 중
  if (isLoading || !isAuthenticated || !hasAdminRole(user)) {
    return <PageLoader message="관리자 권한을 확인하는 중..." />;
  }

  return <>{children}</>;
};
```

### 2. 역할 검증 유틸리티
```typescript
// src/utils/roleUtils.ts
const ADMIN_ROLE_NAMES = ['super-admin', 'system-admin', 'portal-admin', 'admin'];

export function hasAdminRole(user: UserWithRoles | null): boolean {
  if (!user) return false;
  
  // roles 배열에서 관리자 역할 확인
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.some((role: { name?: string }) => 
      ADMIN_ROLE_NAMES.includes(role.name?.toLowerCase() || '')
    );
  }
  
  // 개발 환경에서 임시 바이패스 (운영에서는 제거)
  if (process.env.NODE_ENV === 'development' && user.id) {
    return true;
  }
  
  return false;
}
```

### 3. 레이아웃 적용 패턴
```typescript
// src/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <AdminAuthGuard>
            <Layout showSidebar>
              {children}
            </Layout>
          </AdminAuthGuard>
        </Providers>
      </body>
    </html>
  );
}
```

## Redux 상태 관리 패턴

### 1. 슬라이스 구조 표준
```typescript
// src/store/slices/userSlice.ts
interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  filters: UserFilters;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  },
  filters: {}
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 동기 액션들
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // 필터 변경시 첫 페이지로
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // 비동기 액션 처리
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.items;
        state.pagination = action.payload.pageInfo;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});
```

### 2. 비동기 액션 패턴
```typescript
// createAsyncThunk 사용 표준
export const fetchUsers = createAsyncThunk<
  PaginatedResponse<User>,
  SearchParams,
  { rejectValue: string }
>(
  'user/fetchUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await userService.getUsers(params);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : '사용자 조회 실패';
      return rejectWithValue(message);
    }
  }
);

export const createUser = createAsyncThunk<
  void,
  CreateUserDto,
  { rejectValue: string }
>(
  'user/createUser',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      await userService.createUser(userData);
      // 생성 후 목록 새로고침
      dispatch(fetchUsers({}));
    } catch (error) {
      const message = error instanceof Error ? error.message : '사용자 생성 실패';
      return rejectWithValue(message);
    }
  }
);
```

### 3. 셀렉터 활용 패턴
```typescript
// src/store/selectors/userSelectors.ts
export const selectUsers = (state: RootState) => state.user.users;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectSelectedUser = (state: RootState) => state.user.selectedUser;

// 메모이제이션된 선택자
export const selectFilteredUsers = createSelector(
  [selectUsers, (state: RootState) => state.user.filters],
  (users, filters) => {
    return users.filter(user => {
      if (filters.role && user.roles?.every(role => role.name !== filters.role)) {
        return false;
      }
      if (filters.isActive !== undefined && user.isActive !== filters.isActive) {
        return false;
      }
      return true;
    });
  }
);
```

## 서비스 레이어 패턴

### 1. HTTP 클라이언트 설정
```typescript
// src/lib/httpClient.ts
import { HttpClient } from '@krgeobuk/http-client';

const multiServerConfig = {
  auth: {
    baseURL: process.env.NEXT_PUBLIC_AUTH_SERVER_URL || 'http://localhost:8000',
    timeout: 10000,
    withCredentials: true,
  },
  authz: {
    baseURL: process.env.NEXT_PUBLIC_AUTHZ_SERVER_URL || 'http://localhost:8100',
    timeout: 10000,
    withCredentials: true,
  },
  portal: {
    baseURL: process.env.NEXT_PUBLIC_PORTAL_SERVER_URL || 'http://localhost:8200',
    timeout: 10000,
    withCredentials: true,
  }
};

const tokenRefreshConfig = {
  refreshUrl: '/api/auth/refresh',
  refreshBeforeExpiry: 5 * 60 * 1000, // 5분 전
};

const securityPolicy = {
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['localhost', '127.0.0.1'],
  enableCSRF: true,
  enableInputValidation: true,
  enableSecurityLogging: true,
  rateLimitConfig: {
    maxAttempts: 100,
    windowMs: 60 * 1000,
  }
};

export const httpClient = new HttpClient(
  multiServerConfig,
  tokenRefreshConfig,
  securityPolicy
);
```

### 2. 서비스 클래스 패턴
```typescript
// src/services/userService.ts
export class UserService {
  async getUsers(params: SearchParams = {}): Promise<PaginatedResponse<User>> {
    const response = await httpClient.get<PaginatedResponse<User>>('auth', '/api/users', {
      params: this.formatSearchParams(params)
    });
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await httpClient.get<User>('auth', `/api/users/${id}`);
    return response.data;
  }

  async createUser(userData: CreateUserDto): Promise<void> {
    await httpClient.post<void>('auth', '/api/users', this.formatUserData(userData));
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<void> {
    await httpClient.patch<void>('auth', `/api/users/${id}`, this.formatUserData(userData));
  }

  async deleteUser(id: string): Promise<void> {
    await httpClient.delete<void>('auth', `/api/users/${id}`);
  }

  // 사용자 역할 관리 (authz-server 연동)
  async assignUserRole(userId: string, roleId: string): Promise<void> {
    await httpClient.post<void>('authz', '/api/user-roles', { userId, roleId });
  }

  async removeUserRole(userId: string, roleId: string): Promise<void> {
    await httpClient.delete<void>('authz', `/api/user-roles`, { 
      data: { userId, roleId } 
    });
  }

  private formatSearchParams(params: SearchParams): Record<string, string> {
    // 검색 파라미터 포맷팅 로직
    return Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>);
  }

  private formatUserData(userData: CreateUserDto | UpdateUserDto): any {
    // API 형식에 맞게 데이터 변환
    return caseConverter.camelToSnake(userData);
  }
}

export const userService = new UserService();
```

## 컴포넌트 개발 표준

### 1. 페이지 컴포넌트 구조
```typescript
// src/app/users/page.tsx
'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUsers } from '@/store/slices/userSlice';
import { Layout } from '@/components/layout/Layout';
import { UserTable } from '@/components/users/UserTable';
import { UserFilters } from '@/components/users/UserFilters';
import { CreateUserModal } from '@/components/users/CreateUserModal';

export default function UsersPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const { users, loading, error, pagination, filters } = useAppSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUsers({ ...filters, page: pagination.currentPage }));
  }, [dispatch, filters, pagination.currentPage]);

  const handleFilterChange = (newFilters: UserFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  if (error) {
    return <ErrorMessage message={error} onRetry={() => dispatch(fetchUsers(filters))} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">사용자 관리</h1>
        <CreateUserButton />
      </div>
      
      <UserFilters filters={filters} onChange={handleFilterChange} />
      
      <UserTable
        users={users}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
      />
      
      <CreateUserModal />
    </div>
  );
}
```

### 2. 재사용 가능한 컴포넌트 패턴
```typescript
// src/components/common/Table.tsx
interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  pagination?: PaginationProps;
}

export function Table<T extends { id: string }>({
  data,
  columns,
  loading = false,
  emptyMessage = '데이터가 없습니다',
  onRowClick,
  pagination
}: TableProps<T>): JSX.Element {
  if (loading) {
    return <SkeletonLoader rows={5} columns={columns.length} />;
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render ? column.render(item) : String(item[column.key as keyof T])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {pagination && <Pagination {...pagination} />}
    </div>
  );
}
```

### 3. 폼 컴포넌트 패턴
```typescript
// src/components/forms/UserForm.tsx
interface UserFormProps {
  user?: User;
  onSubmit: (data: CreateUserDto | UpdateUserDto) => Promise<void>;
  onCancel: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting },
    reset,
    watch 
  } = useForm<UserFormData>({
    defaultValues: user ? formatUserForForm(user) : {},
    mode: 'onChange'
  });

  const onFormSubmit = async (data: UserFormData) => {
    try {
      await onSubmit(formatFormData(data));
      reset();
    } catch (error) {
      console.error('폼 제출 실패:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="이메일"
          required
          error={errors.email?.message}
        >
          <input
            {...register('email', {
              required: '이메일을 입력해주세요',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '올바른 이메일 형식을 입력해주세요'
              }
            })}
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        <FormField
          label="이름"
          required
          error={errors.name?.message}
        >
          <input
            {...register('name', { required: '이름을 입력해주세요' })}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <LoadingButton
          type="submit"
          loading={isSubmitting}
          variant="primary"
        >
          {user ? '수정' : '생성'}
        </LoadingButton>
      </div>
    </form>
  );
};
```

## 커스텀 훅 표준

### 1. 데이터 페칭 훅 패턴
```typescript
// src/hooks/useUsers.ts
export const useUsers = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error, pagination, filters } = useAppSelector((state) => state.user);

  const fetchUsers = useCallback((params: SearchParams = {}) => {
    dispatch(fetchUsersAction({ ...filters, ...params }));
  }, [dispatch, filters]);

  const createUser = useCallback(async (userData: CreateUserDto) => {
    const result = await dispatch(createUserAction(userData));
    return result.type.endsWith('/fulfilled');
  }, [dispatch]);

  const updateUser = useCallback(async (id: string, userData: UpdateUserDto) => {
    const result = await dispatch(updateUserAction({ id, userData }));
    return result.type.endsWith('/fulfilled');
  }, [dispatch]);

  const deleteUser = useCallback(async (id: string) => {
    const result = await dispatch(deleteUserAction(id));
    return result.type.endsWith('/fulfilled');
  }, [dispatch]);

  return {
    // 데이터
    users,
    loading,
    error,
    pagination,
    filters,
    
    // 액션
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    
    // 유틸리티
    refetch: () => fetchUsers(),
    clearError: () => dispatch(clearUserError())
  };
};
```

### 2. 모달 관리 훅 패턴
```typescript
// src/hooks/useModal.ts
interface ModalState<T = any> {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'delete' | null;
  data: T | null;
}

export const useModal = <T = any>() => {
  const [modalState, setModalState] = useState<ModalState<T>>({
    isOpen: false,
    mode: null,
    data: null
  });

  const openCreateModal = useCallback(() => {
    setModalState({ isOpen: true, mode: 'create', data: null });
  }, []);

  const openEditModal = useCallback((data: T) => {
    setModalState({ isOpen: true, mode: 'edit', data });
  }, []);

  const openDeleteModal = useCallback((data: T) => {
    setModalState({ isOpen: true, mode: 'delete', data });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ isOpen: false, mode: null, data: null });
  }, []);

  return {
    isOpen: modalState.isOpen,
    mode: modalState.mode,
    data: modalState.data,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModal
  };
};
```

## 환경 설정

### 필수 환경 변수
```bash
# 백엔드 서비스 URL (필수)
NEXT_PUBLIC_AUTH_SERVER_URL=http://localhost:8000
NEXT_PUBLIC_AUTHZ_SERVER_URL=http://localhost:8100
NEXT_PUBLIC_PORTAL_SERVER_URL=http://localhost:8200

# 클라이언트 URL
NEXT_PUBLIC_ADMIN_CLIENT_URL=http://localhost:3210
NEXT_PUBLIC_PORTAL_CLIENT_URL=http://localhost:3200

# 환경 설정
NEXT_PUBLIC_ENVIRONMENT=local
NODE_ENV=local
NEXT_TELEMETRY_DISABLED=1
```

### HTTP 클라이언트 환경 변수 (프로덕션)
```bash
# 보안 정책 (운영 환경에서 필수)
ALLOWED_ORIGINS=yourdomain.com,admin.yourdomain.com,auth.yourdomain.com,authz.yourdomain.com

# 성능 튜닝
NEXT_PUBLIC_API_TIMEOUT=15000
NEXT_PUBLIC_RATE_LIMIT_MAX_ATTEMPTS=50
NEXT_PUBLIC_RATE_LIMIT_WINDOW_MS=60000

# 보안 설정
NEXT_PUBLIC_ENABLE_CSRF=true
NEXT_PUBLIC_ENABLE_INPUT_VALIDATION=true
NEXT_PUBLIC_ENABLE_SECURITY_LOGGING=true
```

## 성능 최적화

### 1. 컴포넌트 최적화
```typescript
// React.memo와 useMemo 활용
export const UserCard = React.memo<UserCardProps>(({ user, onEdit, onDelete }) => {
  const displayName = useMemo(() => {
    return user.name || user.email;
  }, [user.name, user.email]);

  const handleEdit = useCallback(() => {
    onEdit(user);
  }, [onEdit, user]);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-medium text-gray-900">{displayName}</h3>
      <p className="text-sm text-gray-500">{user.email}</p>
      <div className="mt-4 flex space-x-2">
        <Button size="sm" onClick={handleEdit}>수정</Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(user)}>삭제</Button>
      </div>
    </div>
  );
});

UserCard.displayName = 'UserCard';
```

### 2. 데이터 페칭 최적화
```typescript
// 페이지네이션과 캐싱 최적화
const useOptimizedUsers = () => {
  const [cache, setCache] = useState<Map<string, PaginatedResponse<User>>>(new Map());
  
  const fetchUsersWithCache = useCallback(async (params: SearchParams) => {
    const cacheKey = JSON.stringify(params);
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }
    
    const result = await userService.getUsers(params);
    setCache(prev => new Map(prev).set(cacheKey, result));
    
    return result;
  }, [cache]);
  
  return { fetchUsersWithCache };
};
```

### 3. 번들 최적화
```typescript
// 동적 import로 코드 스플리팅
const UserDetailModal = lazy(() => import('@/components/modals/UserDetailModal'));
const RoleAssignModal = lazy(() => import('@/components/modals/RoleAssignModal'));

// 조건부 렌더링으로 번들 크기 최적화
{showUserModal && (
  <Suspense fallback={<LoadingSpinner />}>
    <UserDetailModal user={selectedUser} onClose={() => setShowUserModal(false)} />
  </Suspense>
)}
```

## 보안 가이드

### 1. 입력 검증
```typescript
// 클라이언트 사이드 검증
const validateUserInput = (data: any): ValidationResult => {
  const errors: string[] = [];
  
  // XSS 방지
  if (typeof data.name === 'string' && /<script|javascript:/i.test(data.name)) {
    errors.push('이름에 스크립트가 포함될 수 없습니다.');
  }
  
  // SQL Injection 방지 기본 패턴
  const suspiciousPatterns = [/union\s+select/i, /drop\s+table/i, /;--/];
  if (suspiciousPatterns.some(pattern => pattern.test(data.email || ''))) {
    errors.push('잘못된 이메일 형식입니다.');
  }
  
  return { isValid: errors.length === 0, errors };
};
```

### 2. 역할 기반 접근 제어
```typescript
// 페이지 레벨 권한 검사
const withAdminAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  return function AdminProtectedComponent(props: P) {
    const { user } = useAuth();
    
    if (!hasAdminRole(user)) {
      return <UnauthorizedPage />;
    }
    
    return <WrappedComponent {...props} />;
  };
};

// 사용 예시
export default withAdminAuth(function SuperAdminPage() {
  // 최고 관리자만 접근 가능한 페이지
  return <div>Super Admin Content</div>;
});
```

## 테스트 가이드

### 1. 컴포넌트 테스트
```typescript
// src/components/__tests__/UserCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from '../UserCard';

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  isActive: true
};

describe('UserCard', () => {
  it('사용자 정보를 올바르게 표시한다', () => {
    render(<UserCard user={mockUser} onEdit={jest.fn()} onDelete={jest.fn()} />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
  
  it('수정 버튼 클릭시 onEdit 콜백이 호출된다', () => {
    const onEdit = jest.fn();
    render(<UserCard user={mockUser} onEdit={onEdit} onDelete={jest.fn()} />);
    
    fireEvent.click(screen.getByText('수정'));
    expect(onEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

### 2. Redux 슬라이스 테스트
```typescript
// src/store/slices/__tests__/userSlice.test.ts
import { configureStore } from '@reduxjs/toolkit';
import userSlice, { setSelectedUser, setFilters } from '../userSlice';

describe('userSlice', () => {
  let store: ReturnType<typeof configureStore>;
  
  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userSlice.reducer
      }
    });
  });
  
  it('선택된 사용자를 설정한다', () => {
    const user = { id: '1', name: 'Test User', email: 'test@example.com' };
    
    store.dispatch(setSelectedUser(user));
    
    expect(store.getState().user.selectedUser).toEqual(user);
  });
  
  it('필터 변경시 페이지를 1로 리셋한다', () => {
    const filters = { role: 'admin' };
    
    store.dispatch(setFilters(filters));
    
    const state = store.getState().user;
    expect(state.filters).toEqual(filters);
    expect(state.pagination.currentPage).toBe(1);
  });
});
```

## 배포 가이드

### 1. 프로덕션 빌드
```bash
# TypeScript 검증
npm run type-check

# 린팅 검증
npm run lint

# 프로덕션 빌드
npm run build

# 빌드 결과 테스트
npm run start
```

### 2. Docker 설정 (필요시)
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3210
ENV PORT 3210

CMD ["node", "server.js"]
```

## 문제 해결

### 일반적인 이슈

#### 1. 인증 관련 문제
- **증상**: 로그인 후에도 계속 로그인 페이지로 리다이렉트
- **해결**: auth-server CORS 설정 확인, 쿠키 도메인 설정 검증

#### 2. 권한 관련 문제
- **증상**: 관리자임에도 일반 포탈로 리다이렉트
- **해결**: hasAdminRole 함수의 역할 검증 로직 확인, 사용자 역할 데이터 검증

#### 3. API 호출 실패
- **증상**: 백엔드 API 호출 실패
- **해결**: 환경 변수 확인, 네트워크 연결 확인, CORS 설정 검증

### 디버깅 도구
- **React DevTools**: 컴포넌트 상태 확인
- **Redux DevTools**: 상태 변화 추적  
- **Network Tab**: API 호출 모니터링
- **Console**: 에러 로그 확인

## @krgeobuk 패키지 활용

### 주요 패키지 사용법

#### 1. @krgeobuk/http-client
```typescript
// 다중 서버 HTTP 클라이언트
import { HttpClient } from '@krgeobuk/http-client';

// 설정 및 사용은 위의 서비스 레이어 패턴 참조
```

#### 2. @krgeobuk/core
```typescript
// 공통 인터페이스와 유틸리티
import type { PaginatedResponse, ResponseFormat } from '@krgeobuk/core/interfaces';
import { caseConverter } from '@krgeobuk/core/utils';
```

#### 3. 도메인별 패키지
```typescript
// 각 도메인의 DTO와 인터페이스 활용
import type { CreateUserDto, UpdateUserDto } from '@krgeobuk/user/dtos';
import type { CreateRoleDto, UpdateRoleDto } from '@krgeobuk/role/dtos';
import type { CreatePermissionDto } from '@krgeobuk/permission/dtos';
```

---

Portal Admin Client는 krgeobuk 생태계의 중앙 관리 허브로서, 높은 보안성과 사용성을 모두 만족하는 관리자 포탈을 지향합니다.