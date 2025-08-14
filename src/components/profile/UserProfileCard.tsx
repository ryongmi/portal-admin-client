'use client';

import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';

import type { OAuthAccountProviderType } from '@krgeobuk/shared/oauth';
import Image from 'next/image';

interface OAuthBadgeProps {
  provider: OAuthAccountProviderType;
}

const OAuthBadge: React.FC<OAuthBadgeProps> = ({ provider }) => {
  const badgeConfig = {
    google: {
      label: 'Google',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      icon: '🔍',
    },
    naver: {
      label: 'Naver',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      icon: 'N',
    },
    homePage: {
      label: 'Homepage',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      icon: '🏠',
    },
  };

  const config = badgeConfig[provider];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

interface ServiceCardProps {
  service: {
    id: string;
    name?: string;
    description?: string | null;
    baseUrl?: string | null;
    displayName?: string | null;
    iconUrl?: string | null;
  };
  hasGoogleAuth: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, hasGoogleAuth }) => {
  const requiresGoogleAuth = service.name?.includes('유튜브') || false;
  const isAccessible = !requiresGoogleAuth || hasGoogleAuth;

  return (
    <div
      className={`p-4 rounded-lg border transition-all duration-200 ${
        isAccessible
          ? 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
          : 'bg-gray-50 border-gray-200 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">
            {service.displayName || service.name || 'Unknown Service'}
          </h4>
          {service.description && (
            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
          )}

          {requiresGoogleAuth && !hasGoogleAuth && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                ⚠️ Google 인증 필요
              </span>
            </div>
          )}
        </div>

        {service.iconUrl && (
          <div className="ml-3">
            <Image src={service.iconUrl} alt={`${service.name} icon`} className="w-8 h-8 rounded" />
          </div>
        )}
      </div>
    </div>
  );
};

export const UserProfileCard: React.FC = () => {
  const {
    userProfile,
    loading,
    error,
    hasGoogleAuth,
    hasNaverAuth,
    isHomepageUser,
    availableServices,
    roles,
    permissions,
  } = useUserProfile();

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-2 text-gray-600">프로필 정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6">
        <ErrorMessage message="사용자 프로필을 찾을 수 없습니다." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 기본 사용자 정보 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-900">{userProfile.name}</h2>
              <OAuthBadge provider={userProfile.oauthAccount.provider || 'google'} />
            </div>

            <p className="text-gray-600 mt-1">{userProfile.email}</p>

            {userProfile.nickname && (
              <p className="text-sm text-gray-500 mt-1">닉네임: {userProfile.nickname}</p>
            )}

            <div className="flex items-center space-x-4 mt-4">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  userProfile.isEmailVerified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {userProfile.isEmailVerified ? '✓ 이메일 인증됨' : '⚠️ 이메일 미인증'}
              </span>

              {userProfile.isIntegrated && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  🔗 통합 계정
                </span>
              )}
            </div>
          </div>

          {userProfile.profileImageUrl && (
            <div className="ml-6">
              <Image
                src={userProfile.profileImageUrl}
                alt={`${userProfile.name} 프로필`}
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* 권한 정보 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">권한 정보</h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">역할 ({roles.length}개)</h4>
            {roles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {roles.map((role, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {role}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">할당된 역할이 없습니다.</p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              권한 ({permissions.length}개)
            </h4>
            {permissions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {permissions.map((permission, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-green-100 text-green-800"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">할당된 권한이 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {/* 사용 가능한 서비스 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          사용 가능한 서비스 ({availableServices.length}개)
        </h3>

        {availableServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableServices.map((service) => (
              <ServiceCard key={service.id} service={service} hasGoogleAuth={hasGoogleAuth} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">사용 가능한 서비스가 없습니다.</p>
            <p className="text-sm text-gray-400 mt-1">관리자에게 서비스 접근 권한을 요청하세요.</p>
          </div>
        )}
      </div>

      {/* OAuth 인증 상태 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">인증 상태</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Google 인증</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                hasGoogleAuth ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {hasGoogleAuth ? '✓ 연결됨' : '연결 안됨'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Naver 인증</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                hasNaverAuth ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {hasNaverAuth ? '✓ 연결됨' : '연결 안됨'}
            </span>
          </div>

          {isHomepageUser && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 추가 서비스 이용을 위해 Google 또는 Naver 계정을 연결해보세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

