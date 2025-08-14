import React from 'react';
import { Server, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface SystemHealthCardProps {
  systemHealth: {
    authService: 'healthy' | 'warning' | 'error';
    authzService: 'healthy' | 'warning' | 'error';
    portalService: 'healthy' | 'warning' | 'error';
  };
  onRefresh: () => void;
}

const statusConfig = {
  healthy: {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-100',
    label: '정상'
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-100',
    label: '주의'
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-500',
    bg: 'bg-red-100',
    label: '오류'
  }
};

const serviceNames = {
  authService: '인증 서비스',
  authzService: '인가 서비스',
  portalService: '포탈 서비스'
};

export const SystemHealthCard: React.FC<SystemHealthCardProps> = ({
  systemHealth,
  onRefresh
}) => {
  const getOverallHealth = (): 'healthy' | 'warning' | 'error' => {
    const statuses = Object.values(systemHealth);
    if (statuses.includes('error')) return 'error';
    if (statuses.includes('warning')) return 'warning';
    return 'healthy';
  };

  const overallHealth = getOverallHealth();
  const overallConfig = statusConfig[overallHealth];

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl ${overallConfig.bg}`}>
            <Server className={`w-6 h-6 ${overallConfig.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">시스템 상태</h3>
            <p className={`text-sm font-medium ${overallConfig.color}`}>
              전체 시스템: {overallConfig.label}
            </p>
          </div>
        </div>
        
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          title="새로고침"
        >
          <Clock className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(systemHealth).map(([service, status]) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          
          return (
            <div key={service} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {serviceNames[service as keyof typeof serviceNames]}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium ${config.color}`}>
                  {config.label}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  status === 'healthy' ? 'bg-green-500' :
                  status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>마지막 업데이트</span>
          <span>{new Date().toLocaleTimeString('ko-KR')}</span>
        </div>
      </div>
    </div>
  );
};