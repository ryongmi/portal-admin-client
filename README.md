# Portal Admin Client

> KRGeobuk 생태계의 관리자 포탈

krgeobuk 마이크로서비스 생태계의 중앙 관리 인터페이스로, 사용자·역할·권한·서비스를 통합 관리합니다. 관리자 역할 보유자만 접근 가능합니다.

---

## 주요 기능

### 대시보드 (`/`)
- 시스템 현황 통계 (사용자 수, 서비스 수 등)
- 시스템 건강 상태 모니터링
- 최근 활동 피드

### 사용자 관리 (`/users`)
- 전체 사용자 목록 조회·검색 (페이지네이션)
- 사용자 정보 수정
- 사용자별 역할 할당·해제

### 역할 관리 (`/roles`)
- 역할 생성·수정·삭제
- 역할별 권한 할당·해제
- 역할별 사용자 조회

### 권한 관리 (`/permissions`)
- 권한 생성·수정·삭제
- 권한별 역할 조회

### 서비스 관리 (`/services`)
- 서비스 등록·수정·삭제
- 서비스별 가시성 역할 할당·해제
- 서비스 접근 권한 제어

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router), TypeScript 5 |
| 상태 관리 | TanStack Query 5, Zustand 5, React Context |
| UI | Tailwind CSS 3, Lucide React |
| 폼 | React Hook Form 7 |
| HTTP | `@krgeobuk/http-client` (Axios 기반, 토큰 자동 갱신) |
| 보안 | CSP, CSRF, Rate Limiting (미들웨어) |

---

## 접근 권한

**이 애플리케이션은 관리자 전용입니다.**

접근을 위해 다음 조건이 필요합니다:
- krgeobuk 계정 로그인
- 아래 관리자 역할 중 하나 이상 보유
  - `super-admin` (최고 관리자)
  - `system-admin` (시스템 관리자)
  - `portal-admin` (포탈 관리자)
  - `admin` (일반 관리자)

관리자 권한이 없는 사용자는 자동으로 일반 포탈(`NEXT_PUBLIC_PORTAL_CLIENT_URL`)로 리다이렉트됩니다.

---

## 빠른 시작

### 환경 요구사항
- Node.js 18+
- 실행 중인 백엔드 서비스 (auth-server, authz-server, portal-server)

### 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env.local
# .env.local에서 실제 값으로 수정

# 3. 개발 서버 시작
npm run dev
```

서버가 http://localhost:3210 에서 실행됩니다.

### 스크립트

```bash
# 개발
npm run dev          # Next.js 개발 서버 (포트 3210)
npm run build        # 프로덕션 빌드
npm run start        # 프로덕션 서버 시작 (포트 3210)

# 코드 품질
npm run lint         # ESLint 검사
npm run lint:fix     # ESLint 자동 수정
npm run type-check   # TypeScript 타입 검사
```

---

## 프로젝트 구조

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
│   │   └── services.ts           # useServices, useServiceById, useServiceVisibleRoles
│   └── mutations/
│       ├── auth.ts               # useLogout
│       ├── users.ts              # useUpdateUser, useDeleteUser
│       ├── roles.ts              # useCreateRole, useUpdateRole, useDeleteRole, useAssignRoleToUser 등
│       ├── permissions.ts        # useCreatePermission, useAssignPermissionToRole 등
│       └── services.ts           # useCreateService, useAssignVisibleRoleToService 등
│
├── services/
│   ├── base/BaseService.ts       # 공통 에러 핸들러
│   ├── authService.ts            # 인증 API
│   ├── userService.ts            # 사용자 API
│   ├── roleService.ts            # 역할 API
│   ├── permissionService.ts      # 권한 API
│   ├── serviceService.ts         # 서비스 API
│   └── dashboardService.ts       # 대시보드 API
│
├── store/
│   ├── authStore.ts              # Zustand: isAuthenticated, isInitialized
│   └── themeStore.ts             # Zustand: 다크 모드
│
└── lib/
    └── httpClient.ts             # @krgeobuk/http-client (authApi, authzApi, portalApi)
```

---

## 페이지 및 권한

| 경로 | 설명 | 접근 권한 |
|------|------|-----------|
| `/` | 대시보드 (시스템 현황) | 관리자 이상 |
| `/users` | 사용자 관리 | 관리자 이상 |
| `/roles` | 역할 관리 | 관리자 이상 |
| `/permissions` | 권한 관리 | 관리자 이상 |
| `/services` | 서비스 관리 | 관리자 이상 |

모든 페이지는 루트 레이아웃에서 `AdminAuthGuard`로 보호됩니다.

---

## Query Key Factory

모든 query key는 `src/hooks/queries/keys.ts`에서 중앙 관리합니다.

```typescript
export const queryKeys = {
  auth: {
    initialize: () => ['auth', 'initialize'],
    myProfile:  () => ['auth', 'myProfile'],
  },
  users: {
    all:    () => ['users'],
    list:   (query?: object) => ['users', 'list', query],
    detail: (id: string)     => ['users', 'detail', id],
  },
  roles: {
    all:    () => ['roles'],
    list:   (query?: object)   => ['roles', 'list', query],
    detail: (id: string)       => ['roles', 'detail', id],
    byUser: (userId: string)   => ['roles', 'user', userId],
  },
  permissions: {
    all:    () => ['permissions'],
    list:   (query?: object)       => ['permissions', 'list', query],
    detail: (id: string)           => ['permissions', 'detail', id],
    byRole: (roleId: string)       => ['permissions', 'role', roleId],
    byUser: (userId: string)       => ['permissions', 'user', userId],
  },
  services: {
    all:          () => ['services'],
    list:         (query?: object)     => ['services', 'list', query],
    detail:       (id: string)         => ['services', 'detail', id],
    visibleRoles: (serviceId: string)  => ['services', 'roles', serviceId],
  },
};
```

---

## 연결 서버

| 서버 | 포트 | 용도 |
|------|------|------|
| auth-server | 8000 | 사용자 인증, 사용자 정보, OAuth |
| authz-server | 8100 | 역할, 권한, 사용자-역할 매핑 |
| portal-server | 8200 | 서비스 등록 및 관리 |

---

## 환경 변수

```bash
# ===== API 서버 =====
NEXT_PUBLIC_AUTH_SERVER_URL=http://localhost:8000/auth
NEXT_PUBLIC_AUTHZ_SERVER_URL=http://localhost:8100/authz
NEXT_PUBLIC_PORTAL_SERVER_URL=http://localhost:8200/portal
NEXT_PUBLIC_TOKEN_REFRESH_URL=http://localhost:8000/auth/auth/refresh

# ===== 클라이언트 URL =====
NEXT_PUBLIC_ADMIN_CLIENT_URL=http://localhost:3210
NEXT_PUBLIC_PORTAL_CLIENT_URL=http://localhost:3200

# ===== 환경 =====
NEXT_PUBLIC_ENVIRONMENT=local
NODE_ENV=local
NEXT_TELEMETRY_DISABLED=1

# ===== 보안 =====
ALLOWED_ORIGINS=localhost,127.0.0.1
NEXT_PUBLIC_API_TIMEOUT=15000
NEXT_PUBLIC_RATE_LIMIT_MAX_ATTEMPTS=50
NEXT_PUBLIC_ENABLE_CSRF=true
NEXT_PUBLIC_ENABLE_INPUT_VALIDATION=true
NEXT_PUBLIC_ENABLE_SECURITY_LOGGING=true
```

전체 목록: `.env.example`

---

## 보안

`src/middleware.ts`에서 모든 요청에 보안 헤더를 적용합니다.

| 항목 | 내용 |
|------|------|
| CSP | 스크립트/리소스 출처 제한 |
| X-Frame-Options | 클릭재킹 방지 (`DENY`) |
| X-Content-Type-Options | MIME 스니핑 방지 |
| CSRF | POST/PUT/PATCH/DELETE 요청 Origin 검증 |
| Rate Limiting | IP 기반 분당 100 요청 제한 |
| HSTS | 프로덕션 HTTPS 강제 |

---

## 문서

| 파일 | 설명 |
|------|------|
| [CLAUDE.md](./CLAUDE.md) | 개발 가이드 (패턴, 표준, 워크플로우) |
| [docs/](./docs/) | 기능별 설계 문서 |
