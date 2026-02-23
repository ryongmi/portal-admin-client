import { useMutation, useQueryClient } from '@tanstack/react-query';
import { permissionService } from '@/services/permissionService';
import { queryKeys } from '../queries/keys';

interface CreatePermissionData {
  action: string;
  description?: string | null;
  serviceId: string;
}

interface UpdatePermissionData {
  action?: string;
  description?: string | null;
  serviceId?: string;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePermissionData) => permissionService.createPermission(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all() });
    },
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePermissionData }) =>
      permissionService.updatePermission(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.detail(id) });
    },
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => permissionService.deletePermission(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all() });
    },
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAssignPermissionToRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
      permissionService.assignPermissionToRole(roleId, permissionId),
    onSuccess: (_, { roleId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.byRole(roleId) });
    },
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useRemovePermissionFromRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
      permissionService.removePermissionFromRole(roleId, permissionId),
    onSuccess: (_, { roleId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.byRole(roleId) });
    },
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAssignMultiplePermissionsToRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      permissionService.assignMultiplePermissionsToRole(roleId, permissionIds),
    onSuccess: (_, { roleId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.byRole(roleId) });
    },
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useReplaceRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      permissionService.replaceRolePermissions(roleId, permissionIds),
    onSuccess: (_, { roleId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.permissions.byRole(roleId) });
    },
  });
}
