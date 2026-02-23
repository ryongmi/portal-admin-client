import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '@/services/serviceService';
import { queryKeys } from '../queries/keys';
import type { CreateServiceRequest, UpdateServiceRequest } from '@/types';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceRequest) => serviceService.createService(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.services.all() });
    },
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceRequest }) =>
      serviceService.updateService(id, data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.services.all() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.services.detail(id) });
    },
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => serviceService.deleteService(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.services.all() });
    },
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAssignVisibleRoleToService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, roleId }: { serviceId: string; roleId: string }) =>
      serviceService.assignVisibleRoleToService(serviceId, roleId),
    onSuccess: (_, { serviceId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.services.visibleRoles(serviceId) });
    },
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useRemoveVisibleRoleFromService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, roleId }: { serviceId: string; roleId: string }) =>
      serviceService.removeVisibleRoleFromService(serviceId, roleId),
    onSuccess: (_, { serviceId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.services.visibleRoles(serviceId) });
    },
  });
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useReplaceServiceVisibleRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, roleIds }: { serviceId: string; roleIds: string[] }) =>
      serviceService.replaceServiceVisibleRoles(serviceId, roleIds),
    onSuccess: (_, { serviceId }) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.services.visibleRoles(serviceId) });
    },
  });
}
