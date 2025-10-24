'use client';

import { memo, useMemo } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import type { UserDetail, RoleSearchResult, ServiceSearchResult } from '@/types';

interface UserRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDetail | null;
  roles: RoleSearchResult[];
  userRoles: string[];
  onAssignRole: (userId: string, roleId: string) => Promise<void>;
  onRemoveRole: (userId: string, roleId: string) => Promise<void>;
  services: ServiceSearchResult[];
  isLoading?: boolean;
}

/**
 * UserRoleModal - 사용자 역할 관리 모달
 *
 * 사용자에게 역할을 할당하거나 제거하는 모달입니다.
 *
 * @example
 * ```tsx
 * <UserRoleModal
 *   isOpen={isRoleModalOpen}
 *   onClose={handleCloseRoleModal}
 *   user={selectedUser}
 *   roles={roles}
 *   userRoles={userRoles}
 *   onAssignRole={handleAssignRole}
 *   onRemoveRole={handleRemoveRole}
 *   services={services}
 * />
 * ```
 */
const UserRoleModal = memo<UserRoleModalProps>(function UserRoleModal({
  isOpen,
  onClose,
  user,
  roles,
  userRoles,
  onAssignRole,
  onRemoveRole,
  services,
}) {
  // 서비스별 역할 그룹화
  const rolesByService = useMemo(() => {
    const grouped = new Map<string, RoleSearchResult[]>();

    roles.forEach((role) => {
      const serviceId = role.service?.id || 'system';
      if (!grouped.has(serviceId)) {
        grouped.set(serviceId, []);
      }
      grouped.get(serviceId)!.push(role);
    });

    return grouped;
  }, [roles]);

  // 사용자가 가진 역할과 가능한 역할 분리
  const assignedRoles = useMemo(() => {
    return roles.filter((role) => userRoles.includes(role.id));
  }, [roles, userRoles]);

  const availableRoles = useMemo(() => {
    return roles.filter((role) => !userRoles.includes(role.id));
  }, [roles, userRoles]);

  const handleAssign = async (roleId: string): Promise<void> => {
    if (user) {
      await onAssignRole(user.id, roleId);
    }
  };

  const handleRemove = async (roleId: string): Promise<void> => {
    if (user) {
      await onRemoveRole(user.id, roleId);
    }
  };

  const getServiceName = (serviceId: string): string => {
    if (serviceId === 'system') return '시스템 역할';
    const service = services.find((s) => s.id === serviceId);
    return service?.name || '알 수 없음';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="역할 관리" size="xl">
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            사용자: <strong className="text-gray-900">{user?.name}</strong> ({user?.email})
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* 현재 할당된 역할 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">현재 할당된 역할</h4>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Array.from(rolesByService.entries()).map(([serviceId, serviceRoles]) => {
                const assigned = serviceRoles.filter((role) => userRoles.includes(role.id));
                if (assigned.length === 0) return null;

                return (
                  <div key={serviceId} className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">
                      {getServiceName(serviceId)}
                    </h5>
                    {assigned.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{role.name}</p>
                          {role.description && (
                            <p className="text-sm text-gray-500">{role.description}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemove(role.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          제거
                        </Button>
                      </div>
                    ))}
                  </div>
                );
              })}
              {assignedRoles.length === 0 && (
                <p className="text-sm text-gray-500">할당된 역할이 없습니다</p>
              )}
            </div>
          </div>

          {/* 할당 가능한 역할 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">할당 가능한 역할</h4>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Array.from(rolesByService.entries()).map(([serviceId, serviceRoles]) => {
                const available = serviceRoles.filter((role) => !userRoles.includes(role.id));
                if (available.length === 0) return null;

                return (
                  <div key={serviceId} className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">
                      {getServiceName(serviceId)}
                    </h5>
                    {available.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{role.name}</p>
                          {role.description && (
                            <p className="text-sm text-gray-500">{role.description}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssign(role.id)}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          할당
                        </Button>
                      </div>
                    ))}
                  </div>
                );
              })}
              {availableRoles.length === 0 && (
                <p className="text-sm text-gray-500">모든 역할이 이미 할당되었습니다</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  );
});

UserRoleModal.displayName = 'UserRoleModal';

export default UserRoleModal;
