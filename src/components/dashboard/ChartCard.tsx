import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

interface ChartData {
  date: string;
  count: number;
}

interface ChartCardProps {
  title: string;
  data: ChartData[];
  type: 'bar' | 'line';
  color: 'blue' | 'green' | 'purple' | 'orange';
  height?: number;
}

const colorVariants = {
  blue: {
    primary: '#3B82F6',
    light: '#DBEAFE',
    gradient: 'from-blue-500 to-blue-600',
  },
  green: {
    primary: '#10B981',
    light: '#D1FAE5',
    gradient: 'from-green-500 to-green-600',
  },
  purple: {
    primary: '#8B5CF6',
    light: '#EDE9FE',
    gradient: 'from-purple-500 to-purple-600',
  },
  orange: {
    primary: '#F59E0B',
    light: '#FEF3C7',
    gradient: 'from-orange-500 to-orange-600',
  },
};

export const ChartCard: React.FC<ChartCardProps> = ({ title, data, type: _type, color, height = 200 }) => {
  const colors = colorVariants[color];

  // 데이터가 없는 경우 처리
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.gradient}`}>
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm">데이터가 없습니다</p>
          </div>
        </div>
      </div>
    );
  }

  const maxValue = data?.length ? Math.max(...data.map((d) => d.count)) : 0;
  const _minValue = data?.length ? Math.min(...data.map((d) => d.count)) : 0;

  // 간단한 차트 통계
  const totalValue = data?.reduce((sum, d) => sum + d.count, 0) || 0;
  const avgValue = data?.length ? Math.round(totalValue / data.length) : 0;
  const trend =
    data?.length > 1
      ? (((data[data.length - 1]?.count || 0) - (data[0]?.count || 0)) / (data[0]?.count || 1)) *
        100
      : 0;

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 dark:border-gray-700/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.gradient}`}>
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>평균: {avgValue.toLocaleString()}</span>
              <div className="flex items-center space-x-1">
                <TrendingUp
                  className={`w-4 h-4 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}
                />
                <span className={trend >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(trend).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 간단한 바 차트 구현 */}
      <div className="space-y-3" style={{ height: `${height}px` }}>
        <div className="flex items-end justify-between h-full space-x-2">
          {data.map((item, index) => {
            const barHeight = maxValue > 0 ? (item.count / maxValue) * (height - 40) : 0;
            const date = new Date(item.date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div key={index} className="flex flex-col items-center flex-1 h-full">
                <div className="flex flex-col justify-end h-full w-full">
                  <div className="relative group">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 hover:opacity-80 ${
                        isToday ? `bg-gradient-to-t ${colors.gradient}` : colors.light
                      }`}
                      style={{
                        height: `${barHeight}px`,
                        backgroundColor: isToday ? undefined : colors.primary + '40',
                      }}
                    />

                    {/* 툴팁 */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                        {item.count.toLocaleString()}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 날짜 레이블 */}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                  {date.getMonth() + 1}/{date.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 범례 */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded bg-gradient-to-br ${colors.gradient}`} />
              <span>오늘</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.primary + '40' }} />
              <span>이전</span>
            </div>
          </div>
          <span>최고: {maxValue.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

