import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '@/services/roleService';
import { queryKeys } from '../queries/keys';

interface UpdateRoleData {
  name?: string;
  description?: string | null;
  priority?: number;
  serviceId?: string;
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
