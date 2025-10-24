import React from 'react';
import { Clock, User, Shield, Key, LogIn, AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface Activity {
  id: string;
  type: 'user_created' | 'role_assigned' | 'permission_granted' | 'login_attempt';
  description: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error';
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

const activityConfig = {
  user_created: {
    icon: User,
    color: 'text-blue-500',
    bg: 'bg-blue-100'
  },
  role_assigned: {
    icon: Shield,
    color: 'text-green-500',
    bg: 'bg-green-100'
  },
  permission_granted: {
    icon: Key,
    color: 'text-purple-500',
    bg: 'bg-purple-100'
  },
  login_attempt: {
    icon: LogIn,
    color: 'text-orange-500',
    bg: 'bg-orange-100'
  }
};

const severityConfig = {
  info: {
    icon: Info,
    color: 'text-blue-500'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-500'
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-500'
  }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  maxItems = 5
}) => {
  const displayActivities = activities.slice(0, maxItems);

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}일 전`;
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">최근 활동</h3>
            <p className="text-sm text-gray-600">실시간 시스템 활동 로그</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {displayActivities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">최근 활동이 없습니다</p>
          </div>
        ) : (
          displayActivities.map((activity) => {
            const config = activityConfig[activity.type];
            const severityIcon = severityConfig[activity.severity];
            const Icon = config.icon;
            const SeverityIcon = severityIcon.icon;

            return (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className={`p-2 rounded-lg ${config.bg} flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-gray-900 break-words">
                      {activity.description}
                    </p>
                    <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                      <SeverityIcon className={`w-3 h-3 ${severityIcon.color}`} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activity.severity === 'info' ? 'bg-blue-100 text-blue-700' :
                      activity.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {activity.severity}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {activities.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200">
            모든 활동 보기 ({activities.length}개)
          </button>
        </div>
      )}
    </div>
  );
};