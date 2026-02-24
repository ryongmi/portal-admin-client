# portal-admin-client 상태관리 리팩토링

## 개요

Redux Toolkit 기반 상태관리를 **react-query + Zustand** 조합으로 전환했습니다.

> **상태: 완료** (2026-02)

### portal-client 대비 규모 차이

| 항목 | portal-client | portal-admin-client |
|------|-------------|-------------------|
| Redux slice 수 | 2개 (auth, user) | **5개** (auth, user, role, permission, service) |
| 백엔드 서버 | 1개 (auth-server) | **3개** (auth/authz/portal-server) |
| Query 훅 | 4개 | **14개** |
| Mutation 훅 | 4개 | **21개** |
| 페이지 컴포넌트 수정 | 없음 (훅 시그니처 유지) | **4개 페이지 수정 필요** |

---

## 이전 상태 (Redux 기반)

### Redux Slice 목록

| Slice | 비동기 액션 수 | 연동 서버 | 역할 |
|-------|------------|---------|------|
| `authSlice` | 3개 (initialize, fetchProfile, logout) | auth-server | 인증 상태 |
| `userSlice` | 4개 (fetchUsers, fetchUserById, updateUser, deleteUser) | auth-server | 사용자 CRUD |
| `roleSlice` | 8개 (CRUD + 사용자 역할 할당) | authz-server | 역할 관리 |
| `permissionSlice` | 13개 (CRUD + 역할 권한 할당) | authz-server | 권한 관리 |
| `serviceSlice` | 8개 (CRUD + 가시성 역할 할당) | portal-server | 서비스 관리 |

### 해결된 문제점

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
| `fetchUsers` thunk | `useUsers` query | `['users', 'list', query]` |
| `fetchUserById` thunk | `useUserById` query | `['users', 'detail', id]` |
| `updateUser` thunk | `useUpdateUser` mutation | 성공 시 users 무효화 |
| `deleteUser` thunk | `useDeleteUser` mutation | 성공 시 users 무효화 |

#### Role 도메인 (authz-server)
| Redux 코드 | 전환 | queryKey |
|-----------|------|---------|
| `fetchRoles` thunk | `useRoles` query | `['roles', 'list', query]` |
| `fetchRoleById` thunk | `useRoleById` query | `['roles', 'detail', id]` |
| `fetchUserRoles` thunk | `useUserRoles` query | `['roles', 'user', userId]` |
| `createRole` thunk | `useCreateRole` mutation | 성공 시 roles 무효화 |
| `updateRole` thunk | `useUpdateRole` mutation | 성공 시 roles.all + roles.detail 무효화 |
| `deleteRole` thunk | `useDeleteRole` mutation | 성공 시 roles.all 무효화 |
| `assignRoleToUser` thunk | `useAssignRoleToUser` mutation | 성공 시 `roles.byUser(userId)` 무효화 |
| `removeRoleFromUser` thunk | `useRemoveRoleFromUser` mutation | 성공 시 `roles.byUser(userId)` 무효화 |

#### Permission 도메인 (authz-server)
| Redux 코드 | 전환 | queryKey |
|-----------|------|---------|
| `fetchPermissions` thunk | `usePermissions` query | `['permissions', 'list', query]` |
| `fetchPermissionById` thunk | `usePermissionById` query | `['permissions', 'detail', id]` |
| `fetchRolePermissions` thunk | `useRolePermissions` query | `['permissions', 'role', roleId]` |
| `fetchUserPermissions` thunk | `useUserPermissions` query | `['permissions', 'user', userId]` |
| `createPermission` thunk | `useCreatePermission` mutation | permissions.all 무효화 |
| `updatePermission` thunk | `useUpdatePermission` mutation | permissions.all + permissions.detail 무효화 |
| `deletePermission` thunk | `useDeletePermission` mutation | permissions.all 무효화 |
| `assignPermissionToRole` thunk | `useAssignPermissionToRole` mutation | `permissions.byRole(roleId)` 무효화 |
| `removePermissionFromRole` thunk | `useRemovePermissionFromRole` mutation | `permissions.byRole(roleId)` 무효화 |
| `assignMultiplePermissionsToRole` thunk | `useAssignMultiplePermissionsToRole` mutation | `permissions.byRole(roleId)` 무효화 |
| `replaceRolePermissions` thunk | `useReplaceRolePermissions` mutation | `permissions.byRole(roleId)` 무효화 |

#### Service 도메인 (portal-server)
| Redux 코드 | 전환 | queryKey |
|-----------|------|---------|
| `fetchServices` thunk | `useServices` query | `['services', 'list', query]` |
| `fetchServiceById` thunk | `useServiceById` query | `['services', 'detail', id]` |
| `fetchServiceVisibleRoles` thunk | `useServiceVisibleRoles` query | `['services', 'roles', serviceId]` |
| `createService` thunk | `useCreateService` mutation | services.all 무효화 |
| `updateService` thunk | `useUpdateService` mutation | services.all + services.detail 무효화 |
| `deleteService` thunk | `useDeleteService` mutation | services.all 무효화 |
| `assignVisibleRoleToService` thunk | `useAssignVisibleRoleToService` mutation | `services.visibleRoles(serviceId)` 무효화 |
| `removeVisibleRoleFromService` thunk | `useRemoveVisibleRoleFromService` mutation | `services.visibleRoles(serviceId)` 무효화 |
| `replaceServiceVisibleRoles` thunk | `useReplaceServiceVisibleRoles` mutation | `services.visibleRoles(serviceId)` 무효화 |

### 클라이언트 상태 → Zustand

| Redux/Context 코드 | 전환 | 비고 |
|-------------------|------|------|
| `authSlice.isAuthenticated` | `authStore.isAuthenticated` | 서버 응답의 isLogin 플래그 기반 |
| `authSlice.isInitialized` | `authStore.isInitialized` | 앱 초기화 완료 여부 |
| `ThemeContext.theme` | `themeStore.theme` | localStorage 연동 |
| `ThemeContext.actualTheme` | `themeStore.actualTheme` | 시스템 테마 감지 |

---

## 최종 파일 구조

> **주요 변경**: 초기 계획은 훅별 개별 파일(33개)이었으나, Phase 6-8 완료 후 **도메인별 파일로 재구성** (커밋 `83f6e74`).

```
src/
├── store/
│   ├── authStore.ts                       # [신규] Zustand 인증 상태
│   └── themeStore.ts                      # [신규] Zustand 테마 상태
├── hooks/
│   ├── queries/
│   │   ├── keys.ts                        # [신규] Query Key Factory
│   │   ├── auth.ts                        # [신규] Auth queries (useAuthInitialize, useMyProfile)
│   │   ├── users.ts                       # [신규] User queries (useUsers, useUserById)
│   │   ├── roles.ts                       # [신규] Role queries (useRoles, useRoleById, useUserRoles)
│   │   ├── permissions.ts                 # [신규] Permission queries (usePermissions, usePermissionById, useRolePermissions, useUserPermissions)
│   │   └── services.ts                    # [신규] Service queries (useServices, useServiceById, useServiceVisibleRoles)
│   ├── mutations/
│   │   ├── auth.ts                        # [신규] Auth mutations (useLogout)
│   │   ├── users.ts                       # [신규] User mutations (useUpdateUser, useDeleteUser)
│   │   ├── roles.ts                       # [신규] Role mutations (useCreateRole, useUpdateRole, useDeleteRole, useAssignRoleToUser, useRemoveRoleFromUser)
│   │   ├── permissions.ts                 # [신규] Permission mutations (useCreatePermission, useUpdatePermission, useDeletePermission, useAssignPermissionToRole, useRemovePermissionFromRole, useAssignMultiplePermissionsToRole, useReplaceRolePermissions)
│   │   └── services.ts                    # [신규] Service mutations (useCreateService, useUpdateService, useDeleteService, useAssignVisibleRoleToService, useRemoveVisibleRoleFromService, useReplaceServiceVisibleRoles)
│   ├── useAuth.ts                         # [수정] Zustand + react-query 기반
│   ├── useUserProfile.ts                  # [수정] useMyProfile query 기반
│   └── useDashboard.ts                    # [수정] react-query + queryClient.invalidateQueries 기반
├── components/
│   ├── common/
│   │   └── ThemeInitializer.tsx           # [신규] 테마 DOM 처리 (named export)
│   ├── auth/
│   │   └── AdminAuthGuard.tsx             # [수정] authStore.isInitialized 사용
│   ├── modals/
│   │   └── RolePermissionModal.tsx        # [수정] Redux 제거, usePermissions + useRolePermissions + useReplaceRolePermissions 사용
│   └── providers/
│       └── Providers.tsx                  # [수정] QueryClientProvider + ThemeInitializer (named import)
├── context/
│   └── AuthContext.tsx                    # [수정] Redux 제거, react-query 기반 단순화
└── app/
    ├── users/page.tsx                     # [수정] react-query 훅 사용
    ├── roles/page.tsx                     # [수정] react-query 훅 사용
    ├── permissions/page.tsx               # [수정] react-query 훅 사용
    └── services/page.tsx                  # [수정] react-query 훅 사용
```

### 삭제된 파일

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

## 마이그레이션 진행 내역

### Phase 1: 패키지 추가 + QueryClientProvider 설정
**커밋**: `5541744`

```bash
npm install @tanstack/react-query zustand
npm install @tanstack/react-query-devtools -D
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

---

### Phase 2-3: Zustand 스토어 + ThemeInitializer + Query Key Factory
**커밋**: `cf62dbc`

**생성 파일:**
- `src/store/authStore.ts` — `isAuthenticated`, `isInitialized`, `setAuthenticated`, `setInitialized`, `clearAuth`
- `src/store/themeStore.ts` — `theme`, `actualTheme`, `setTheme`, `setActualTheme`, `toggleTheme`
- `src/components/common/ThemeInitializer.tsx` — 테마 DOM 사이드이펙트 처리 (**named export** `export function ThemeInitializer()`)
- `src/hooks/queries/keys.ts` — Query Key Factory

**Query Key Factory:**
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

### Phase 4-5: Auth/User Query/Mutation 훅 생성
**커밋**: `e0450d7`

**파일:** `src/hooks/queries/auth.ts`, `src/hooks/mutations/auth.ts`, `src/hooks/queries/users.ts`, `src/hooks/mutations/users.ts`

`useLogout` 특이사항: 로그아웃 성공 시 모든 캐시 클리어:
```typescript
onSuccess: () => {
  clearAuth();
  queryClient.clear(); // 모든 캐시 제거 (admin은 데이터 민감도 높음)
},
```

---

### Phase 6: Role Query/Mutation 훅 생성 (8개)
**커밋**: `62ffeed`

**파일:** `src/hooks/queries/roles.ts`, `src/hooks/mutations/roles.ts`

**Queries** (3개): `useRoles`, `useRoleById`, `useUserRoles(userId: string | null)` (enabled: !!userId)

**Mutations** (5개): `useCreateRole`, `useUpdateRole`, `useDeleteRole`, `useAssignRoleToUser`, `useRemoveRoleFromUser`

`useAssignRoleToUser` / `useRemoveRoleFromUser` — `onSuccess`에서 자동으로 `queryKeys.roles.byUser(userId)` 무효화 → `useUserRoles` 자동 refetch

---

### Phase 7: Permission Query/Mutation 훅 생성 (11개)
**커밋**: `ee86d15`

**파일:** `src/hooks/queries/permissions.ts`, `src/hooks/mutations/permissions.ts`

**Queries** (4개): `usePermissions`, `usePermissionById`, `useRolePermissions(roleId: string | null)`, `useUserPermissions`

**Mutations** (7개): `useCreatePermission`, `useUpdatePermission`, `useDeletePermission`, `useAssignPermissionToRole`, `useRemovePermissionFromRole`, `useAssignMultiplePermissionsToRole`, `useReplaceRolePermissions`

---

### Phase 8: Service Query/Mutation 훅 생성 (9개)
**커밋**: `236ce91`

**파일:** `src/hooks/queries/services.ts`, `src/hooks/mutations/services.ts`

**Queries** (3개): `useServices`, `useServiceById`, `useServiceVisibleRoles`

**Mutations** (6개): `useCreateService`, `useUpdateService`, `useDeleteService`, `useAssignVisibleRoleToService`, `useRemoveVisibleRoleFromService`, `useReplaceServiceVisibleRoles`

---

### 훅 구조 재구성 (파일-per-훅 → 도메인별)
**커밋**: `83f6e74`

> Phase 6-8에서 훅별 개별 파일로 생성했으나, 관리 복잡도 문제로 **도메인별 단일 파일**로 재구성.

**변경 전** (33개 파일):
```
hooks/queries/useRoles.ts
hooks/queries/useRoleById.ts
hooks/queries/useUserRoles.ts
hooks/mutations/useCreateRole.ts
hooks/mutations/useUpdateRole.ts
...
```

**변경 후** (10개 파일):
```
hooks/queries/auth.ts        (useAuthInitialize, useMyProfile)
hooks/queries/users.ts       (useUsers, useUserById)
hooks/queries/roles.ts       (useRoles, useRoleById, useUserRoles)
hooks/queries/permissions.ts (usePermissions, usePermissionById, useRolePermissions, useUserPermissions)
hooks/queries/services.ts    (useServices, useServiceById, useServiceVisibleRoles)
hooks/mutations/auth.ts      (useLogout)
hooks/mutations/users.ts     (useUpdateUser, useDeleteUser)
hooks/mutations/roles.ts     (useCreateRole, useUpdateRole, useDeleteRole, useAssignRoleToUser, useRemoveRoleFromUser)
hooks/mutations/permissions.ts (useCreatePermission, useUpdatePermission, useDeletePermission, ...)
hooks/mutations/services.ts  (useCreateService, useUpdateService, useDeleteService, ...)
```

---

### Phase 9-10: AuthContext/useAuth/useUserProfile Redux 제거
**커밋**: `048d69f`

**AuthContext.tsx 패턴:**
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
}
```

> **명명 주의**: `AuthContext`의 내부 hook은 `useAuthContext`로 명명 (portal-client 패턴 동일). `hooks/useAuth.ts`의 `useAuth`와 충돌 방지.

---

### Phase 11: 컴포넌트 수정
**커밋**: `e94210d`

**AdminAuthGuard.tsx:**
```typescript
// After
import { useAuthStore } from '@/store/authStore';
const { isInitialized } = useAuthStore();
const { isAuthenticated, user, isLoading } = useAuth();
if (!isInitialized || isLoading) return <PageLoader message="관리자 권한을 확인하는 중..." />;
```

**ThemeToggle.tsx**: `useTheme(ThemeContext)` → `useThemeStore()`

**Providers.tsx**: `ThemeInitializer` named import으로 변경, Redux `Provider` 제거, `ReactQueryDevtools` 추가

---

### Phase 12: 페이지 컴포넌트 수정
**커밋**: `f6ff62b`

> **portal-client와의 가장 큰 차이점**: 페이지 컴포넌트가 Redux를 직접 사용하므로 수정 필요.

#### 수정 패턴

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
const { data: usersData, isPending: isLoading, error } = useUsers(searchQuery);
const users = usersData?.items ?? [];
const pagination = usersData?.pageInfo;
const deleteUserMutation = useDeleteUser(); // onSuccess에서 자동 무효화

const handleDelete = async (id) => {
  await deleteUserMutation.mutateAsync(id); // 완료 후 자동 refetch
};
```

#### useLoadingState 대체

```typescript
// Before
const { isLoading, withLoading } = useLoadingState();
const handleSave = withLoading('save', async () => {
  await dispatch(updateRole(data)).unwrap();
});

// After
const updateRoleMutation = useUpdateRole();
const handleSave = async () => {
  await updateRoleMutation.mutateAsync(data);
};
// 버튼에서: disabled={updateRoleMutation.isPending}
```

#### 모달 데이터 로딩 패턴 (Redux fetchById → 직접 서비스 호출)

```typescript
// Before
await dispatch(fetchRoleById(role.id)).unwrap();
const detail = useAppSelector(state => state.role.selectedRole);

// After
const detail = await roleService.getRoleById(role.id); // 직접 호출
setSelectedRole(detail);
setIsModalOpen(true);
```

#### useUserRoles 패턴 (users/page.tsx)

```typescript
// selectedUserId 상태로 useUserRoles 활성화
const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
const { data: userRolesData } = useUserRoles(selectedUserId); // enabled: !!selectedUserId
const userRoles = userRolesData ?? [];

// 역할 할당/해제 → onSuccess에서 자동 invalidate → useUserRoles 자동 refetch
const assignRoleMutation = useAssignRoleToUser();
// handleCloseRoleModal: setSelectedUserId(null)
```

#### 수정된 페이지

| 페이지 | 사용 훅 |
|--------|---------|
| `users/page.tsx` | useUsers, useRoles, useServices, useUserRoles(selectedUserId), useUpdateUser, useAssignRoleToUser, useRemoveRoleFromUser |
| `roles/page.tsx` | useRoles, useServices, useCreateRole, useUpdateRole, useDeleteRole |
| `permissions/page.tsx` | usePermissions, useRoles, useServices, useCreatePermission, useUpdatePermission, useDeletePermission |
| `services/page.tsx` | useServices, useRoles, useCreateService, useUpdateService, useDeleteService |

---

### Phase 13: Redux 완전 제거 및 정리
**커밋**: `208cb6e`

**삭제된 파일:**
```bash
src/store/index.ts
src/store/hooks.ts
src/store/slices/authSlice.ts
src/store/slices/userSlice.ts
src/store/slices/roleSlice.ts
src/store/slices/permissionSlice.ts
src/store/slices/serviceSlice.ts
src/context/ThemeContext.tsx
```

**package.json 정리:**
```bash
npm uninstall @reduxjs/toolkit react-redux
```

**추가 리팩토링 (원래 계획에 없던 항목):**

- **`RolePermissionModal.tsx`**: Redux `fetchPermissions`, `fetchRolePermissions`, `replaceRolePermissions` 제거 → `usePermissions({ limit: LimitType.HUNDRED })`, `useRolePermissions(roleId)`, `useReplaceRolePermissions` 사용
  ```typescript
  const roleId = isOpen ? (role?.id ?? null) : null;
  const { data: permissionsData } = usePermissions({ limit: LimitType.HUNDRED });
  const { data: rolePermissionsData } = useRolePermissions(roleId);
  useEffect(() => {
    if (rolePermissionsData !== undefined) {
      setSelectedPermissions(new Set(rolePermissionsData));
    }
  }, [rolePermissionsData]);
  ```

- **`useDashboard.ts`**: Redux `fetchUsers`, `fetchRoles`, `fetchPermissions` 제거 → react-query + `queryClient.invalidateQueries` 사용
  ```typescript
  const queryClient = useQueryClient();
  const { data: usersData } = useUsers({ page: 1, limit: LimitType.HUNDRED });
  const fetchStatistics = useCallback(async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all() }),
    ]);
  }, [queryClient]);
  ```

---

## 타입 오류 수정 내역

`npm run type-check` 및 `npm run lint` 통과를 위해 수정된 항목들:

| 파일 | 오류 | 수정 |
|------|------|------|
| `Pagination.tsx` | `PaginatedResultBase \| undefined`가 `PaginatedResultBase`에 비할당 | `pageInfo?: PaginatedResultBase \| undefined`로 변경, `if (!pageInfo) return null` 추가 |
| `serviceService.ts` | `Service[]`가 `ServiceSearchResult[]`에 비할당 | 반환 타입을 `PaginatedResult<ServiceSearchResult>`로 변경, 미사용 `Service` import 제거 |
| `RolePermissionModal.tsx`, `useDashboard.ts` | `Type '200' is not assignable to type 'LimitType'` | `LimitType.HUNDRED` (100)으로 변경 |
| `Providers.tsx` | `Module has no default export` (ThemeInitializer) | `import { ThemeInitializer }` named import으로 변경 |
| `useAuth.ts` | Unused `eslint-disable` directive | eslint-disable 주석 제거 |

> **원인**: `tsconfig.json`의 `exactOptionalPropertyTypes: true` 설정으로 인해 `prop?: Type`과 `prop?: Type \| undefined`가 구분됨.

---

## 완료된 커밋 목록

| Phase | 커밋 | 내용 |
|-------|------|------|
| 1 | `5541744` | 패키지 추가 + QueryClientProvider 설정 |
| 2-3 | `cf62dbc` | Zustand 스토어 + ThemeInitializer + Query Key Factory |
| 4-5 | `e0450d7` | Auth/User Query/Mutation 훅 생성 |
| 6 | `62ffeed` | Role Query/Mutation 훅 생성 (8개) |
| 7 | `ee86d15` | Permission Query/Mutation 훅 생성 (11개) |
| 8 | `236ce91` | Service Query/Mutation 훅 생성 (9개) |
| 재구성 | `83f6e74` | hooks 구조를 파일-per-훅에서 도메인별 파일로 재구성 |
| 9-10 | `048d69f` | AuthContext/useAuth/useUserProfile Redux 제거 |
| 11 | `e94210d` | 컴포넌트 수정 (AdminAuthGuard, ThemeToggle, Providers) |
| 12 | `f6ff62b` | 페이지 컴포넌트 4개 수정 (users, roles, permissions, services) |
| 13 | `208cb6e` | Redux 완전 제거 및 정리 (RolePermissionModal, useDashboard 포함) |

---

## 검증 결과

```bash
npm run type-check  # ✅ 통과
npm run lint        # ✅ 통과
```

---

## 핵심 패턴 요약

### 데이터 흐름
```
Component
  ↓
react-query Hook (useQuery/useMutation)
  ↓
Service (싱글톤)
  ↓
HTTP Client (@krgeobuk/http-client)
  ↓
API Server
```

### 클라이언트 상태
```
Component
  ↓
Zustand Store (authStore / themeStore)
```

### 캐시 무효화 전략
- mutation `onSuccess` → `queryClient.invalidateQueries({ queryKey: queryKeys.domain.all() })`
- 연관 관계 있는 경우 복수 무효화: 역할 삭제 → `roles.all` + `roles.byUser(userId)`
- 수동 새로고침: `queryClient.invalidateQueries` (대시보드 통계)
- 로그아웃: `queryClient.clear()` (모든 캐시 완전 제거)
