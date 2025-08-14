'use client';

import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { Permission } from '@/types';
import { useAppSelector } from '@/store/hooks';

interface PermissionFormData {
  action: string;
  description: string | null | undefined;
  serviceId: string;
}

interface PermissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  permission?: Permission | null;
  onSubmit: (data: PermissionFormData) => void;
}

export default function PermissionForm({
  isOpen,
  onClose,
  permission,
  onSubmit,
}: PermissionFormProps): JSX.Element {
  // Redux store에서 services 가져오기
  const { services } = useAppSelector((state) => state.service);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<PermissionFormData>({
    defaultValues: {
      action: '',
      description: undefined,
      serviceId: '',
    },
  });

  const watchedAction = watch('action');

  useEffect(() => {
    if (permission) {
      reset({
        action: permission.action || '',
        description: permission.description,
        serviceId: permission.serviceId || '',
      });
    } else {
      reset({
        action: '',
        description: undefined,
        serviceId: '',
      });
    }
  }, [permission, reset]);

  const validateActionFormat = (action: string): boolean | string => {
    const actionPattern = /^[a-zA-Z]+:[a-zA-Z]+$/;
    if (!actionPattern.test(action)) {
      return 'Action은 "resource:action" 형식이어야 합니다 (예: user:read)';
    }
    return true;
  };

  const getActionSuggestions = (): string[] => {
    return [
      'user:create',
      'user:read',
      'user:update',
      'user:delete',
      'role:create',
      'role:read',
      'role:update',
      'role:delete',
      'permission:create',
      'permission:read',
      'permission:update',
      'permission:delete',
      'service:create',
      'service:read',
      'service:update',
      'service:delete',
    ];
  };

  const handleFormSubmit = (data: PermissionFormData): void => {
    onSubmit(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="relative -mx-6 -mt-6">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {permission ? '권한 수정' : '새 권한 추가'}
              </h3>
              <p className="text-white/80 text-sm mt-1">
                {permission ? '기존 권한 정보를 수정합니다' : '새로운 시스템 권한을 생성합니다'}
              </p>
            </div>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="px-6 py-6">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center space-x-2 mb-3">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  권한 액션 <span className="text-red-500">*</span>
                </label>
              </div>
              <input
                type="text"
                placeholder="resource:action (예: user:read)"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.action ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                {...register('action', {
                  required: '권한 액션을 입력해주세요',
                  validate: validateActionFormat,
                })}
              />
              {errors.action && (
                <div className="mt-2 flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 18.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className="text-sm text-red-600">{errors.action.message}</p>
                </div>
              )}

              {/* Action 제안 */}
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  추천 액션:
                </p>
                <div className="flex flex-wrap gap-2">
                  {getActionSuggestions().map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setValue('action', suggestion)}
                      className="px-3 py-1 text-xs bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 rounded-full transition-all duration-200 hover:scale-105"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center space-x-2 mb-3">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  설명 <span className="text-red-500">*</span>
                </label>
              </div>
              <textarea
                rows={3}
                placeholder="권한에 대한 설명을 입력해주세요"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                  errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                {...register('description', {
                  required: '설명을 입력해주세요',
                  minLength: {
                    value: 5,
                    message: '설명은 최소 5자 이상 입력해주세요',
                  },
                })}
              />
              {errors.description && (
                <div className="mt-2 flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 18.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center space-x-2 mb-3">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  서비스 <span className="text-red-500">*</span>
                </label>
              </div>
              <select
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.serviceId ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                {...register('serviceId', {
                  required: '서비스를 선택해주세요',
                })}
              >
                <option value="">서비스 선택</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              {errors.serviceId && (
                <div className="mt-2 flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 18.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <p className="text-sm text-red-600">{errors.serviceId.message}</p>
                </div>
              )}
            </div>

            {/* Action 미리보기 */}
            {watchedAction && validateActionFormat(watchedAction) === true && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <p className="text-sm text-blue-800 font-semibold">미리보기</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-700">{watchedAction.split(':')[0]}</span>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {watchedAction.split(':')[1]}
                  </span>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* 액션 버튼 */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg border-t border-gray-100">
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="transition-all hover:scale-105"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              onClick={handleSubmit(handleFormSubmit)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white transition-all hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  처리중...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {permission ? '수정' : '추가'}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

