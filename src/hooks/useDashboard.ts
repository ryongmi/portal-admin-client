import { useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUsers } from '@/store/slices/userSlice';
import { fetchRoles } from '@/store/slices/roleSlice';
import { fetchPermissions } from '@/store/slices/permissionSlice';
import type { DashboardStatistics } from '@/services/dashboardService';

/**
 * useDashboard Hook - Redux Slice 조합 패턴
 *
 * 특징:
 * - 기존 userSlice, roleSlice, permissionSlice의 데이터를 조합
 * - 별도의 dashboardSlice 없이 selector로 통계 계산
 * - 실시간 업데이트: 각 slice 데이터 변경 시 자동 반영
 * - Redux를 통해 데이터 페칭 (아키텍처 준수)
 *
 * 아키텍처:
 * Dashboard Page → useDashboard Hook → Redux Slices (user/role/permission) → Services → API
 */
export const useDashboard = (): {
  statistics: DashboardStatistics | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  fetchStatistics: () => Promise<void>;
  refreshStatistics: () => Promise<void>;
  getSystemHealth: () => Promise<void>;
} => {
  const dispatch = useAppDispatch();

  // 각 slice에서 데이터 가져오기
  const {
    users,
    pagination: userPagination,
    isLoading: userLoading,
    error: userError,
  } = useAppSelector((state) => state.user);

  const {
    roles,
    pagination: rolePagination,
    isLoading: roleLoading,
    error: roleError,
  } = useAppSelector((state) => state.role);

  const {
    permissions,
    pagination: permissionPagination,
    isLoading: permissionLoading,
    error: permissionError,
  } = useAppSelector((state) => state.permission);

  // 초기 데이터 로드
  useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 100 }));
    dispatch(fetchRoles({ page: 1, limit: 100 }));
    dispatch(fetchPermissions({ page: 1, limit: 100 }));
  }, [dispatch]);

  // 통계 계산 (useMemo로 최적화)
  const statistics = useMemo((): DashboardStatistics | null => {
    // 데이터가 로딩 중이면 null 반환
    if (userLoading && users.length === 0) return null;
    if (roleLoading && roles.length === 0) return null;
    if (permissionLoading && permissions.length === 0) return null;

    // 사용자 통계 계산
    const userStats = {
      total: userPagination.totalItems,
      active: users.filter((u) => u.isIntegrated).length,
      inactive: users.filter((u) => !u.isIntegrated).length,
      emailVerified: users.filter((u) => u.isEmailVerified).length,
      recentRegistrations: users.filter((u) => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(u.oauthAccount.createdAt ?? '') > weekAgo;
      }).length,
    };

    // 역할 통계 계산
    const rolesByService = roles.reduce(
      (acc, role) => {
        const serviceName = role.service?.displayName || 'unknown';
        acc[serviceName] = (acc[serviceName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const roleStats = {
      total: rolePagination.totalItems,
      byService: rolesByService,
      avgPermissionsPerRole: Math.round(permissions.length / Math.max(roles.length, 1)),
    };

    // 권한 통계 계산
    const permissionsByService = permissions.reduce(
      (acc, permission) => {
        const serviceName = permission.service?.displayName || 'unknown';
        acc[serviceName] = (acc[serviceName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const permissionStats = {
      total: permissionPagination.totalItems,
      byService: permissionsByService,
    };

    // Mock Analytics 데이터 (향후 실제 API로 교체 예정)
    const analytics = getDefaultAnalytics();

    return {
      users: userStats,
      roles: roleStats,
      permissions: permissionStats,
      analytics,
    };
  }, [
    users,
    roles,
    permissions,
    userPagination,
    rolePagination,
    permissionPagination,
    userLoading,
    roleLoading,
    permissionLoading,
  ]);

  // 통계 새로고침
  const fetchStatistics = useCallback(async (): Promise<void> => {
    await Promise.all([
      dispatch(fetchUsers({ page: 1, limit: 100 })).unwrap(),
      dispatch(fetchRoles({ page: 1, limit: 100 })).unwrap(),
      dispatch(fetchPermissions({ page: 1, limit: 100 })).unwrap(),
    ]);
  }, [dispatch]);

  // 시스템 헬스 체크 (간단한 API 호출로 서버 상태 확인)
  const getSystemHealth = useCallback(async (): Promise<void> => {
    try {
      await Promise.allSettled([
        dispatch(fetchUsers({ page: 1, limit: 15 })).unwrap(),
        dispatch(fetchRoles({ page: 1, limit: 15 })).unwrap(),
      ]);
    } catch {
      // Health check errors are expected and handled gracefully
    }
  }, [dispatch]);

  // 자동 새로고침 설정 (5분마다)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatistics();
    }, 5 * 60 * 1000); // 5분

    return (): void => clearInterval(interval);
  }, [fetchStatistics]);

  // 시스템 상태 자동 새로고침 (30초마다)
  useEffect(() => {
    const healthInterval = setInterval(() => {
      getSystemHealth();
    }, 30 * 1000); // 30초

    return (): void => clearInterval(healthInterval);
  }, [getSystemHealth]);

  const loading = userLoading || roleLoading || permissionLoading;
  const error = userError || roleError || permissionError;

  return {
    statistics,
    loading,
    error,
    lastUpdated: statistics ? new Date() : null,
    fetchStatistics,
    refreshStatistics: fetchStatistics,
    getSystemHealth,
  };
};

/**
 * 기본 Analytics 데이터 생성 (Mock)
 * TODO: 실제 Analytics API가 구현되면 별도 slice로 분리
 */
function getDefaultAnalytics(): DashboardStatistics['analytics'] {
  const now = new Date();
  const days = 7;

  return {
    dailyActiveUsers: Array.from({ length: days }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        date: date.toISOString().split('T')[0]!,
        count: Math.floor(Math.random() * 50) + 10, // Mock 데이터
      };
    }),
    loginTrends: Array.from({ length: days }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        date: date.toISOString().split('T')[0]!,
        logins: Math.floor(Math.random() * 100) + 20, // Mock 데이터
        failures: Math.floor(Math.random() * 10), // Mock 데이터
      };
    }),
    topRoles: [
      { roleName: 'admin', userCount: Math.floor(Math.random() * 20) + 5 },
      { roleName: 'user', userCount: Math.floor(Math.random() * 50) + 20 },
      { roleName: 'moderator', userCount: Math.floor(Math.random() * 15) + 3 },
    ],
    systemHealth: {
      authService: 'healthy',
      authzService: 'healthy',
      portalService: Math.random() > 0.1 ? 'healthy' : 'warning',
    },
    recentActivities: [],
  };
}
