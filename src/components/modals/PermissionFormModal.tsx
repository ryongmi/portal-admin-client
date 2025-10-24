'use client';

import { memo, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import LoadingButton from '@/components/common/LoadingButton';
import FormField, { Input, Textarea, Select } from '@/components/common/FormField';
import { ApiErrorMessage } from '@/components/common/ErrorMessage';
import type {
  PermissionDetail,
  ServiceSearchResult,
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from '@/types';

interface PermissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePermissionRequest | UpdatePermissionRequest) => Promise<void>;
  permission?: PermissionDetail | null;
  services: ServiceSearchResult[];
  isLoading?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
}

type PermissionFormData = {
  action: string;
  description: string;
  serviceId: string;
};

/**
 * PermissionFormModal - 권한 생성/수정 모달
 *
 * 권한 생성 및 수정을 위한 폼 모달입니다.
 *
 * @example
 * ```tsx
 * <PermissionFormModal
 *   isOpen={isModalOpen}
 *   onClose={handleCloseModal}
 *   onSubmit={handleSubmit}
 *   permission={selectedPermission}
 *   services={services}
 *   isLoading={isActionsLoading('save')}
 *   error={formError}
 *   onErrorDismiss={() => setFormError(null)}
 * />
 * ```
 */
const PermissionFormModal = memo<PermissionFormModalProps>(function PermissionFormModal({
  isOpen,
  onClose,
  onSubmit,
  permission,
  services,
  isLoading = false,
  error,
  onErrorDismiss,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PermissionFormData>({
    defaultValues: {
      action: '',
      description: '',
      serviceId: '',
    },
    mode: 'onChange',
  });

  // 서비스 옵션 포맷팅
  const serviceOptions = useMemo(() => {
    return services.map((service) => ({
      value: service.id,
      label: service.displayName || service.name,
    }));
  }, [services]);

  // permission이 변경되면 폼 초기화
  useEffect(() => {
    if (permission) {
      reset({
        action: permission.action || '',
        description: permission.description || '',
        serviceId: permission.service?.id || '',
      });
    } else {
      reset({
        action: '',
        description: '',
        serviceId: '',
      });
    }
  }, [permission, reset]);

  const handleFormSubmit = async (data: PermissionFormData): Promise<void> => {
    await onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={permission ? '권한 수정' : '새 권한 추가'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* 일반적인 에러 메시지 */}
        {error && (
          <ApiErrorMessage
            error={{ message: error }}
            {...(onErrorDismiss && { onDismiss: onErrorDismiss })}
          />
        )}

        <FormField
          label="액션"
          required
          {...(errors.action?.message && { error: errors.action.message })}
          hint="권한 액션 (예: user.read, user.write)"
          className="pb-4"
        >
          <Input
            type="text"
            {...register('action', {
              required: '액션을 입력해주세요',
              minLength: {
                value: 2,
                message: '액션은 최소 2자 이상이어야 합니다',
              },
              maxLength: {
                value: 100,
                message: '액션은 최대 100자까지 입력 가능합니다',
              },
            })}
            required
            {...(errors.action?.message && { error: errors.action.message })}
            placeholder="user.read"
          />
        </FormField>

        <FormField
          label="설명"
          required
          {...(errors.description?.message && { error: errors.description.message })}
          hint="권한에 대한 상세한 설명"
          className="pb-4"
        >
          <Textarea
            {...register('description', {
              required: '설명을 입력해주세요',
              minLength: {
                value: 2,
                message: '설명은 최소 2자 이상이어야 합니다',
              },
              maxLength: {
                value: 200,
                message: '설명은 최대 200자까지 입력 가능합니다',
              },
            })}
            required
            {...(errors.description?.message && { error: errors.description.message })}
            rows={3}
            placeholder="권한에 대한 설명을 입력하세요"
          />
        </FormField>

        {!permission && (
          <FormField
            label="서비스"
            required
            {...(errors.serviceId?.message && { error: errors.serviceId.message })}
            hint="이 권한이 속할 서비스를 선택하세요"
            className="pb-4"
          >
            <Select
              {...register('serviceId', {
                required: '서비스를 선택해주세요',
              })}
              required
              {...(errors.serviceId?.message && { error: errors.serviceId.message })}
              placeholder="서비스를 선택하세요"
              options={serviceOptions}
            />
          </FormField>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <LoadingButton
            type="submit"
            isLoading={isLoading}
            loadingText="저장 중..."
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {permission ? '수정' : '생성'}
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
});

PermissionFormModal.displayName = 'PermissionFormModal';

export default PermissionFormModal;
