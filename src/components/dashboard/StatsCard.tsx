import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  onClick?: () => void;
}

const colorVariants = {
  blue: {
    bg: 'from-blue-500 to-blue-600',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'text-blue-500'
  },
  green: {
    bg: 'from-green-500 to-green-600',
    light: 'bg-green-50',
    text: 'text-green-600',
    icon: 'text-green-500'
  },
  purple: {
    bg: 'from-purple-500 to-purple-600',
    light: 'bg-purple-50',
    text: 'text-purple-600',
    icon: 'text-purple-500'
  },
  orange: {
    bg: 'from-orange-500 to-orange-600',
    light: 'bg-orange-50',
    text: 'text-orange-600',
    icon: 'text-orange-500'
  },
  red: {
    bg: 'from-red-500 to-red-600',
    light: 'bg-red-50',
    text: 'text-red-600',
    icon: 'text-red-500'
  }
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color,
  onClick
}) => {
  const colors = colorVariants[color];

  return (
    <div 
      className={`
        bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl 
        border border-white/30 p-6 transition-all duration-300 hover:scale-105
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${colors.bg}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
            </div>
          </div>
          
          {change && (
            <div className="mt-4 flex items-center space-x-2">
              <div className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${change.type === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
              `}>
                <svg 
                  className={`w-3 h-3 mr-1 ${change.type === 'increase' ? 'transform rotate-180' : ''}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                {change.value}%
              </div>
              <span className="text-xs text-gray-500">{change.period}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};