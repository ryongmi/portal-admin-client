'use client';

import { memo, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import LoadingButton from '@/components/common/LoadingButton';
import FormField, { Input, Textarea, Select } from '@/components/common/FormField';
import { ApiErrorMessage } from '@/components/common/ErrorMessage';
import type {
  RoleDetail,
  ServiceSearchResult,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '@/types';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => Promise<void>;
  role?: RoleDetail | null;
  services: ServiceSearchResult[];
  isLoading?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
}

type RoleFormData = {
  name: string;
  description?: string | null;
  priority: number;
  serviceId: string;
};

/**
 * RoleFormModal - 역할 생성/수정 모달
 *
 * 역할 생성 및 수정을 위한 폼 모달입니다.
 *
 * @example
 * ```tsx
 * <RoleFormModal
 *   isOpen={isModalOpen}
 *   onClose={handleCloseModal}
 *   onSubmit={handleSubmit}
 *   role={selectedRole}
 *   services={services}
 *   isLoading={isActionsLoading('save')}
 *   error={formError}
 *   onErrorDismiss={() => setFormError(null)}
 * />
 * ```
 */
const RoleFormModal = memo<RoleFormModalProps>(function RoleFormModal({
  isOpen,
  onClose,
  onSubmit,
  role,
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
  } = useForm<RoleFormData>({
    defaultValues: {
      name: '',
      description: '',
      priority: 1,
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

  // role이 변경되면 폼 초기화
  useEffect(() => {
    if (role) {
      reset({
        name: role.name || '',
        description: role.description || '',
        priority: role.priority || 1,
        serviceId: role.service?.id || '',
      });
    } else {
      reset({
        name: '',
        description: '',
        priority: 1,
        serviceId: '',
      });
    }
  }, [role, reset]);

  const handleFormSubmit = async (data: RoleFormData): Promise<void> => {
    await onSubmit(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={role ? '역할 수정' : '새 역할 추가'} size="lg">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* 일반적인 에러 메시지 */}
        {error && (
          <ApiErrorMessage
            error={{ message: error }}
            {...(onErrorDismiss && { onDismiss: onErrorDismiss })}
          />
        )}

        <FormField
          label="역할명"
          required
          {...(errors.name?.message && { error: errors.name.message })}
          className="pb-4"
        >
          <Input
            type="text"
            {...register('name', {
              required: '역할명을 입력해주세요',
              minLength: {
                value: 2,
                message: '역할명은 최소 2자 이상이어야 합니다',
              },
              maxLength: {
                value: 50,
                message: '역할명은 최대 50자까지 입력 가능합니다',
              },
            })}
            required
            {...(errors.name?.message && { error: errors.name.message })}
            placeholder="역할명을 입력하세요"
          />
        </FormField>

        <FormField
          label="설명"
          {...(errors.description?.message && { error: errors.description.message })}
          hint="역할에 대한 상세한 설명을 입력하세요 (선택사항)"
          className="pb-4"
        >
          <Textarea
            {...register('description', {
              maxLength: {
                value: 500,
                message: '설명은 최대 500자까지 입력 가능합니다',
              },
            })}
            {...(errors.description?.message && { error: errors.description.message })}
            rows={3}
            placeholder="역할에 대한 설명을 입력하세요 (선택사항)"
          />
        </FormField>

        <FormField
          label="우선순위"
          required
          {...(errors.priority?.message && { error: errors.priority.message })}
          hint="낮은 숫자일수록 높은 우선순위입니다 (1-100)"
          className="pb-4"
        >
          <Input
            type="number"
            {...register('priority', {
              required: '우선순위를 입력해주세요',
              min: {
                value: 1,
                message: '우선순위는 1 이상이어야 합니다',
              },
              max: {
                value: 100,
                message: '우선순위는 100 이하여야 합니다',
              },
              valueAsNumber: true,
            })}
            required
            {...(errors.priority?.message && { error: errors.priority.message })}
            placeholder="1"
            min="1"
            max="100"
          />
        </FormField>

        {!role && (
          <FormField
            label="서비스"
            required
            {...(errors.serviceId?.message && { error: errors.serviceId.message })}
            hint="이 역할이 속할 서비스를 선택하세요"
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
            className="bg-purple-600 hover:bg-purple-700"
          >
            {role ? '수정' : '생성'}
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
});

RoleFormModal.displayName = 'RoleFormModal';

export default RoleFormModal;
