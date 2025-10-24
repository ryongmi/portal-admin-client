'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import AdminAuthGuard from '@/components/auth/AdminAuthGuard';
import Button from '@/components/common/Button';
import LoadingButton from '@/components/common/LoadingButton';
import FormField, { Input } from '@/components/common/FormField';
import { ApiErrorMessage } from '@/components/common/ErrorMessage';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { validationRules } from '@/utils/formValidation';
import { toast } from '@/components/common/ToastContainer';

interface ProfileFormData {
  name: string;
  email: string;
  nickname: string;
  phoneNumber?: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage(): JSX.Element {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'security'>('profile');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // 로딩 상태 관리
  const { isLoading: isActionsLoading, withLoading } = useLoadingState();

  // 에러 핸들러
  const { handleApiError } = useErrorHandler();

  // 프로필 폼 설정
  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      name: '관리자',
      email: 'admin@krgeobuk.com',
      nickname: '시스템 관리자',
      phoneNumber: '',
    },
    mode: 'onChange',
  });

  // 비밀번호 폼 설정
  const passwordForm = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  // 프로필 정보 저장
  const onProfileSubmit = withLoading(
    'profileSave',
    async (_data: ProfileFormData) => {
      try {
        setProfileError(null);
        
        // API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.success('프로필 업데이트', '프로필 정보가 성공적으로 업데이트되었습니다.');
      } catch (error: unknown) {
        const errorMessage = handleApiError(error, { showToast: false });
        setProfileError(errorMessage);
      }
    }
  );

  // 비밀번호 변경
  const onPasswordSubmit = withLoading(
    'passwordChange',
    async (data: PasswordFormData) => {
      try {
        setPasswordError(null);

        if (data.newPassword !== data.confirmPassword) {
          setPasswordError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
          return;
        }

        // API 호출 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.success('비밀번호 변경', '비밀번호가 성공적으로 변경되었습니다.');
        passwordForm.reset();
      } catch (error: unknown) {
        const errorMessage = handleApiError(error, { showToast: false });
        setPasswordError(errorMessage);
      }
    }
  );

  const tabs = [
    { id: 'profile', name: '기본 정보', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'password', name: '비밀번호', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { id: 'security', name: '보안 설정', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  ] as const;

  return (
    <AdminAuthGuard>
      <Layout>
        <div className="space-y-6">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">프로필 설정</h1>
                  <p className="text-white/80 mt-1">개인 정보와 보안 설정을 관리하세요</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="!bg-white !text-blue-600 hover:!bg-blue-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                돌아가기
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* 사이드바 탭 */}
            <div className="lg:w-64">
              <div className="bg-white rounded-lg shadow p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                      </svg>
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* 프로필 요약 카드 */}
              <div className="bg-white rounded-lg shadow p-4 mt-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white text-xl font-bold">관</span>
                  </div>
                  <h3 className="font-medium text-gray-900">관리자</h3>
                  <p className="text-sm text-gray-500">admin@krgeobuk.com</p>
                  <div className="flex items-center justify-center mt-2">
                    <div className="flex items-center text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                      온라인
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow">
                {/* 기본 정보 탭 */}
                {activeTab === 'profile' && (
                  <div className="p-6">
                    <div className="border-b border-gray-200 pb-4 mb-6">
                      <h2 className="text-lg font-medium text-gray-900">기본 정보</h2>
                      <p className="text-sm text-gray-500 mt-1">개인 정보를 수정할 수 있습니다</p>
                    </div>

                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      {profileError && (
                        <ApiErrorMessage
                          error={{ message: profileError }}
                          onDismiss={() => setProfileError(null)}
                        />
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          label="이름"
                          required
                          {...(profileForm.formState.errors.name?.message && { 
                            error: profileForm.formState.errors.name.message 
                          })}
                        >
                          <Input
                            {...profileForm.register('name', validationRules.name)}
                            placeholder="이름을 입력하세요"
                          />
                        </FormField>

                        <FormField
                          label="이메일"
                          required
                          {...(profileForm.formState.errors.email?.message && { 
                            error: profileForm.formState.errors.email.message 
                          })}
                        >
                          <Input
                            type="email"
                            {...profileForm.register('email', validationRules.email)}
                            placeholder="example@domain.com"
                          />
                        </FormField>

                        <FormField
                          label="닉네임"
                          {...(profileForm.formState.errors.nickname?.message && { 
                            error: profileForm.formState.errors.nickname.message 
                          })}
                        >
                          <Input
                            {...profileForm.register('nickname', {
                              maxLength: {
                                value: 30,
                                message: '닉네임은 최대 30자까지 입력 가능합니다',
                              },
                            })}
                            placeholder="닉네임을 입력하세요"
                          />
                        </FormField>

                        <FormField
                          label="전화번호"
                          {...(profileForm.formState.errors.phoneNumber?.message && { 
                            error: profileForm.formState.errors.phoneNumber.message 
                          })}
                        >
                          <Input
                            type="tel"
                            {...profileForm.register('phoneNumber', {
                              pattern: {
                                value: /^[0-9-+().\s]+$/,
                                message: '올바른 전화번호 형식을 입력해주세요',
                              },
                            })}
                            placeholder="010-1234-5678"
                          />
                        </FormField>
                      </div>

                      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => profileForm.reset()}
                        >
                          초기화
                        </Button>
                        <LoadingButton
                          type="submit"
                          isLoading={isActionsLoading('profileSave')}
                          loadingText="저장 중..."
                        >
                          저장하기
                        </LoadingButton>
                      </div>
                    </form>
                  </div>
                )}

                {/* 비밀번호 변경 탭 */}
                {activeTab === 'password' && (
                  <div className="p-6">
                    <div className="border-b border-gray-200 pb-4 mb-6">
                      <h2 className="text-lg font-medium text-gray-900">비밀번호 변경</h2>
                      <p className="text-sm text-gray-500 mt-1">보안을 위해 정기적으로 비밀번호를 변경하세요</p>
                    </div>

                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                      {passwordError && (
                        <ApiErrorMessage
                          error={{ message: passwordError }}
                          onDismiss={() => setPasswordError(null)}
                        />
                      )}

                      <FormField
                        label="현재 비밀번호"
                        required
                        {...(passwordForm.formState.errors.currentPassword?.message && { 
                          error: passwordForm.formState.errors.currentPassword.message 
                        })}
                      >
                        <Input
                          type="password"
                          {...passwordForm.register('currentPassword', {
                            required: '현재 비밀번호를 입력해주세요',
                          })}
                          placeholder="현재 비밀번호를 입력하세요"
                        />
                      </FormField>

                      <FormField
                        label="새 비밀번호"
                        required
                        {...(passwordForm.formState.errors.newPassword?.message && { 
                          error: passwordForm.formState.errors.newPassword.message 
                        })}
                        hint="최소 8자, 대소문자, 숫자, 특수문자 포함"
                      >
                        <Input
                          type="password"
                          {...passwordForm.register('newPassword', validationRules.password)}
                          placeholder="새 비밀번호를 입력하세요"
                        />
                      </FormField>

                      <FormField
                        label="새 비밀번호 확인"
                        required
                        {...(passwordForm.formState.errors.confirmPassword?.message && { 
                          error: passwordForm.formState.errors.confirmPassword.message 
                        })}
                      >
                        <Input
                          type="password"
                          {...passwordForm.register('confirmPassword', {
                            required: '비밀번호 확인을 입력해주세요',
                          })}
                          placeholder="새 비밀번호를 다시 입력하세요"
                        />
                      </FormField>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex">
                          <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">보안 권장사항</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <ul className="list-disc pl-5 space-y-1">
                                <li>비밀번호는 최소 8자 이상이어야 합니다</li>
                                <li>대문자, 소문자, 숫자, 특수문자를 포함해야 합니다</li>
                                <li>이전에 사용한 비밀번호는 피해주세요</li>
                                <li>다른 사이트와 동일한 비밀번호는 사용하지 마세요</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => passwordForm.reset()}
                        >
                          초기화
                        </Button>
                        <LoadingButton
                          type="submit"
                          isLoading={isActionsLoading('passwordChange')}
                          loadingText="변경 중..."
                        >
                          비밀번호 변경
                        </LoadingButton>
                      </div>
                    </form>
                  </div>
                )}

                {/* 보안 설정 탭 */}
                {activeTab === 'security' && (
                  <div className="p-6">
                    <div className="border-b border-gray-200 pb-4 mb-6">
                      <h2 className="text-lg font-medium text-gray-900">보안 설정</h2>
                      <p className="text-sm text-gray-500 mt-1">계정 보안을 강화하세요</p>
                    </div>

                    <div className="space-y-6">
                      {/* 2단계 인증 */}
                      <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-sm font-medium text-gray-900">2단계 인증</h3>
                            <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              활성화됨
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            휴대폰 인증을 통해 계정 보안을 강화합니다
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          설정 변경
                        </Button>
                      </div>

                      {/* 로그인 세션 */}
                      <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">활성 세션</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            현재 로그인된 기기: 1개
                          </p>
                          <div className="mt-2 text-xs text-gray-400">
                            마지막 로그인: 2024년 7월 20일 오후 2:30 (Chrome, Windows)
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          세션 관리
                        </Button>
                      </div>

                      {/* 계정 백업 */}
                      <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-900">계정 백업</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            계정 정보를 안전하게 백업하고 복원할 수 있습니다
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          백업 생성
                        </Button>
                      </div>

                      {/* 위험 영역 */}
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-red-600 mb-4">위험 영역</h3>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-red-800">계정 삭제</h4>
                          <p className="text-sm text-red-600 mt-1">
                            계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 text-red-600 border-red-300 hover:bg-red-50"
                          >
                            계정 삭제
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </AdminAuthGuard>
  );
}