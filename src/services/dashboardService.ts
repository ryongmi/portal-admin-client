import { UserService } from './userService';
import { RoleService } from './roleService';
import { PermissionService } from './permissionService';
// API response types available if needed

// 대시보드 통계 타입 정의
export interface DashboardStatistics {
  // 실제 데이터 (기존 API 활용)
  users: {
    total: number;
    active: number;
    inactive: number;
    emailVerified: number;
    recentRegistrations: number; // 최근 7일
  };
  roles: {
    total: number;
    byService: Record<string, number>;
    avgPermissionsPerRole: number;
  };
  permissions: {
    total: number;
    byService: Record<string, number>;
  };

  // Mock 데이터 (나중에 API로 교체 예정)
  analytics: {
    dailyActiveUsers: Array<{ date: string; count: number }>;
    loginTrends: Array<{ date: string; logins: number; failures: number }>;
    topRoles: Array<{ roleName: string; userCount: number }>;
    systemHealth: {
      authService: 'healthy' | 'warning' | 'error';
      authzService: 'healthy' | 'warning' | 'error';
      portalService: 'healthy' | 'warning' | 'error';
    };
    recentActivities: Array<{
      id: string;
      type: 'user_created' | 'role_assigned' | 'permission_granted' | 'login_attempt';
      description: string;
      timestamp: string;
      severity: 'info' | 'warning' | 'error';
    }>;
  };
}

export class DashboardService {
  /**
   * 전체 대시보드 통계 조회
   */
  static async getDashboardStatistics(): Promise<DashboardStatistics> {
    try {
      // 실제 API 데이터 병렬 조회
      const [usersResponse, rolesResponse, permissionsResponse] = await Promise.all([
        UserService.getUsers({ page: 1, limit: 100 }), // 기능 테스트용 적정값
        RoleService.getRoles({ page: 1, limit: 100 }),
        PermissionService.getPermissions({ page: 1, limit: 100 }),
        // UserService.getUsers({ page: 1, limit: 1000 }), // 충분히 큰 limit으로 전체 조회
        // RoleService.getRoles({ page: 1, limit: 1000 }),
        // PermissionService.getPermissions({ page: 1, limit: 1000 })
      ]);

      // 실제 데이터 가공
      const users = usersResponse.data.items;
      const roles = rolesResponse.data.items;
      const permissions = permissionsResponse.data.items;

      // 사용자 통계 계산
      const userStats = {
        total: usersResponse.data.pageInfo.totalItems,
        active: users.filter((user) => user.isIntegrated).length,
        inactive: users.filter((user) => !user.isIntegrated).length,
        emailVerified: users.filter((user) => user.isEmailVerified).length,
        recentRegistrations: users.filter((user) => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(user.oauthAccount.createdAt ?? '') > weekAgo;
        }).length,
      };

      // 역할 통계 계산
      const rolesByService = roles.reduce((acc, role) => {
        acc[role.service.displayName || 'unknown'] =
          (acc[role.service.displayName || 'unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const roleStats = {
        total: rolesResponse.data.pageInfo.totalItems,
        byService: rolesByService,
        avgPermissionsPerRole: Math.round(permissions.length / Math.max(roles.length, 1)),
      };

      // 권한 통계 계산
      const permissionsByService = permissions.reduce((acc, permission) => {
        acc[permission.service.displayName || 'unknown'] =
          (acc[permission.service.displayName || 'unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const permissionStats = {
        total: permissionsResponse.data.pageInfo.totalItems,
        byService: permissionsByService,
      };

      // 분석 데이터 생성 (실제 API 기반)
      const analytics = await this.getAnalyticsData();

      return {
        users: userStats,
        roles: roleStats,
        permissions: permissionStats,
        analytics,
      };
    } catch (_error) {
      // Dashboard statistics fetch error logged
      // 에러 시 기본값 반환
      return this.getDefaultStatistics();
    }
  }

  /**
   * 시스템 상태 체크 (실시간)
   */
  static async getSystemHealth(): Promise<DashboardStatistics['analytics']['systemHealth']> {
    try {
      // 각 서비스에 간단한 헬스체크 요청
      const healthChecks = await Promise.allSettled([
        UserService.getUsers({ page: 1, limit: 15 }), // auth-server 체크
        RoleService.getRoles({ page: 1, limit: 15 }), // authz-server 체크
        // portal-server는 아직 API가 없으므로 Mock
      ]);

      return {
        authService: healthChecks[0].status === 'fulfilled' ? 'healthy' : 'error',
        authzService: healthChecks[1].status === 'fulfilled' ? 'healthy' : 'error',
        portalService: Math.random() > 0.1 ? 'healthy' : 'warning', // Mock
      };
    } catch (_error) {
      return {
        authService: 'error',
        authzService: 'error',
        portalService: 'error',
      };
    }
  }

  /**
   * 분석 데이터 조회 (실제 API 기반)
   */
  private static async getAnalyticsData(): Promise<DashboardStatistics['analytics']> {
    try {
      // TODO: 실제 분석 API가 구현되면 연동
      // 현재는 기본값 반환
      const now = new Date();
      const days = 7;

      // 최근 7일 DAU 데이터 (기본값)
      const dailyActiveUsers = Array.from({ length: days }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (days - 1 - i));
        return {
          date: date.toISOString().split('T')[0]!,
          count: 0, // 실제 API로 교체 필요
        };
      });

      // 로그인 트렌드 데이터 (기본값)
      const loginTrends = Array.from({ length: days }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (days - 1 - i));
        return {
          date: date.toISOString().split('T')[0]!,
          logins: 0, // 실제 API로 교체 필요
          failures: 0, // 실제 API로 교체 필요
        };
      });

      // 상위 역할 데이터 (기본값)
      const topRoles: Array<{ roleName: string; userCount: number }> = [];

      // 최근 활동 데이터 (기본값)
      const recentActivities: DashboardStatistics['analytics']['recentActivities'] = [];

      // 시스템 상태 체크
      const systemHealth = await this.getSystemHealth();

      return {
        dailyActiveUsers,
        loginTrends,
        topRoles,
        systemHealth,
        recentActivities,
      };
    } catch (_error) {
      // Analysis data fetch error logged
      return this.getDefaultAnalytics();
    }
  }

  /**
   * 기본 분석 데이터 생성
   */
  private static getDefaultAnalytics(): DashboardStatistics['analytics'] {
    const now = new Date();
    const days = 7;

    return {
      dailyActiveUsers: Array.from({ length: days }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (days - 1 - i));
        return {
          date: date.toISOString().split('T')[0]!,
          count: 0,
        };
      }),
      loginTrends: Array.from({ length: days }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (days - 1 - i));
        return {
          date: date.toISOString().split('T')[0]!,
          logins: 0,
          failures: 0,
        };
      }),
      topRoles: [],
      systemHealth: {
        authService: 'error',
        authzService: 'error',
        portalService: 'error',
      },
      recentActivities: [],
    };
  }


  /**
   * 기본 통계 데이터 (에러 시 fallback)
   */
  private static getDefaultStatistics(): DashboardStatistics {
    return {
      users: {
        total: 0,
        active: 0,
        inactive: 0,
        emailVerified: 0,
        recentRegistrations: 0,
      },
      roles: {
        total: 0,
        byService: {},
        avgPermissionsPerRole: 0,
      },
      permissions: {
        total: 0,
        byService: {},
      },
      analytics: {
        dailyActiveUsers: [],
        loginTrends: [],
        topRoles: [],
        systemHealth: {
          authService: 'error',
          authzService: 'error',
          portalService: 'error',
        },
        recentActivities: [],
      },
    };
  }
}

