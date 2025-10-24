// 공통패키지에서 직접 타입 임포트
export type { User } from '@krgeobuk/shared/user';
export type { Role } from '@krgeobuk/shared/role';
export type { Permission } from '@krgeobuk/shared/permission';
export type { Service } from '@krgeobuk/shared/service';
export type { LimitType, SortOrderType } from '@krgeobuk/core/enum';

// Auth 관련 타입
export type {
  AuthLoginRequest as LoginRequest,
  AuthLoginResponse as LoginResponse,
  AuthSignupRequest as SignupRequest,
  AuthRefreshResponse as RefreshResponse,
} from '@krgeobuk/auth/interfaces';

// User 관련 타입
export type {
  UserSearchQuery,
  UserSearchResult,
  UserDetail,
  UpdateMyProfile as UpdateMyProfileRequest,
  ChangePassword as ChangePasswordRequest,
} from '@krgeobuk/user/interfaces';

// Role 관련 타입
export type {
  RoleSearchQuery,
  RoleSearchResult,
  RoleDetail,
  CreateRole as CreateRoleRequest,
  UpdateRole as UpdateRoleRequest,
} from '@krgeobuk/role/interfaces';

// Permission 관련 타입
export type {
  PermissionSearchQuery,
  PermissionSearchResult,
  PermissionDetail,
  CreatePermission as CreatePermissionRequest,
  UpdatePermission as UpdatePermissionRequest,
} from '@krgeobuk/permission/interfaces';

// Service 관련 타입
export type {
  ServiceSearchQuery,
  ServiceSearchResult,
  ServiceDetail,
  CreateService as CreateServiceRequest,
  UpdateService as UpdateServiceRequest,
} from '@krgeobuk/service/interfaces';

// Authorization 관련 타입
export type {
  CheckPermission as CheckPermissionRequest,
  CheckRole as CheckRoleRequest,
} from '@krgeobuk/authorization/interfaces';

// 배치 처리 타입
export type { RoleIds as RoleIdsRequest } from '@krgeobuk/user-role/interfaces';
export type { PermissionIds as PermissionIdsRequest } from '@krgeobuk/role-permission/interfaces';

// portal-client 전용 확장 타입들 (필요한 경우에만)
import type { User } from '@krgeobuk/shared/user';
import type { Permission } from '@krgeobuk/shared/permission';
import type { RoleDetail as Role } from '@krgeobuk/role/interfaces';
import type { ServiceDetail as Service } from '@krgeobuk/service/interfaces';

// export interface UserDetail extends User {
//   phoneNumber?: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// export interface Permission extends Record<string, unknown> {
//   id: string;
//   action: string;
//   description?: string;
//   serviceId: string;
//   createdAt: string;
//   updatedAt: string;
// }

export interface UserRole extends Record<string, unknown> {
  userId: string;
  roleId: string;
  user: User;
  role: Role;
}

export interface RolePermission extends Record<string, unknown> {
  roleId: string;
  permissionId: string;
  role: Role;
  permission: Permission;
}

export interface ServiceVisibleRole extends Record<string, unknown> {
  serviceId: string;
  roleId: string;
  service: Service;
  role: Role;
}

// OAuth Provider 타입 (OAuthBadge 컴포넌트용)
export type OAuthProvider = 'google' | 'naver' | 'kakao' | 'github';

// 검색 필터 타입
export interface SearchFilters {
  [key: string]: string | number | boolean | undefined;
}

// 권한 체크 응답 타입 (공통패키지에 없다면 로컬 정의)
export interface PermissionCheckResponse {
  hasPermission: boolean;
}

export interface RoleCheckResponse {
  hasRole: boolean;
}

