// 공유 패키지에서 임포트
import type { ResponseFormat } from '@krgeobuk/core/interfaces';
import type { PaginatedResult, PaginateBaseOptions } from '@krgeobuk/core/interfaces';
// Limit and sort types are re-exported below for actual use

// 공유 패키지 타입 재사용 (값으로도 사용 가능하게 import)
export { LimitType, SortOrderType } from '@krgeobuk/core/enum';
export type { ResponseFormat } from '@krgeobuk/core/interfaces';
export type { PaginatedResult, PaginatedResultBase } from '@krgeobuk/core/interfaces';

// 공통 패키지에서 통합 사용자 프로필 관련 타입 임포트
import type { UserProfile } from '@krgeobuk/user/interfaces';
export type { UserProfile } from '@krgeobuk/user/interfaces';
export type { Service as ServiceInfo } from '@krgeobuk/shared/service';
export type { OAuthAccountProviderType } from '@krgeobuk/shared/oauth';

// API 응답 타입 별칭
export type ApiResponse<T> = ResponseFormat<T>;
export type PaginatedResponse<T> = PaginatedResult<T>;

// 기존 타입들
export enum SortByBaseType {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export type PaginationQuery = PaginateBaseOptions;

export interface SearchFilters {
  [key: string]: string | number | boolean | undefined;
}

// 구글 인증 체크 도우미 함수
export const hasGoogleAuth = (user: UserProfile): boolean =>
  user.oauthAccount.provider === 'google';

export const hasNaverAuth = (user: UserProfile): boolean => user.oauthAccount.provider === 'naver';

export const isHomepageUser = (user: UserProfile): boolean =>
  user.oauthAccount.provider === 'homePage';
