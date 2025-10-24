'use client';

import { memo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import LoadingButton from '@/components/common/LoadingButton';
import FormField, { Input, Textarea, Checkbox } from '@/components/common/FormField';
import { ApiErrorMessage } from '@/components/common/ErrorMessage';
import type { ServiceDetail, CreateServiceRequest, UpdateServiceRequest } from '@/types';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateServiceRequest | UpdateServiceRequest) => Promise<void>;
  service?: ServiceDetail | null;
  isLoading?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
}

type ServiceFormData = {
  name: string;
  description: string | null;
  baseUrl: string | null;
  displayName: string | null;
  iconUrl: string | null;
  isVisible: boolean;
  isVisibleByRole: boolean;
};

const validationRules = {
  url: {
    pattern: {
      value: /^https?:\/\/.+/,
      message: '유효한 URL을 입력해주세요 (http:// 또는 https://로 시작)',
    },
  },
};

/**
 * ServiceFormModal - 서비스 생성/수정 모달
 *
 * 서비스 생성 및 수정을 위한 폼 모달입니다.
 *
 * @example
 * ```tsx
 * <ServiceFormModal
 *   isOpen={isModalOpen}
 *   onClose={handleCloseModal}
 *   onSubmit={handleSubmit}
 *   service={selectedService}
 *   isLoading={isActionsLoading('save')}
 *   error={formError}
 *   onErrorDismiss={() => setFormError(null)}
 * />
 * ```
 */
const ServiceFormModal = memo<ServiceFormModalProps>(function ServiceFormModal({
  isOpen,
  onClose,
  onSubmit,
  service,
  isLoading = false,
  error,
  onErrorDismiss,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ServiceFormData>({
    defaultValues: {
      name: '',
      description: null,
      baseUrl: null,
      displayName: null,
      iconUrl: null,
      isVisible: true,
      isVisibleByRole: false,
    },
    mode: 'onChange',
  });

  // service가 변경되면 폼 초기화
  useEffect(() => {
    if (service) {
      reset({
        name: service.name || '',
        description: service.description || null,
        baseUrl: service.baseUrl || null,
        displayName: service.displayName || null,
        iconUrl: service.iconUrl || null,
        isVisible: service.isVisible ?? true,
        isVisibleByRole: service.isVisibleByRole ?? false,
      });
    } else {
      reset({
        name: '',
        description: null,
        baseUrl: null,
        displayName: null,
        iconUrl: null,
        isVisible: true,
        isVisibleByRole: false,
      });
    }
  }, [service, reset]);

  const handleFormSubmit = async (data: ServiceFormData): Promise<void> => {
    await onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={service ? '서비스 수정' : '새 서비스 추가'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* 일반적인 에러 메시지 */}
        {error && <ApiErrorMessage error={{ message: error }} {...(onErrorDismiss && { onDismiss: onErrorDismiss })} />}

        <FormField
          label="서비스명"
          required
          {...(errors.name?.message && { error: errors.name.message })}
          className="pb-4"
        >
          <Input
            type="text"
            {...register('name', {
              required: '서비스명을 입력해주세요',
              minLength: {
                value: 2,
                message: '서비스명은 최소 2자 이상이어야 합니다',
              },
              maxLength: {
                value: 100,
                message: '서비스명은 최대 100자까지 입력 가능합니다',
              },
            })}
            required
            {...(errors.name?.message && { error: errors.name.message })}
            placeholder="서비스명을 입력하세요"
          />
        </FormField>

        <FormField
          label="표시명"
          {...(errors.displayName?.message && { error: errors.displayName.message })}
          hint="사용자에게 표시될 이름입니다 (선택사항)"
          className="pb-4"
        >
          <Input
            type="text"
            {...register('displayName', {
              maxLength: {
                value: 100,
                message: '표시명은 최대 100자까지 입력 가능합니다',
              },
            })}
            {...(errors.displayName?.message && { error: errors.displayName.message })}
            placeholder="사용자에게 표시될 이름 (선택사항)"
          />
        </FormField>

        <FormField
          label="설명"
          {...(errors.description?.message && { error: errors.description.message })}
          hint="서비스에 대한 상세한 설명을 입력하세요 (선택사항)"
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
            placeholder="서비스에 대한 설명을 입력하세요 (선택사항)"
          />
        </FormField>

        <FormField
          label="Base URL"
          {...(errors.baseUrl?.message && { error: errors.baseUrl.message })}
          hint="서비스의 기본 URL입니다 (선택사항)"
          className="pb-4"
        >
          <Input
            type="url"
            {...register('baseUrl', validationRules.url)}
            {...(errors.baseUrl?.message && { error: errors.baseUrl.message })}
            placeholder="https://example.com (선택사항)"
          />
        </FormField>

        <FormField
          label="아이콘 URL"
          {...(errors.iconUrl?.message && { error: errors.iconUrl.message })}
          hint="서비스 아이콘의 URL입니다 (선택사항)"
          className="pb-4"
        >
          <Input
            type="url"
            {...register('iconUrl', validationRules.url)}
            {...(errors.iconUrl?.message && { error: errors.iconUrl.message })}
            placeholder="https://example.com/icon.png (선택사항)"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <Checkbox
            {...register('isVisible')}
            label="포털에서 표시"
            {...(errors.isVisible?.message && { error: errors.isVisible.message })}
          />
          <Checkbox
            {...register('isVisibleByRole')}
            label="권한 기반 표시"
            {...(errors.isVisibleByRole?.message && {
              error: errors.isVisibleByRole.message,
            })}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <LoadingButton
            type="submit"
            isLoading={isLoading}
            loadingText="저장 중..."
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {service ? '수정' : '생성'}
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
});

ServiceFormModal.displayName = 'ServiceFormModal';

export default ServiceFormModal;
