'use client';

import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { Role, Permission } from '@/types';
import { useAppSelector } from '@/store/hooks';
// Service type available if needed

interface RoleFormData {
  name: string;
  description?: string | null;
  serviceId: string;
  priority: number;
}

interface RoleFormProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role | null;
  onSubmit: (data: RoleFormData) => void;
  showPermissionTab?: boolean;
  onPermissionUpdate?: (roleId: string, permissions: string[]) => void;
}

export default function RoleForm({
  isOpen,
  onClose,
  role,
  onSubmit,
  showPermissionTab = false,
  onPermissionUpdate,
}: RoleFormProps): JSX.Element {
  // Redux store에서 services와 permissions 가져오기
  const { services } = useAppSelector((state) => state.service);
  const { permissions } = useAppSelector((state) => state.permission);

  const [activeTab, setActiveTab] = useState<'basic' | 'permissions'>('basic');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permissionSearch, setPermissionSearch] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<RoleFormData>({
    defaultValues: {
      name: '',
      description: '',
      serviceId: '',
      priority: 5,
    },
  });

  const _watchedServiceId = watch('serviceId');

  useEffect(() => {
    if (role) {
      reset({
        name: role.name || '',
        description: role?.description || null,
        serviceId: role.serviceId || '',
        priority: role.priority || 5,
      });
      // 역할의 기존 권한 로드 (실제 API로 교체 필요)
      // TODO: 역할별 권한 조회 API 구현 후 연동
      const rolePermissions: string[] = [];
      setSelectedPermissions(rolePermissions);
    } else {
      reset({
        name: '',
        description: '',
        serviceId: '',
        priority: 5,
      });
      setSelectedPermissions([]);
    }
  }, [role, reset]);

  const handleFormSubmit = (data: RoleFormData): void => {
    let cleanedData: RoleFormData;

    if (role) {
      // 수정 모드: 빈 설명인 경우 null로 전달 (기존 설명 삭제)
      cleanedData = {
        ...data,
        description: data.description && data.description.trim() ? data.description.trim() : null,
      };
    } else {
      // 생성 모드: 빈 설명인 경우 필드 제거
      cleanedData = {
        ...data,
        ...(data.description && data.description.trim()
          ? { description: data.description.trim() }
          : { description: null }),
      };
    }

    onSubmit(cleanedData);
    if (role && onPermissionUpdate) {
      onPermissionUpdate(role.id, selectedPermissions);
    }
  };

  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch =
      permission.action?.toLowerCase().includes(permissionSearch.toLowerCase()) ||
      permission.description?.toLowerCase().includes(permissionSearch.toLowerCase());
    return matchesSearch;
  });

  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    const service = services.find((s) => s.id === permission.service?.id);
    const serviceName = service?.name || '알 수 없음';
    const [resource] = permission.action?.split(':') || [''];
    const key = `${serviceName} - ${resource}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handlePermissionToggle = (permissionId: string): void => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAllForResource = (groupKey: string): void => {
    const resourcePermissions = groupedPermissions[groupKey]?.map((p) => p.id) || [];
    const allSelected = resourcePermissions.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((id) => !resourcePermissions.includes(id)));
    } else {
      setSelectedPermissions((prev) => [...new Set([...prev, ...resourcePermissions])]);
    }
  };

  const handleSelectAllPermissions = (): void => {
    const allPermissionIds = filteredPermissions.map((p) => p.id);
    const allSelected = allPermissionIds.every((id) => selectedPermissions.includes(id));

    if (allSelected) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(allPermissionIds);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="relative -mx-6 -mt-6">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {role ? '역할 수정' : '새 역할 추가'}
              </h3>
              <p className="text-white/80 text-sm mt-1">
                {role ? '기존 역할 정보를 수정합니다' : '새로운 시스템 역할을 생성합니다'}
              </p>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        {showPermissionTab && role && (
          <div className="flex border-b border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`px-6 py-3 text-sm font-medium flex items-center space-x-2 transition-all ${
                activeTab === 'basic'
                  ? 'border-b-2 border-green-500 text-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>기본 정보</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('permissions')}
              className={`px-6 py-3 text-sm font-medium flex items-center space-x-2 transition-all ${
                activeTab === 'permissions'
                  ? 'border-b-2 border-green-500 text-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>권한 설정</span>
            </button>
          </div>
        )}

        {/* 기본 정보 탭 */}
        {activeTab === 'basic' && (
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    역할 이름 <span className="text-red-500">*</span>
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="역할 이름을 입력하세요"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  {...register('name', {
                    required: '역할 이름을 입력해주세요',
                    minLength: {
                      value: 2,
                      message: '역할 이름은 최소 2자 이상이어야 합니다',
                    },
                  })}
                />
                {errors.name && (
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
                    <p className="text-sm text-red-600">{errors.name.message}</p>
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
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                  <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    설명 <span className="text-gray-400">(선택사항)</span>
                  </label>
                </div>
                <textarea
                  rows={3}
                  placeholder="역할에 대한 설명을 입력하세요 (선택사항)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none bg-white"
                  {...register('description')}
                />
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
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
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
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    우선순위 <span className="text-red-500">*</span>
                  </label>
                </div>
                <select
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.priority ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  {...register('priority', {
                    required: '우선순위를 선택해주세요',
                    valueAsNumber: true,
                  })}
                >
                  <option value={1}>1 (최고)</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5 (보통)</option>
                  <option value={6}>6</option>
                  <option value={7}>7</option>
                  <option value={8}>8</option>
                  <option value={9}>9 (최저)</option>
                </select>
                {errors.priority && (
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
                    <p className="text-sm text-red-600">{errors.priority.message}</p>
                  </div>
                )}
              </div>
            </form>
          </div>
        )}

        {/* 권한 설정 탭 */}
        {activeTab === 'permissions' && (
          <div className="px-6 py-6">
            <div className="space-y-6">
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    권한 검색
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="권한을 검색하세요..."
                  value={permissionSearch}
                  onChange={(e) => setPermissionSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                />
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* 전체 선택/해제 버튼 */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-blue-600"
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
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">전체 권한</h4>
                        <p className="text-xs text-gray-500">{filteredPermissions.length}개 권한</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSelectAllPermissions}
                      className="text-blue-500 border-blue-300 hover:bg-blue-50 transition-all hover:scale-105"
                    >
                      {filteredPermissions.every((p) => selectedPermissions.includes(p.id)) ? (
                        <>
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          전체 해제
                        </>
                      ) : (
                        <>
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          전체 선택
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {Object.entries(groupedPermissions).map(([groupKey, permissions]) => (
                    <div key={groupKey} className="border-b border-gray-100 last:border-b-0">
                      <div className="bg-gradient-to-r from-green-50 to-teal-50 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-green-600"
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
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{groupKey}</h4>
                            <p className="text-xs text-gray-500">{permissions.length}개 권한</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectAllForResource(groupKey)}
                          className="text-green-600 border-green-300 hover:bg-green-50 transition-all hover:scale-105"
                        >
                          {permissions.every((p) => selectedPermissions.includes(p.id)) ? (
                            <>
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
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              전체 해제
                            </>
                          ) : (
                            <>
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
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              전체 선택
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="p-3 space-y-2">
                        {permissions.map((permission) => {
                          const serviceName =
                            services.find((s) => s.id === permission.serviceId)?.displayName ||
                            '알 수 없음';
                          return (
                            <label
                              key={permission.id}
                              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-all"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(permission.id)}
                                onChange={() => handlePermissionToggle(permission.id)}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900">
                                    {permission.action?.split(':')[0] || ''}
                                  </span>
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
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                    {permission.action?.split(':')[1] || ''}
                                  </span>
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                    {serviceName}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {permission.description}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-green-600"
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
                    <span className="text-sm font-medium text-gray-700">
                      {selectedPermissions.length}개 권한 선택됨
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
            {activeTab === 'basic' && (
              <Button
                type="submit"
                disabled={isSubmitting}
                onClick={handleSubmit(handleFormSubmit)}
                className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white transition-all hover:scale-105"
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
                    {role ? '수정' : '추가'}
                  </>
                )}
              </Button>
            )}
            {activeTab === 'permissions' && (
              <Button
                onClick={() =>
                  role && onPermissionUpdate && onPermissionUpdate(role.id, selectedPermissions)
                }
                className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white transition-all hover:scale-105"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                권한 저장
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

