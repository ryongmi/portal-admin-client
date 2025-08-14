import React from 'react';
import { Crown, Users } from 'lucide-react';

interface TopRole {
  roleName: string;
  userCount: number;
}

interface TopRolesCardProps {
  topRoles: TopRole[];
  maxItems?: number;
}

const roleColors = [
  'from-blue-500 to-blue-600',
  'from-green-500 to-green-600', 
  'from-purple-500 to-purple-600',
  'from-orange-500 to-orange-600',
  'from-pink-500 to-pink-600'
];

export const TopRolesCard: React.FC<TopRolesCardProps> = ({
  topRoles,
  maxItems = 5
}) => {
  const displayRoles = topRoles.slice(0, maxItems);
  const maxCount = Math.max(...displayRoles.map(role => role.userCount));

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600">
          <Crown className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">인기 역할</h3>
          <p className="text-sm text-gray-600">사용자 수 기준 상위 역할</p>
        </div>
      </div>

      <div className="space-y-4">
        {displayRoles.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">역할 데이터가 없습니다</p>
          </div>
        ) : (
          displayRoles.map((role, index) => {
            const percentage = maxCount > 0 ? (role.userCount / maxCount) * 100 : 0;
            const gradient = roleColors[index % roleColors.length];
            
            return (
              <div key={role.roleName} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-sm font-semibold text-gray-600">
                      {index + 1}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{role.roleName}</span>
                      <div className="text-sm text-gray-500">
                        {role.userCount.toLocaleString()}명의 사용자
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {role.userCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                {/* 진행률 바 */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {topRoles.length > maxItems && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button className="w-full text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors duration-200">
            모든 역할 보기 ({topRoles.length}개)
          </button>
        </div>
      )}

      {/* 요약 통계 */}
      {displayRoles.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {displayRoles.reduce((sum, role) => sum + role.userCount, 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">총 사용자 수</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(displayRoles.reduce((sum, role) => sum + role.userCount, 0) / displayRoles.length).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">평균 역할당 사용자</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};