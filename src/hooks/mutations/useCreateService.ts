import { useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '@/services/serviceService';
import { queryKeys } from '../queries/keys';
import type { CreateServiceRequest } from '@/types';

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
