import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roleService } from '@/services/roleService';
import { queryKeys } from '../queries/keys';

interface CreateRoleData {
  name: string;
  description?: string | null;
  priority: number;
  serviceId: string;
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
