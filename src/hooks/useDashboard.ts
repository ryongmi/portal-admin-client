import { useEffect, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUsers } from '@/hooks/queries/users';
import { useRoles } from '@/hooks/queries/roles';
import { usePermissions } from '@/hooks/queries/permissions';
import { queryKeys } from '@/hooks/queries/keys';
import { LimitType } from '@krgeobuk/core/enum';
import type { DashboardStatistics } from '@/services/dashboardService';

/**
 * useDashboard Hook - react-query 기반 대시보드 통계
 *
 * 특징:
 * - useUsers, useRoles, usePermissions 쿼리 조합
 * - useMemo로 통계 데이터 계산
 * - queryClient.invalidateQueries로 수동 새로고침
 * - 자동 새로고침: 5분 / 30초 인터벌
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
  const queryClient = useQueryClient();

  const { data: usersData, isPending: userLoading, error: userError } = useUsers({ page: 1, limit: LimitType.HUNDRED });
  const { data: rolesData, isPending: roleLoading, error: roleError } = useRoles({ page: 1, limit: LimitType.HUNDRED });
  const { data: permissionsData, isPending: permissionLoading, error: permissionError } = usePermissions({ page: 1, limit: LimitType.HUNDRED });

  const users = usersData?.items ?? [];
  const roles = rolesData?.items ?? [];
  const permissions = permissionsData?.items ?? [];

  const userPagination = usersData?.pageInfo;
  const rolePagination = rolesData?.pageInfo;
  const permissionPagination = permissionsData?.pageInfo;

  // 통계 계산 (useMemo로 최적화)
  const statistics = useMemo((): DashboardStatistics | null => {
    if (userLoading && users.length === 0) return null;
    if (roleLoading && roles.length === 0) return null;
    if (permissionLoading && permissions.length === 0) return null;

    const userStats = {
      total: userPagination?.totalItems ?? 0,
      active: users.filter((u) => u.isIntegrated).length,
      inactive: users.filter((u) => !u.isIntegrated).length,
      emailVerified: users.filter((u) => u.isEmailVerified).length,
      recentRegistrations: users.filter((u) => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(u.oauthAccount?.createdAt ?? '') > weekAgo;
      }).length,
    };

    const rolesByService = roles.reduce(
      (acc, role) => {
        const serviceName = role.service?.displayName || 'unknown';
        acc[serviceName] = (acc[serviceName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const roleStats = {
      total: rolePagination?.totalItems ?? 0,
      byService: rolesByService,
      avgPermissionsPerRole: Math.round(permissions.length / Math.max(roles.length, 1)),
    };

    const permissionsByService = permissions.reduce(
      (acc, permission) => {
        const serviceName = permission.service?.displayName || 'unknown';
        acc[serviceName] = (acc[serviceName] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const permissionStats = {
      total: permissionPagination?.totalItems ?? 0,
      byService: permissionsByService,
    };

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
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all() }),
    ]);
  }, [queryClient]);

  // 시스템 헬스 체크
  const getSystemHealth = useCallback(async (): Promise<void> => {
    try {
      await Promise.allSettled([
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.roles.all() }),
      ]);
    } catch {
      // Health check errors are expected and handled gracefully
    }
  }, [queryClient]);

  // 자동 새로고침 (5분마다)
  useEffect(() => {
    const interval = setInterval(() => {
      void fetchStatistics();
    }, 5 * 60 * 1000);

    return (): void => clearInterval(interval);
  }, [fetchStatistics]);

  // 시스템 상태 자동 새로고침 (30초마다)
  useEffect(() => {
    const healthInterval = setInterval(() => {
      void getSystemHealth();
    }, 30 * 1000);

    return (): void => clearInterval(healthInterval);
  }, [getSystemHealth]);

  const loading = userLoading || roleLoading || permissionLoading;
  const error = userError
    ? String(userError)
    : roleError
      ? String(roleError)
      : permissionError
        ? String(permissionError)
        : null;

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
 * TODO: 실제 Analytics API가 구현되면 별도 훅으로 분리
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
        count: Math.floor(Math.random() * 50) + 10,
      };
    }),
    loginTrends: Array.from({ length: days }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        date: date.toISOString().split('T')[0]!,
        logins: Math.floor(Math.random() * 100) + 20,
        failures: Math.floor(Math.random() * 10),
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
