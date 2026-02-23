import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '@/services/roleService';
import { queryKeys } from '../queries/keys';

interface CreateRoleData {
  name: string;
  description?: string | null;
  priority: number;
  serviceId: string;
}

interface UpdateRoleData {
  name?: string;
  description?: string | null;
  priority?: number;
  serviceId?: string;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleData) => roleService.createRole(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.all() });
    },
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleData }) =>
      roleService.updateRole(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.detail(id) });
    },
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.all() });
    },
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAssignRoleToUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      roleService.assignRoleToUser(userId, roleId),
    onSuccess: (_, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.byUser(userId) });
    },
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useRemoveRoleFromUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      roleService.removeRoleFromUser(userId, roleId),
    onSuccess: (_, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.roles.byUser(userId) });
    },
  });
}
