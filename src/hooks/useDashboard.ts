import { useState, useEffect, useCallback } from 'react';
import { DashboardService, type DashboardStatistics } from '@/services/dashboardService';

export const useDashboard = (): {
  statistics: DashboardStatistics | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  fetchStatistics: () => Promise<void>;
  refreshStatistics: () => Promise<void>;
  getSystemHealth: () => Promise<void>;
} => {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const stats = await DashboardService.getDashboardStatistics();
      setStatistics(stats);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '통계 데이터를 불러오는데 실패했습니다.';
      setError(errorMessage);
      // Dashboard statistics fetch error logged
    } finally {
      setLoading(false);
    }
  }, []);

  // 시스템 상태만 별도로 새로고침 (더 자주 업데이트)
  const refreshSystemHealth = useCallback(async (): Promise<void> => {
    if (!statistics) return;

    try {
      const systemHealth = await DashboardService.getSystemHealth();
      setStatistics(prev => prev ? {
        ...prev,
        analytics: {
          ...prev.analytics,
          systemHealth
        }
      } : null);
    } catch (_err) {
      // System health refresh error logged
    }
  }, [statistics]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

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
      refreshSystemHealth();
    }, 30 * 1000); // 30초

    return (): void => clearInterval(healthInterval);
  }, [refreshSystemHealth]);

  return {
    statistics,
    loading,
    error,
    lastUpdated,
    fetchStatistics,
    refreshStatistics: fetchStatistics,
    getSystemHealth: refreshSystemHealth
  };
};