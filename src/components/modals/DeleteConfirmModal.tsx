'use client';

import { memo } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import LoadingButton from '@/components/common/LoadingButton';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
}

/**
 * DeleteConfirmModal - 범용 삭제 확인 모달
 *
 * 모든 도메인(서비스, 역할, 권한, 사용자)에서 재사용 가능한 삭제 확인 모달입니다.
 *
 * @example
 * ```tsx
 * <DeleteConfirmModal
 *   isOpen={isDeleteModalOpen}
 *   onClose={handleCloseDeleteModal}
 *   onConfirm={handleDelete}
 *   title="서비스 삭제"
 *   message="정말로 이 서비스를 삭제하시겠습니까?"
 *   itemName={selectedService?.name}
 *   isLoading={isDeleting}
 * />
 * ```
 */
const DeleteConfirmModal = memo<DeleteConfirmModalProps>(function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
}) {
  const handleConfirm = async (): Promise<void> => {
    await onConfirm();
    // onConfirm에서 성공 시 onClose를 호출해야 함
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{message}</p>

        {itemName && (
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm font-medium text-gray-900">대상: {itemName}</p>
          </div>
        )}

        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">⚠️ 이 작업은 되돌릴 수 없습니다.</p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            취소
          </Button>
          <LoadingButton
            type="button"
            variant="danger"
            onClick={handleConfirm}
            isLoading={isLoading}
            loadingText="삭제 중..."
            disabled={isLoading}
          >
            삭제
          </LoadingButton>
        </div>
      </div>
    </Modal>
  );
});

DeleteConfirmModal.displayName = 'DeleteConfirmModal';

export default DeleteConfirmModal;
