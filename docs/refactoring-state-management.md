# portal-admin-client 상태관리 리팩토링 계획

## 개요

Redux Toolkit 기반 상태관리를 **react-query + Zustand** 조합으로 전환합니다.

> **상태: 계획** (2026-02)

### portal-client 대비 규모 차이

| 항목 | portal-client | portal-admin-client |
|------|-------------|-------------------|
| Redux slice 수 | 2개 (auth, user) | **5개** (auth, user, role, permission, service) |
| 백엔드 서버 | 1개 (auth-server) | **3개** (auth/authz/portal-server) |
| Query 훅 | 4개 | **14개** |
| Mutation 훅 | 4개 | **21개** |
| 페이지 컴포넌트 수정 | 없음 (훅 시그니처 유지) | **4개 페이지 수정 필요** |

---

## 현재 상태 분석

### Redux Slice 목록

| Slice | 비동기 액션 수 | 연동 서버 | 역할 |
|-------|------------|---------|------|
| `authSlice` | 3개 (initialize, fetchProfile, logout) | auth-server | 인증 상태 |
| `userSlice` | 4개 (fetchUsers, fetchUserById, updateUser, deleteUser) | auth-server | 사용자 CRUD |
| `roleSlice` | 8개 (CRUD + 사용자 역할 할당) | authz-server | 역할 관리 |
| `permissionSlice` | 13개 (CRUD + 역할 권한 할당) | authz-server | 권한 관리 |
| `serviceSlice` | 8개 (CRUD + 가시성 역할 할당) | portal-server | 서비스 관리 |

### 현재 문제점

| 문제 | 설명 |
|-----|------|
| 서버 상태 수동 관리 | 페이지 이동 후 stale 데이터가 남아있어 refetch 필요 |
| 복잡한 slice 구조 | permissionSlice만 13개 thunk — 보일러플레이트 과다 |
| 캐시 무효화 수동 처리 | 역할 생성 후 목록 refetch를 dispatch로 직접 구현 |
| 이중 계층 | AuthContext가 Redux를 다시 Context로 감싸는 불필요한 계층 |
| 페이지 직접 dispatch | 페이지 컴포넌트가 useAppDispatch/useAppSelector에 직접 의존 |

---

## 상태 분류

### 서버 상태 → react-query

#### Auth 도메인
| Redux 코드 | 전환 | queryKey |
|-----------|------|---------|
| `initializeAuth` thunk | `useAuthInitialize` query | `['auth', 'initialize']` |
| `fetchUserProfile` thunk | `useMyProfile` query | `['auth', 'myProfile']` |
| `logoutUser` thunk | `useLogout` mutation | - |

#### User 도메인 (auth-server)
| Redux 코드 | 전환 | queryKey |
|-----------|------|---------|
| `fetchUsers` thunk | `useUsers` query | `['users', query]` |
| `fetchUserById` thunk | `useUserById` query | `['users', 'detail', id]` |
| `updateUser` thunk | `useUpdateUser` mutation | 성공 시 users 무효화 |
| `deleteUser` thunk | `useDeleteUser` mutation | 성공 시 users 무효화 |

#### Role 도메인 (authz-server)
| Redux 코드 | 전환 | queryKey |
|-----------|------|---------|
| `fetchRoles` thunk | `useRoles` query | `['roles', query]` |
| `fetchRoleById` thunk | `useRoleById` query | `['roles', 'detail', id]` |
| `fetchUserRoles` thunk | `useUserRoles` query | `['roles', 'user', userId]` |
| `createRole` thunk | `useCreateRole` mutation | 성공 시 roles 무효화 |
| `updateRole` thunk | `useUpdateRole` mutation | 성공 시 roles 무효화 |
| `deleteRole` thunk | `useDeleteRole` mutation | 성공 시 roles 무효화 |
| `assignRoleToUser` thunk | `useAssignRoleToUser` mutation | 성공 시 user roles 무효화 |
| `removeRoleFromUser` thunk | `useRemoveRoleFromUser` mutation | 성공 시 user roles 무효화 |

#### Permission 도메인 (authz-server)
| Redux 코드 | 전환 | queryKey |
|-----------|------|---------|
| `fetchPermissions` thunk | `usePermissions` query | `['permissions', query]` |
| `fetchPermissionById` thunk | `usePermissionById` query | `['permissions', 'detail', id]` |
| `fetchRolePermissions` thunk | `useRolePermissions` query | `['permissions', 'role', roleId]` |
| `fetchUserPermissions` thunk | `useUserPermissions` query | `['permissions', 'user', userId]` |
| `createPermission` thunk | `useCreatePermission` mutation | 성공 시 permissions 무효화 |
| `updatePermission` thunk | `useUpdatePermission` mutation | 성공 시 permissions 무효화 |
| `deletePermission` thunk | `useDeletePermission` mutation | 성공 시 permissions 무효화 |
| `assignPermissionToRole` thunk | `useAssignPermissionToRole` mutation | 성공 시 role permissions 무효화 |
| `removePermissionFromRole` thunk | `useRemovePermissionFromRole` mutation | 성공 시 role permissions 무효화 |
| `assignMultiplePermissionsToRole` thunk | `useAssignMultiplePermissionsToRole` mutation | 성공 시 role permissions 무효화 |
| `replaceRolePermissions` thunk | `useReplaceRolePermissions` mutation | 성공 시 role permissions 무효화 |

#### Service 도메인 (portal-server)
| Redux 코드 | 전환 | queryKey |
|-----------|------|---------|
| `fetchServices` thunk | `useServices` query | `['services', query]` |
| `fetchServiceById` thunk | `useServiceById` query | `['services', 'detail', id]` |
| `fetchServiceVisibleRoles` thunk | `useServiceVisibleRoles` query | `['services', 'roles', serviceId]` |
| `createService` thunk | `useCreateService` mutation | 성공 시 services 무효화 |
| `updateService` thunk | `useUpdateService` mutation | 성공 시 services 무효화 |
| `deleteService` thunk | `useDeleteService` mutation | 성공 시 services 무효화 |
| `assignVisibleRoleToService` thunk | `useAssignVisibleRoleToService` mutation | 성공 시 service roles 무효화 |
| `removeVisibleRoleFromService` thunk | `useRemoveVisibleRoleFromService` mutation | 성공 시 service roles 무효화 |
| `replaceServiceVisibleRoles` thunk | `useReplaceServiceVisibleRoles` mutation | 성공 시 service roles 무효화 |

### 클라이언트 상태 → Zustand

| Redux/Context 코드 | 전환 | 비고 |
|-------------------|------|------|
| `authSlice.isAuthenticated` | `authStore.isAuthenticated` | 서버 응답의 isLogin 플래그 기반 |
| `authSlice.isInitialized` | `authStore.isInitialized` | 앱 초기화 완료 여부 |
| `ThemeContext.theme` | `themeStore.theme` | localStorage 연동 |
| `ThemeContext.actualTheme` | `themeStore.actualTheme` | 시스템 테마 감지 |

---

## 새로운 파일 구조

```
src/
├── store/
│   ├── authStore.ts                       # [신규] Zustand 인증 상태
│   └── themeStore.ts                      # [신규] Zustand 테마 상태
├── hooks/
│   ├── queries/
│   │   ├── keys.ts                        # [신규] Query Key Factory
│   │   ├── useAuthInitialize.ts           # [신규]
│   │   ├── useMyProfile.ts                # [신규]
│   │   ├── useUsers.ts                    # [신규]
│   │   ├── useUserById.ts                 # [신규]
│   │   ├── useRoles.ts                    # [신규]
│   │   ├── useRoleById.ts                 # [신규]
│   │   ├── useUserRoles.ts                # [신규]
│   │   ├── usePermissions.ts              # [신규]
│   │   ├── usePermissionById.ts           # [신규]
│   │   ├── useRolePermissions.ts          # [신규]
│   │   ├── useUserPermissions.ts          # [신규]
│   │   ├── useServices.ts                 # [신규]
│   │   ├── useServiceById.ts              # [신규]
│   │   └── useServiceVisibleRoles.ts      # [신규]
│   ├── mutations/
│   │   ├── useLogout.ts                   # [신규]
│   │   ├── useUpdateUser.ts               # [신규]
│   │   ├── useDeleteUser.ts               # [신규]
│   │   ├── useCreateRole.ts               # [신규]
│   │   ├── useUpdateRole.ts               # [신규]
│   │   ├── useDeleteRole.ts               # [신규]
│   │   ├── useAssignRoleToUser.ts         # [신규]
│   │   ├── useRemoveRoleFromUser.ts       # [신규]
│   │   ├── useCreatePermission.ts         # [신규]
│   │   ├── useUpdatePermission.ts         # [신규]
│   │   ├── useDeletePermission.ts         # [신규]
│   │   ├── useAssignPermissionToRole.ts   # [신규]
│   │   ├── useRemovePermissionFromRole.ts # [신규]
│   │   ├── useAssignMultiplePermissionsToRole.ts # [신규]
│   │   ├── useReplaceRolePermissions.ts   # [신규]
│   │   ├── useCreateService.ts            # [신규]
│   │   ├── useUpdateService.ts            # [신규]
│   │   ├── useDeleteService.ts            # [신규]
│   │   ├── useAssignVisibleRoleToService.ts # [신규]
│   │   ├── useRemoveVisibleRoleFromService.ts # [신규]
│   │   └── useReplaceServiceVisibleRoles.ts # [신규]
│   ├── useAuth.ts                         # [수정] Zustand + react-query 기반
│   └── useUserProfile.ts                  # [수정] useMyProfile query 기반
├── components/
│   ├── common/
│   │   └── ThemeInitializer.tsx           # [신규] 테마 DOM 처리
│   ├── auth/
│   │   └── AdminAuthGuard.tsx             # [수정] authStore.isInitialized 사용
│   └── providers/
│       └── Providers.tsx                  # [수정] QueryClientProvider + ThemeInitializer
├── context/
│   └── AuthContext.tsx                    # [수정] Redux 제거, react-query 기반 단순화
└── app/
    ├── users/page.tsx                     # [수정] react-query 훅 사용
    ├── roles/page.tsx                     # [수정] react-query 훅 사용
    ├── permissions/page.tsx               # [수정] react-query 훅 사용
    └── services/page.tsx                  # [수정] react-query 훅 사용
```

### 삭제 파일

| 파일 | 이유 |
|------|------|
| `src/store/index.ts` | Redux store 제거 |
| `src/store/hooks.ts` | useAppDispatch/useAppSelector 불필요 |
| `src/store/slices/authSlice.ts` | react-query + Zustand로 대체 |
| `src/store/slices/userSlice.ts` | react-query로 대체 |
| `src/store/slices/roleSlice.ts` | react-query로 대체 |
| `src/store/slices/permissionSlice.ts` | react-query로 대체 |
| `src/store/slices/serviceSlice.ts` | react-query로 대체 |
| `src/context/ThemeContext.tsx` | themeStore + ThemeInitializer로 대체 |

---

## 마이그레이션 단계

### Phase 1: 패키지 설치 + Provider 설정

```bash
# 추가
npm install @tanstack/react-query zustand
npm install @tanstack/react-query-devtools -D

# 제거 (Phase 13에서)
# npm uninstall @reduxjs/toolkit react-redux
```

**Providers.tsx 최종 형태:**
```typescript
return (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      <AuthProvider>
        <AdminAuthGuard>
          <Layout showSidebar>{children}</Layout>
        </AdminAuthGuard>
        <ToastContainer position="top-right" maxToasts={5} />
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
```

> **참고**: portal-client와 달리 `AdminAuthGuard`가 `Layout`을 감싸는 구조로 변경.

---

### Phase 2: Zustand 스토어 + ThemeInitializer

portal-client와 동일하게 생성:

- `src/store/authStore.ts` — `isAuthenticated`, `isInitialized`, `setAuthenticated`, `setInitialized`, `clearAuth`
- `src/store/themeStore.ts` — `theme`, `actualTheme`, `setTheme`, `setActualTheme`, `toggleTheme`
- `src/components/common/ThemeInitializer.tsx` — 테마 DOM 사이드이펙트 처리

---

### Phase 3: Query Key Factory

**파일**: `src/hooks/queries/keys.ts`

규모가 크기 때문에 portal-client와 달리 **반드시** Key Factory를 도입합니다.

```typescript
export const queryKeys = {
  auth: {
    initialize: () => ['auth', 'initialize'] as const,
    myProfile: () => ['auth', 'myProfile'] as const,
  },
  users: {
    all: () => ['users'] as const,
    list: (query?: object) => ['users', 'list', query] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  roles: {
    all: () => ['roles'] as const,
    list: (query?: object) => ['roles', 'list', query] as const,
    detail: (id: string) => ['roles', 'detail', id] as const,
    byUser: (userId: string) => ['roles', 'user', userId] as const,
  },
  permissions: {
    all: () => ['permissions'] as const,
    list: (query?: object) => ['permissions', 'list', query] as const,
    detail: (id: string) => ['permissions', 'detail', id] as const,
    byRole: (roleId: string) => ['permissions', 'role', roleId] as const,
    byUser: (userId: string) => ['permissions', 'user', userId] as const,
  },
  services: {
    all: () => ['services'] as const,
    list: (query?: object) => ['services', 'list', query] as const,
    detail: (id: string) => ['services', 'detail', id] as const,
    visibleRoles: (serviceId: string) => ['services', 'roles', serviceId] as const,
  },
} as const;
```

---

### Phase 4: Auth Query/Mutation 훅

portal-client와 거의 동일 구조:

- `src/hooks/queries/useAuthInitialize.ts`
- `src/hooks/queries/useMyProfile.ts`
- `src/hooks/mutations/useLogout.ts`

`useLogout` 특이사항: 로그아웃 성공 시 모든 도메인 캐시 클리어:
```typescript
onSuccess: () => {
  clearAuth();
  queryClient.clear(); // 모든 캐시 제거 (admin은 데이터 민감도 높음)
},
```

---

### Phase 5: User Query/Mutation 훅

```typescript
// src/hooks/queries/useUsers.ts
export function useUsers(query: UserSearchQuery = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(query),
    queryFn: () => userService.getUsers(query),
    staleTime: 2 * 60 * 1000,
  });
}

// src/hooks/mutations/useUpdateUser.ts
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      userService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
    },
  });
}

// src/hooks/mutations/useDeleteUser.ts
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
    },
  });
}
```

---

### Phase 6: Role Query/Mutation 훅 (8개)

**Queries** (3개):
- `useRoles(query)` — 역할 목록
- `useRoleById(roleId)` — 역할 상세
- `useUserRoles(userId)` — 사용자 역할 목록 (enabled: !!userId)

**Mutations** (5개):
- `useCreateRole` — 성공 시 `queryKeys.roles.all()` 무효화
- `useUpdateRole` — 성공 시 roles.all + roles.detail 무효화
- `useDeleteRole` — 성공 시 roles.all 무효화
- `useAssignRoleToUser` — 성공 시 `queryKeys.roles.byUser(userId)` 무효화
- `useRemoveRoleFromUser` — 성공 시 `queryKeys.roles.byUser(userId)` 무효화

---

### Phase 7: Permission Query/Mutation 훅 (11개)

**Queries** (4개):
- `usePermissions(query)` — 권한 목록
- `usePermissionById(permissionId)` — 권한 상세
- `useRolePermissions(roleId)` — 역할의 권한 목록 (enabled: !!roleId)
- `useUserPermissions(userId)` — 사용자의 권한 목록 (enabled: !!userId)

**Mutations** (7개):
- `useCreatePermission` — permissions.all 무효화
- `useUpdatePermission` — permissions.all + permissions.detail 무효화
- `useDeletePermission` — permissions.all 무효화
- `useAssignPermissionToRole` — `queryKeys.permissions.byRole(roleId)` 무효화
- `useRemovePermissionFromRole` — `queryKeys.permissions.byRole(roleId)` 무효화
- `useAssignMultiplePermissionsToRole` — `queryKeys.permissions.byRole(roleId)` 무효화
- `useReplaceRolePermissions` — `queryKeys.permissions.byRole(roleId)` 무효화

---

### Phase 8: Service Query/Mutation 훅 (9개)

**Queries** (3개):
- `useServices(query)` — 서비스 목록
- `useServiceById(serviceId)` — 서비스 상세
- `useServiceVisibleRoles(serviceId)` — 서비스 가시성 역할 (enabled: !!serviceId)

**Mutations** (6개):
- `useCreateService` — services.all 무효화
- `useUpdateService` — services.all + services.detail 무효화
- `useDeleteService` — services.all 무효화
- `useAssignVisibleRoleToService` — `queryKeys.services.visibleRoles(serviceId)` 무효화
- `useRemoveVisibleRoleFromService` — `queryKeys.services.visibleRoles(serviceId)` 무효화
- `useReplaceServiceVisibleRoles` — `queryKeys.services.visibleRoles(serviceId)` 무효화

---

### Phase 9: AuthContext 단순화

portal-client와 동일한 패턴:

```typescript
export function AuthProvider({ children }): React.JSX.Element {
  const queryClient = useQueryClient();
  const { setAuthenticated, setInitialized, clearAuth, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();
  const initQuery = useAuthInitialize();

  useEffect(() => {
    if (initQuery.isSuccess) {
      const { isLogin, user } = initQuery.data;
      setAuthenticated(!!(isLogin && user));
      setInitialized(true);
    } else if (initQuery.isError) {
      setAuthenticated(false);
      setInitialized(true);
    }
  }, [initQuery.isSuccess, initQuery.isError, initQuery.data, setAuthenticated, setInitialized]);

  useEffect(() => {
    const handleTokenCleared = (): void => clearAuth();
    window.addEventListener('tokenCleared', handleTokenCleared);
    return (): void => window.removeEventListener('tokenCleared', handleTokenCleared);
  }, [clearAuth]);

  // ...
}
```

---

### Phase 10: 커스텀 훅 수정

**useAuth.ts** (portal-client와 동일):
```typescript
export const useAuth = () => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const initQuery = useAuthInitialize({ enabled: !isInitialized });

  return {
    user: initQuery.data?.user ?? null,
    isAuthenticated,
    isLoading: initQuery.isPending,
    error: initQuery.error ? String(initQuery.error) : null,
    isInitialized,
  };
};
```

**useUserProfile.ts** (portal-client와 동일):
- `useMyProfile` query 기반으로 재작성
- usePermission, useRole, usePermissions, useAnyRole 파생 훅 유지

---

### Phase 11: 컴포넌트 수정

**AdminAuthGuard.tsx**:
```typescript
// Before
const { isAuthenticated, user, isLoading } = useAuth();
if (isLoading) return <PageLoader />;

// After
import { useAuthStore } from '@/store/authStore';
const { isInitialized } = useAuthStore();
const { isAuthenticated, user, isLoading } = useAuth();
if (!isInitialized || isLoading) return <PageLoader message="관리자 권한을 확인하는 중..." />;
```

**ThemeToggle** (존재하는 경우):
- `useTheme(ThemeContext)` → `useThemeStore()`

**Providers.tsx**:
- `ThemeProvider` → `ThemeInitializer`
- Redux `Provider` 제거
- `ReactQueryDevtools` 추가

---

### Phase 12: 페이지 컴포넌트 수정

> **portal-client와의 가장 큰 차이점**: 페이지 컴포넌트가 Redux를 직접 사용하므로 수정 필요.

#### 수정 패턴 (users/page.tsx 예시)

```typescript
// Before (Redux 직접 사용)
const dispatch = useAppDispatch();
const { users, isLoading, error, pagination } = useAppSelector(state => state.user);
useEffect(() => { dispatch(fetchUsers(query)); }, [query]);
const handleDelete = async (id) => {
  await dispatch(deleteUser(id)).unwrap();
  dispatch(fetchUsers(query)); // 수동 refetch
};

// After (react-query 훅 사용)
const { data: usersData, isPending, error } = useUsers(query);
const deleteUserMutation = useDeleteUser(); // onSuccess에서 자동 무효화

const handleDelete = async (id) => {
  await deleteUserMutation.mutateAsync(id); // 완료 후 자동 refetch
};
```

#### 수정 대상 페이지

| 페이지 | 현재 사용 slice | 전환 훅 |
|--------|-------------|---------|
| `users/page.tsx` | userSlice, roleSlice, serviceSlice | useUsers, useRoles, useServices + mutations |
| `roles/page.tsx` | roleSlice, permissionSlice | useRoles, usePermissions + mutations |
| `permissions/page.tsx` | permissionSlice, roleSlice | usePermissions, useRoles + mutations |
| `services/page.tsx` | serviceSlice, roleSlice | useServices, useRoles + mutations |

#### useLoadingState 대체

기존 `useLoadingState` 훅은 mutation의 `isPending`으로 대체됩니다:

```typescript
// Before
const { isLoading, withLoading } = useLoadingState();
const handleDelete = withLoading('delete', async () => {
  await dispatch(deleteUser(id)).unwrap();
});

// After
const deleteUserMutation = useDeleteUser();
const handleDelete = async () => {
  await deleteUserMutation.mutateAsync(id);
};
// 버튼에서: disabled={deleteUserMutation.isPending}
```

---

### Phase 13: 정리 + 검증

**삭제 작업:**
```bash
rm src/store/index.ts
rm src/store/hooks.ts
rm src/store/slices/authSlice.ts
rm src/store/slices/userSlice.ts
rm src/store/slices/roleSlice.ts
rm src/store/slices/permissionSlice.ts
rm src/store/slices/serviceSlice.ts
rm src/context/ThemeContext.tsx
```

**package.json 정리:**
```bash
npm uninstall @reduxjs/toolkit react-redux
```

**검증:**
```bash
npm run type-check
npm run lint
npm run build
```

---

## 진행 순서

각 Phase 완료 후 `npm run build`로 확인하고 커밋:

| Phase | 내용 | 예상 커밋 메시지 |
|-------|------|----------------|
| 1 | 패키지 설치 + Provider 설정 | `refactor: Phase 1 패키지 + QueryClientProvider` |
| 2 | Zustand 스토어 + ThemeInitializer | `refactor: Phase 2 Zustand 스토어` |
| 3 | Query Key Factory | `refactor: Phase 3 Query Key Factory` |
| 4 | Auth Query/Mutation 훅 (3개) | `refactor: Phase 4 Auth 훅` |
| 5 | User Query/Mutation 훅 (4개) | `refactor: Phase 5 User 훅` |
| 6 | Role Query/Mutation 훅 (8개) | `refactor: Phase 6 Role 훅` |
| 7 | Permission Query/Mutation 훅 (11개) | `refactor: Phase 7 Permission 훅` |
| 8 | Service Query/Mutation 훅 (9개) | `refactor: Phase 8 Service 훅` |
| 9 | AuthContext 단순화 | `refactor: Phase 9 AuthContext` |
| 10 | useAuth, useUserProfile 수정 | `refactor: Phase 10 커스텀 훅` |
| 11 | AdminAuthGuard, ThemeToggle, Providers 수정 | `refactor: Phase 11 컴포넌트` |
| 12 | 페이지 컴포넌트 수정 (4개 페이지) | `refactor: Phase 12 페이지 컴포넌트` |
| 13 | Redux 파일 삭제 + 패키지 정리 + 빌드 검증 | `refactor: Phase 13 정리 및 검증` |

---

## portal-client 대비 추가 고려사항

### 1. Query Key Factory 필수 도입
5개 도메인 × 복수 queryKey → 인라인 관리 불가. `keys.ts` 파일로 중앙화 필수.

### 2. ReactQueryDevtools 추가
관리자 화면 특성상 데이터 캐시 상태 디버깅 중요. 개발 환경에서 활성화.

### 3. 페이지 컴포넌트 수정 범위
portal-client는 훅 시그니처 유지로 페이지 수정이 불필요했으나,
portal-admin-client는 페이지가 Redux를 직접 사용 → 4개 페이지 전면 수정 필요.

### 4. useLoadingState 처리
현재 일부 액션 버튼에서 사용 중. mutation의 `isPending`으로 대체하여 훅 제거 가능.
단, 복수의 mutation이 동시 사용되는 경우 각 mutation의 isPending을 구분해서 사용.

### 5. 캐시 무효화 전략
역할-권한, 서비스-역할 등 연관 관계가 복잡 → mutation 성공 시 관련 queryKey 범위 설정에 주의.
예: 역할 삭제 시 → `roles.all`, `permissions.byRole(roleId)`, `users 역할` 모두 무효화 검토.
