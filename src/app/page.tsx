'use client';

import React from 'react';
import { Users, Shield, Key, UserCheck, UserX, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import AdminAuthGuard from '@/components/auth/AdminAuthGuard';
import { useDashboard } from '@/hooks/useDashboard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SystemHealthCard } from '@/components/dashboard/SystemHealthCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { TopRolesCard } from '@/components/dashboard/TopRolesCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function AdminDashboardPage(): JSX.Element {
  const router = useRouter();
  const { statistics, loading, error, lastUpdated, fetchStatistics, getSystemHealth } = useDashboard();

  if (loading && !statistics) {
    return (
      <AdminAuthGuard>
        <Layout>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </Layout>
      </AdminAuthGuard>
    );
  }

  if (error) {
    return (
      <AdminAuthGuard>
        <Layout>
          <ErrorMessage message={error} onRetry={fetchStatistics} />
        </Layout>
      </AdminAuthGuard>
    );
  }

  if (!statistics) {
    return (
      <AdminAuthGuard>
        <Layout>
          <div className="text-center py-12">
            <p className="text-gray-500">통계 데이터를 불러올 수 없습니다.</p>
          </div>
        </Layout>
      </AdminAuthGuard>
    );
  }

  return (
    <AdminAuthGuard>
      <Layout>
        <div className="space-y-6">
          {/* 헤더 */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent">
                  관리자 대시보드
                </h1>
                <p className="text-gray-600 mt-2">krgeobuk 포털 시스템 현황 및 통계</p>
              </div>

              <div className="text-right">
                <button
                  onClick={fetchStatistics}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  새로고침
                </button>
                {lastUpdated && (
                  <p className="text-sm text-gray-500 mt-2">
                    마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 주요 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="총 사용자"
              value={statistics.users.total}
              change={{
                value: statistics.users.recentRegistrations,
                type: 'increase',
                period: '최근 7일',
              }}
              icon={Users}
              color="blue"
              onClick={() => router.push('/users')}
            />

            <StatsCard
              title="활성 사용자"
              value={statistics.users.active}
              change={{
                value: Math.round(
                  (statistics.users.active / Math.max(statistics.users.total, 1)) * 100
                ),
                type: 'increase',
                period: '활성화율',
              }}
              icon={UserCheck}
              color="green"
              onClick={() => router.push('/users')}
            />

            <StatsCard
              title="총 역할"
              value={statistics.roles.total}
              change={{
                value: statistics.roles.avgPermissionsPerRole,
                type: 'increase',
                period: '평균 권한 수',
              }}
              icon={Shield}
              color="purple"
              onClick={() => router.push('/roles')}
            />

            <StatsCard
              title="총 권한"
              value={statistics.permissions.total}
              change={{
                value: Object.keys(statistics.permissions.byService).length,
                type: 'increase',
                period: '서비스 수',
              }}
              icon={Key}
              color="orange"
              onClick={() => router.push('/permissions')}
            />
          </div>

          {/* 보조 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard
              title="이메일 인증 완료"
              value={statistics.users.emailVerified}
              change={{
                value: Math.round(
                  (statistics.users.emailVerified / Math.max(statistics.users.total, 1)) * 100
                ),
                type: 'increase',
                period: '인증률',
              }}
              icon={Mail}
              color="green"
            />

            <StatsCard
              title="비활성 사용자"
              value={statistics.users.inactive}
              change={{
                value: Math.round(
                  (statistics.users.inactive / Math.max(statistics.users.total, 1)) * 100
                ),
                type: 'decrease',
                period: '비율',
              }}
              icon={UserX}
              color="red"
            />

            <StatsCard
              title="최근 가입자"
              value={statistics.users.recentRegistrations}
              change={{
                value: 15,
                type: 'increase',
                period: '전주 대비',
              }}
              icon={Users}
              color="blue"
            />
          </div>

          {/* 차트 및 분석 섹션 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="일별 활성 사용자"
              data={statistics.analytics.dailyActiveUsers}
              type="bar"
              color="blue"
            />

            <ChartCard
              title="로그인 트렌드"
              data={statistics.analytics.loginTrends.map((item) => ({
                date: item.date,
                count: item.logins,
              }))}
              type="line"
              color="green"
            />
          </div>

          {/* 시스템 상태 및 활동 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SystemHealthCard
              systemHealth={statistics.analytics.systemHealth}
              onRefresh={getSystemHealth}
            />

            <div className="lg:col-span-2">
              <ActivityFeed activities={statistics.analytics.recentActivities} maxItems={6} />
            </div>
          </div>

          {/* 상위 역할 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopRolesCard topRoles={statistics.analytics.topRoles} />

            {/* 서비스별 통계 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">서비스별 통계</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">인증 서비스</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-500">
                      {statistics.roles.byService['auth'] || 0}개 역할
                    </div>
                    <div className="text-sm text-blue-400">
                      {statistics.permissions.byService['auth'] || 0}개 권한
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">인가 서비스</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {statistics.roles.byService['authz'] || 0}개 역할
                    </div>
                    <div className="text-sm text-green-500">
                      {statistics.permissions.byService['authz'] || 0}개 권한
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="font-medium text-gray-900">포탈 서비스</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">
                      {statistics.roles.byService['portal'] || 0}개 역할
                    </div>
                    <div className="text-sm text-purple-500">
                      {statistics.permissions.byService['portal'] || 0}개 권한
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </AdminAuthGuard>
  );
}
