'use client'

import { ReactNode } from 'react'
import Modal from './Modal'
import Button from './Button'

interface DetailField {
  label: string
  value: ReactNode
  type?: 'text' | 'badge' | 'date' | 'component'
  badgeColor?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
  icon?: ReactNode
  fullWidth?: boolean
}

interface DetailModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  fields: DetailField[]
  onEdit?: () => void
  onDelete?: () => void
  editLabel?: string
  deleteLabel?: string
  headerIcon?: ReactNode
  headerColor?: 'blue' | 'green' | 'purple' | 'yellow' | 'red'
}

export default function EnhancedDetailModal({
  isOpen,
  onClose,
  title,
  subtitle,
  fields,
  onEdit,
  onDelete,
  editLabel = '수정',
  deleteLabel = '삭제',
  headerIcon,
  headerColor = 'blue'
}: DetailModalProps): JSX.Element {
  const headerColorClasses = {
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
    green: 'bg-gradient-to-r from-green-500 to-green-600',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600',
    yellow: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    red: 'bg-gradient-to-r from-red-500 to-red-600'
  }

  const getBadgeColor = (color: string): string => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  const renderFieldValue = (field: DetailField): JSX.Element => {
    if (!field.value) return <span className="text-gray-400">-</span>

    switch (field.type) {
      case 'badge':
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor(field.badgeColor || 'gray')}`}>
            {field.value}
          </span>
        )
      case 'date':
        return <span className="text-gray-900 font-mono text-sm">{field.value}</span>
      case 'component':
        return field.value as JSX.Element
      default:
        return <span className="text-gray-900">{field.value}</span>
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="relative -mx-6 -mt-6">
        {/* 헤더 */}
        <div className={`${headerColorClasses[headerColor]} px-6 py-4 rounded-t-lg`}>
          <div className="flex items-center space-x-3">
            {headerIcon && (
              <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white">
                {headerIcon}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              {subtitle && <p className="text-white/80 text-sm mt-1">{subtitle}</p>}
            </div>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field, index) => (
              <div key={index} className={`${field.fullWidth ? 'md:col-span-2' : ''}`}>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                    {field.icon && (
                      <div className="text-gray-500 flex-shrink-0">
                        {field.icon}
                      </div>
                    )}
                    <label className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      {field.label}
                    </label>
                  </div>
                  <div className="text-base">
                    {renderFieldValue(field)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-100">
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose} className="transition-all hover:scale-105">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              닫기
            </Button>
            {onEdit && (
              <Button 
                variant="outline" 
                onClick={onEdit}
                className="text-blue-500 border-blue-300 hover:bg-blue-50 transition-all hover:scale-105"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {editLabel}
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="danger" 
                onClick={onDelete}
                className="transition-all hover:scale-105"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {deleteLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}