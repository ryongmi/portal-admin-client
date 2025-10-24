'use client'

import { ReactNode } from 'react'
import Modal from './Modal'
import Button from './Button'

interface DetailField {
  label: string
  value: ReactNode
  fullWidth?: boolean
}

interface DetailModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  fields: DetailField[]
  onEdit?: () => void
  onDelete?: () => void
  editLabel?: string
  deleteLabel?: string
}

export default function DetailModal({
  isOpen,
  onClose,
  title,
  fields,
  onEdit,
  onDelete,
  editLabel = '수정',
  deleteLabel = '삭제'
}: DetailModalProps): JSX.Element {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={index} className={field.fullWidth ? 'col-span-2' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <div className="text-sm text-gray-900">
              {field.value || '-'}
            </div>
          </div>
        ))}
        
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              {editLabel}
            </Button>
          )}
          {onDelete && (
            <Button variant="danger" onClick={onDelete}>
              {deleteLabel}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}