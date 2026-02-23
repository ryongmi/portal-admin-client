import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '@/services/serviceService';
import { queryKeys } from '../queries/keys';

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
