# CLAUDE.md - Portal Admin Client

이 파일은 portal-admin-client 작업 시 Claude Code의 가이드라인을 제공합니다.

## 프로젝트 개요

portal-admin-client는 krgeobuk 생태계의 중앙 관리 인터페이스로, Next.js 15로 구축된 관리자 전용 웹 애플리케이션입니다. 사용자, 역할, 권한, 서비스를 통합 관리합니다.

### 기술 스택
- **Next.js 15** (App Router), **TypeScript 5**
- **TanStack Query 5** - 서버 상태 관리
- **Zustand 5** - 클라이언트 전역 상태
- **React Context** - 인증 Context (AuthProvider)
- **Tailwind CSS 3** - 유틸리티 CSS, 다크 모드 지원
- **React Hook Form 7** - 폼 관리
- **@krgeobuk/http-client** - Axios 기반 HTTP 클라이언트 (토큰 자동 갱신 내장)

## 핵심 명령어

```bash
# 개발 서버 (포트 3210)
npm run dev

# 빌드 & 프로덕션 서버
npm run build
npm run start

# 코드 품질
npm run lint          # ESLint 검사
npm run lint:fix      # ESLint 자동 수정
npm run type-check    # TypeScript 타입 검사
```

## 아키텍처

### 디렉터리 구조

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 대시보드 (/)
│   ├── users/page.tsx            # 사용자 관리
│   ├── roles/page.tsx            # 역할 관리
│   ├── permissions/page.tsx      # 권한 관리
│   ├── services/page.tsx         # 서비스 관리
│   └── layout.tsx                # 루트 레이아웃 (AdminAuthGuard 적용)
│
├── components/
│   ├── auth/
│   │   └── AdminAuthGuard.tsx    # 관리자 권한 보호 컴포넌트
│   ├── common/                   # 공통 UI (Button, Modal, Table, Toast 등)
│   ├── layout/                   # Layout, Header, Sidebar
│   ├── dashboard/                # StatsCard, SystemHealthCard, ActivityFeed 등
│   ├── modals/                   # 도메인별 폼 모달 (User/Role/Permission/Service)
│   └── providers/
│       └── Providers.tsx         # 루트 프로바이더
│
├── context/
│   └── AuthContext.tsx           # AuthProvider + useAuth()
│
├── hooks/
│   ├── queries/
│   │   ├── keys.ts               # Query Key Factory
│   │   ├── auth.ts               # useAuthInitialize, useMyProfile
│   │   ├── users.ts              # useUsers, useUserById
│   │   ├── roles.ts              # useRoles, useRoleById, useUserRoles
│   │   ├── permissions.ts        # usePermissions, useRolePermissions
│   │   └── services.ts           # useServices, useServiceVisibleRoles
│   ├── mutations/
│   │   ├── auth.ts               # useLogout
│   │   ├── users.ts              # useUpdateUser, useDeleteUser
│   │   ├── roles.ts              # useCreateRole, useUpdateRole, useDeleteRole 등
│   │   ├── permissions.ts        # useCreatePermission, useAssignPermissionToRole 등
│   │   └── services.ts           # useCreateService, useAssignVisibleRoleToService 등
│   ├── useAuth.ts                # Zustand + React Query 통합 인증 훅
│   ├── useUserProfile.ts         # 프로필 조회 + 권한 검증 훅 모음
│   ├── useDashboard.ts           # 대시보드 통계 집계 훅
│   ├── useErrorHandler.ts        # API 에러 핸들링
│   └── useDebounce.ts            # 디바운싱 유틸리티
│
├── services/
│   ├── base/
│   │   ├── BaseService.ts        # 공통 에러 핸들러
│   │   └── ErrorHandler.ts       # ServiceError 변환
│   ├── authService.ts            # 인증 API
│   ├── userService.ts            # 사용자 API
│   ├── roleService.ts            # 역할 API
│   ├── permissionService.ts      # 권한 API
│   └── serviceService.ts         # 서비스 API
│
├── store/
│   ├── authStore.ts              # Zustand: isAuthenticated, isInitialized
│   └── themeStore.ts             # Zustand: 다크 모드
│
├── lib/
│   └── httpClient.ts             # @krgeobuk/http-client (authApi, authzApi, portalApi)
│
├── utils/
│   └── roleUtils.ts              # hasAdminRole(), getAdminRoleNames()
│
└── types/
    └── api.ts                    # @krgeobuk/* 타입 재수출 + 로컬 타입
```

### 연결 서버

| 서버 | 환경 변수 | 포트 | 용도 |
|------|-----------|------|------|
| auth-server | `NEXT_PUBLIC_AUTH_SERVER_URL` | 8000 | 인증, 사용자 정보 |
| authz-server | `NEXT_PUBLIC_AUTHZ_SERVER_URL` | 8100 | 역할, 권한, 사용자-역할 매핑 |
| portal-server | `NEXT_PUBLIC_PORTAL_SERVER_URL` | 8200 | 서비스 등록 및 관리 |

---

# Portal Admin Client 개발 가이드

> **Next.js 공통 개발 표준**: [docs/KRGEOBUK_NEXTJS_CLIENT_GUIDE.md](../docs/KRGEOBUK_NEXTJS_CLIENT_GUIDE.md)를 필수로 참조하세요.

## 상태 관리 아키텍처

세 가지 상태 레이어를 목적에 따라 분리합니다.

```
서버 상태     → TanStack Query (React Query)
전역 UI 상태  → Zustand
인증 Context  → React Context (AuthProvider)
```

### 1. Zustand 스토어 패턴

```typescript
// src/store/authStore.ts
interface AuthStore {
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuthenticated: (value: boolean) => void;
  setInitialized: (value: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  isInitialized: false,
  setAuthenticated: (value): void => set({ isAuthenticated: value }),
  setInitialized: (value): void => set({ isInitialized: value }),
  clearAuth: (): void => set({ isAuthenticated: false, isInitialized: false }),
}));
```

### 2. React Query - Query Key Factory

모든 query key는 `src/hooks/queries/keys.ts`에서 중앙 관리합니다.

```typescript
// src/hooks/queries/keys.ts
export const queryKeys = {
  auth: {
    initialize: () => ['auth', 'initialize'] as const,
    myProfile:  () => ['auth', 'myProfile'] as const,
  },
  users: {
    all:    () => ['users'] as const,
    list:   (query?: object) => ['users', 'list', query] as const,
    detail: (id: string)     => ['users', 'detail', id] as const,
  },
  roles: {
    all:    () => ['roles'] as const,
    list:   (query?: object)   => ['roles', 'list', query] as const,
    detail: (id: string)       => ['roles', 'detail', id] as const,
    byUser: (userId: string)   => ['roles', 'user', userId] as const,
  },
  permissions: {
    all:    () => ['permissions'] as const,
    list:   (query?: object)       => ['permissions', 'list', query] as const,
    detail: (id: string)           => ['permissions', 'detail', id] as const,
    byRole: (roleId: string)       => ['permissions', 'role', roleId] as const,
    byUser: (userId: string)       => ['permissions', 'user', userId] as const,
  },
  services: {
    all:          () => ['services'] as const,
    list:         (query?: object)     => ['services', 'list', query] as const,
    detail:       (id: string)         => ['services', 'detail', id] as const,
    visibleRoles: (serviceId: string)  => ['services', 'roles', serviceId] as const,
  },
};
```

> **규칙**: 인라인 문자열 키 사용 금지. 반드시 `queryKeys.*` 사용.

### 3. React Query - 쿼리 훅 패턴

훅은 도메인별 파일로 그룹화합니다 (`queries/auth.ts`, `queries/users.ts` 등).

```typescript
// src/hooks/queries/users.ts
export function useUsers(query: UserSearchQuery = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(query),
    queryFn: () => userService.getUsers(query),
    staleTime: 2 * 60 * 1000,
  });
}

export function useUserById(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId ?? ''),
    queryFn: () => userService.getUserById(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
```

### 4. React Query - 뮤테이션 훅 패턴

뮤테이션 성공 후 반드시 관련 쿼리를 무효화합니다.

```typescript
// src/hooks/mutations/users.ts
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      userService.updateUser(id, data),
    onSuccess: (_, { id }): void => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
    },
  });
}
```

```typescript
// src/hooks/mutations/roles.ts
export function useAssignRoleToUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      roleService.assignRoleToUser(userId, roleId),
    onSuccess: (_, { userId }): void => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.byUser(userId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
    },
  });
}
```

### 5. AuthContext - 인증 상태 통합

`AuthContext`는 React Query 결과를 Zustand 스토어와 동기화합니다.

```typescript
// src/context/AuthContext.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuthenticated, setInitialized, clearAuth } = useAuthStore();
  const initQuery = useAuthInitialize();

  // React Query 결과 → Zustand 동기화
  useEffect(() => {
    if (initQuery.isSuccess) {
      const { isLogin, user } = initQuery.data;
      setAuthenticated(!!(isLogin && user));
      setInitialized(true);
    } else if (initQuery.isError) {
      setAuthenticated(false);
      setInitialized(true);
    }
  }, [initQuery.isSuccess, initQuery.isError, initQuery.data]);

  // shared-lib tokenCleared 이벤트 수신
  useEffect(() => {
    const handleTokenCleared = (): void => clearAuth();
    window.addEventListener('tokenCleared', handleTokenCleared);
    return (): void => window.removeEventListener('tokenCleared', handleTokenCleared);
  }, [clearAuth]);

  const value = {
    user: initQuery.data?.user ?? null,
    loading: initQuery.isPending,
    isLoggedIn: isAuthenticated,
    error: initQuery.error ? String(initQuery.error) : null,
    logout: () => logoutMutation.mutateAsync(),
    refreshUser: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.myProfile() }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

**컴포넌트에서 사용:**

```typescript
// AuthContext를 통해 (user, logout 등)
const { user, isLoggedIn, logout } = useAuth();

// Zustand를 통해 (경량 인증 상태만)
const { isAuthenticated, isInitialized } = useAuthStore();
```

---

## HTTP 클라이언트 패턴

### @krgeobuk/http-client 구조

```typescript
// src/lib/httpClient.ts
export const httpClient = new HttpClient(
  {
    auth:   { baseURL: process.env.NEXT_PUBLIC_AUTH_SERVER_URL!,   withCredentials: true },
    authz:  { baseURL: process.env.NEXT_PUBLIC_AUTHZ_SERVER_URL!,  withCredentials: true },
    portal: { baseURL: process.env.NEXT_PUBLIC_PORTAL_SERVER_URL!, withCredentials: true },
  },
  { refreshUrl: process.env.NEXT_PUBLIC_TOKEN_REFRESH_URL!, refreshBeforeExpiry: 5 * 60 * 1000 },
  { enableCSRF: true, enableInputValidation: true, enableSecurityLogging: true }
);

export const authApi   = { /* auth-server 전용 get/post/patch/delete */ };
export const authzApi  = { /* authz-server 전용 */ };
export const portalApi = { /* portal-server 전용 */ };
export const tokenManager = httpClient.getTokenManager();
```

> **규칙**: 서버별로 `authApi`, `authzApi`, `portalApi`를 구분해서 사용. 직접 `axios.create()` 사용 금지.

### 서비스 레이어 패턴

서비스는 `BaseService`를 상속하는 클래스로 구현하고 싱글톤으로 내보냅니다.

```typescript
// src/services/roleService.ts
export class RoleService extends BaseService {
  // authz-server에서 역할 목록 조회
  async getRoles(query: RoleSearchQuery = {}): Promise<PaginatedResult<RoleSearchResult>> {
    try {
      const response = await authzApi.get<PaginatedResult<RoleSearchResult>>('/roles', {
        params: query,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // 역할에 권한 할당
  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    try {
      await authzApi.post<void>(`/roles/${roleId}/permissions/${permissionId}`);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const roleService = new RoleService(); // 싱글톤
```

**서버별 API 객체 사용 규칙:**

| 도메인 | API 객체 | 서버 |
|--------|----------|------|
| 인증, 사용자 | `authApi` | auth-server (8000) |
| 역할, 권한 | `authzApi` | authz-server (8100) |
| 서비스 | `portalApi` | portal-server (8200) |

---

## 관리자 권한 시스템

### AdminAuthGuard

루트 레이아웃에서 `AdminAuthGuard`가 모든 페이지를 보호합니다.

```typescript
// src/components/auth/AdminAuthGuard.tsx
export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { isInitialized } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // 미인증 → 로그인 페이지로 리다이렉트
      const redirectUri = encodeURIComponent(window.location.href);
      window.location.href =
        `${process.env.NEXT_PUBLIC_AUTH_SERVER_URL}/auth/login?redirect_uri=${redirectUri}`;
      return;
    }

    if (isAuthenticated && user && !hasAdminRole(user)) {
      // 일반 사용자 → 포탈 클라이언트로 리다이렉트
      window.location.href =
        process.env.NEXT_PUBLIC_PORTAL_CLIENT_URL || 'http://localhost:3200';
    }
  }, [isAuthenticated, user, isLoading]);

  if (!isInitialized || isLoading || !isAuthenticated) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated && user && !hasAdminRole(user)) {
    return <UnauthorizedMessage />;
  }

  return <>{children}</>;
};
```

### hasAdminRole 유틸리티

```typescript
// src/utils/roleUtils.ts
import { isAdminLevelRole } from '@krgeobuk/core/constants';

export function hasAdminRole(user: UserWithRoles | null): boolean {
  if (!user) return false;
  if (!user.authorization?.roles) return false;

  return user.authorization.roles.some((roleName: string) =>
    isAdminLevelRole(roleName)
  );
}
```

**관리자 역할 목록** (`@krgeobuk/core` 상수):
- `super-admin` (최고 관리자)
- `system-admin` (시스템 관리자)
- `portal-admin` (포탈 관리자)
- `admin` (일반 관리자)

### 권한 검증 훅

```typescript
// src/hooks/useUserProfile.ts
export const usePermission = (permission: string): boolean => {
  const { permissions } = useUserProfile();
  return permissions.includes(permission);
};

export const useRole = (role: string): boolean => {
  const { roles } = useUserProfile();
  return roles.includes(role);
};

// 사용 예시
const canEdit = usePermission('user.update');
const isSuperAdmin = useRole('super-admin');
```

---

## 인증 흐름

```
앱 시작 → Providers.tsx
  └─ AuthProvider
       └─ useAuthInitialize()        # POST /auth/initialize
            ├─ 성공 → tokenManager.setAccessToken()
            │         setAuthenticated(true), setInitialized(true)
            │         useMyProfile() 활성화 (enabled: isAuthenticated)
            └─ 실패 → setAuthenticated(false), setInitialized(true)

                ↓
        AdminAuthGuard
            ├─ 미인증 → /auth/login?redirect_uri=...
            ├─ 관리자 아님 → NEXT_PUBLIC_PORTAL_CLIENT_URL
            └─ 관리자 확인 → 페이지 렌더링

로그아웃 → useLogout()
  └─ POST /auth/logout
       → clearAuth() (Zustand)
       → invalidate authInitialize
       → remove myProfile 캐시
```

---

## 대시보드 훅

대시보드는 `useDashboard` 훅으로 여러 쿼리를 집계합니다.

```typescript
// src/hooks/useDashboard.ts
export const useDashboard = () => {
  const queryClient = useQueryClient();

  // 3개 쿼리 병렬 실행
  const { data: usersData }       = useUsers({ limit: 100 });
  const { data: rolesData }       = useRoles({ limit: 100 });
  const { data: permissionsData } = usePermissions({ limit: 100 });

  // useMemo로 통계 계산 (성능 최적화)
  const statistics = useMemo(() => ({
    users:       { total, active, inactive, recentRegistrations },
    roles:       { total, byService, avgPermissionsPerRole },
    permissions: { total, byService },
    analytics:   { dailyActiveUsers, loginTrends, topRoles, systemHealth },
  }), [usersData, rolesData, permissionsData]);

  // 5분마다 자동 새로고침
  useEffect(() => {
    const interval = setInterval(() => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all() });
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [queryClient]);

  return { statistics, loading, error, lastUpdated, fetchStatistics };
};
```

---

## Providers.tsx 구조

```typescript
// src/components/providers/Providers.tsx
export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { retry: 1, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false },
      mutations: { retry: 0 },
    },
  }));

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeInitializer />
        <AuthProvider>
          {children}
          <ToastContainer position="top-right" maxToasts={5} />
        </AuthProvider>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

---

## 페이지 구현 패턴

페이지는 React Query 훅과 mutation을 직접 사용합니다.

```typescript
// src/app/users/page.tsx
'use client';

export default function UsersPage(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState<UserSearchQuery>({});
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);

  // 쿼리 훅
  const { data: usersData, isPending: isLoading, error } = useUsers(searchQuery);
  const { data: userRoles } = useUserRoles(selectedUser?.id ?? null);

  // 뮤테이션 훅
  const updateUserMutation = useUpdateUser();
  const assignRoleMutation = useAssignRoleToUser();

  // 디바운스 검색
  const debouncedEmail = useDebounce(emailInput, 500);
  useEffect(() => {
    setSearchQuery(prev => ({ ...prev, email: debouncedEmail || undefined }));
  }, [debouncedEmail]);

  const handleSubmit = async (data: UserFormData) => {
    try {
      await updateUserMutation.mutateAsync({ id: selectedUser!.id, data });
      toast.success('수정 완료');
      closeModal();
    } catch (err) {
      handleApiError(err);
    }
  };

  return (
    <Layout>
      {error && <ErrorMessage message={String(error)} />}
      <SearchSection onSearch={setEmailInput} />
      <Table data={usersData?.items ?? []} loading={isLoading} onRowClick={openModal} />
      <Pagination pageInfo={usersData?.pageInfo} onChange={handlePageChange} />
      <UserFormModal onSubmit={handleSubmit} />
    </Layout>
  );
}
```

---

## 경로 별칭

```typescript
// tsconfig.json: "@/*" → "./src/*"
import { queryKeys }    from '@/hooks/queries/keys';
import { authService }  from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { authApi }      from '@/lib/httpClient';
import { hasAdminRole } from '@/utils/roleUtils';
```

---

## 환경 변수

```bash
# API 서버
NEXT_PUBLIC_AUTH_SERVER_URL=http://localhost:8000/auth
NEXT_PUBLIC_AUTHZ_SERVER_URL=http://localhost:8100/authz
NEXT_PUBLIC_PORTAL_SERVER_URL=http://localhost:8200/portal
NEXT_PUBLIC_TOKEN_REFRESH_URL=http://localhost:8000/auth/auth/refresh

# 클라이언트 URL
NEXT_PUBLIC_ADMIN_CLIENT_URL=http://localhost:3210
NEXT_PUBLIC_PORTAL_CLIENT_URL=http://localhost:3200

# 환경
NEXT_PUBLIC_ENVIRONMENT=local
NODE_ENV=local
NEXT_TELEMETRY_DISABLED=1

# 보안
ALLOWED_ORIGINS=localhost,127.0.0.1
NEXT_PUBLIC_API_TIMEOUT=15000
NEXT_PUBLIC_ENABLE_CSRF=true
NEXT_PUBLIC_ENABLE_INPUT_VALIDATION=true
NEXT_PUBLIC_ENABLE_SECURITY_LOGGING=true
```

전체 목록: `.env.example`

---

## 개발 체크리스트

### 데이터 패칭
- [ ] 서버 상태는 React Query 사용 (`useQuery`, `useMutation`)
- [ ] query key는 반드시 `queryKeys.*` 사용 (인라인 문자열 금지)
- [ ] mutation 성공 후 관련 query `invalidateQueries` 또는 `removeQueries`
- [ ] `staleTime` 설정으로 불필요한 리패치 방지

### 상태 관리
- [ ] 전역 UI 상태 → Zustand
- [ ] 인증 상태 → `useAuthStore()` (isAuthenticated, isInitialized)
- [ ] 인증 정보 (user, logout) → `useAuth()` (AuthContext)

### HTTP 통신
- [ ] 서버별 API 인스턴스 구분: `authApi`, `authzApi`, `portalApi`
- [ ] 직접 axios 사용 금지 → `@krgeobuk/http-client` 사용
- [ ] 서비스 클래스는 `BaseService` 상속, 싱글톤으로 내보내기

### 권한 관리
- [ ] `hasAdminRole()` 유틸리티로 관리자 역할 검증
- [ ] `usePermission(action)` / `useRole(role)` 훅으로 세부 권한 검증
- [ ] `AdminAuthGuard`가 루트 레이아웃에 적용되어 있는지 확인

### 코드 품질
- [ ] `npm run type-check` 통과
- [ ] `npm run lint` 통과
- [ ] `'use client'` 지시어 필요한 컴포넌트에만 사용
- [ ] 이미지는 `next/image` 사용
