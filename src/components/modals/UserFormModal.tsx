'use client';

import { memo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import LoadingButton from '@/components/common/LoadingButton';
import FormField, { Input } from '@/components/common/FormField';
import { ApiErrorMessage } from '@/components/common/ErrorMessage';
import type { UserDetail } from '@/types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateUserRequest) => Promise<void>;
  user?: UserDetail | null;
  isLoading?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
}

type UpdateUserRequest = {
  email: string;
  name: string;
  nickname: string;
  password?: string;
};

/**
 * UserFormModal - 사용자 수정 모달
 *
 * 사용자 정보 수정을 위한 폼 모달입니다.
 * (사용자 생성은 auth-server에서 담당)
 *
 * @example
 * ```tsx
 * <UserFormModal
 *   isOpen={isModalOpen}
 *   onClose={handleCloseModal}
 *   onSubmit={handleSubmit}
 *   user={selectedUser}
 *   isLoading={isActionsLoading('save')}
 *   error={formError}
 *   onErrorDismiss={() => setFormError(null)}
 * />
 * ```
 */
const UserFormModal = memo<UserFormModalProps>(function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  isLoading = false,
  error,
  onErrorDismiss,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateUserRequest>({
    defaultValues: {
      email: '',
      name: '',
      nickname: '',
      password: '',
    },
    mode: 'onChange',
  });

  // user가 변경되면 폼 초기화
  useEffect(() => {
    if (user) {
      reset({
        email: user.email || '',
        name: user.name || '',
        nickname: user.nickname || '',
        password: '',
      });
    } else {
      reset({
        email: '',
        name: '',
        nickname: '',
        password: '',
      });
    }
  }, [user, reset]);

  const handleFormSubmit = async (data: UpdateUserRequest): Promise<void> => {
    await onSubmit(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? '사용자 수정' : '사용자 정보'} size="lg">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* 일반적인 에러 메시지 */}
        {error && (
          <ApiErrorMessage
            error={{ message: error }}
            {...(onErrorDismiss && { onDismiss: onErrorDismiss })}
          />
        )}

        <FormField
          label="이메일"
          required
          {...(errors.email?.message && { error: errors.email.message })}
          className="pb-4"
        >
          <Input
            type="email"
            {...register('email', {
              required: '이메일을 입력해주세요',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '올바른 이메일 형식을 입력해주세요',
              },
            })}
            required
            {...(errors.email?.message && { error: errors.email.message })}
            placeholder="user@example.com"
          />
        </FormField>

        <FormField
          label="이름"
          required
          {...(errors.name?.message && { error: errors.name.message })}
          className="pb-4"
        >
          <Input
            type="text"
            {...register('name', {
              required: '이름을 입력해주세요',
              minLength: {
                value: 2,
                message: '이름은 최소 2자 이상이어야 합니다',
              },
            })}
            required
            {...(errors.name?.message && { error: errors.name.message })}
            placeholder="홍길동"
          />
        </FormField>

        <FormField
          label="닉네임"
          required
          {...(errors.nickname?.message && { error: errors.nickname.message })}
          className="pb-4"
        >
          <Input
            type="text"
            {...register('nickname', {
              required: '닉네임을 입력해주세요',
              minLength: {
                value: 2,
                message: '닉네임은 최소 2자 이상이어야 합니다',
              },
            })}
            required
            {...(errors.nickname?.message && { error: errors.nickname.message })}
            placeholder="닉네임"
          />
        </FormField>

        <FormField
          label="비밀번호"
          {...(errors.password?.message && { error: errors.password.message })}
          hint="변경하지 않으려면 비워두세요"
          className="pb-4"
        >
          <Input
            type="password"
            {...register('password', {
              minLength: {
                value: 8,
                message: '비밀번호는 최소 8자 이상이어야 합니다',
              },
            })}
            {...(errors.password?.message && { error: errors.password.message })}
            placeholder="새 비밀번호 (선택사항)"
          />
        </FormField>

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
            수정
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
});

UserFormModal.displayName = 'UserFormModal';

export default UserFormModal;
