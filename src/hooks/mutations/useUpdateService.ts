import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '@/services/serviceService';
import { queryKeys } from '../queries/keys';
import type { UpdateServiceRequest } from '@/types';

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
