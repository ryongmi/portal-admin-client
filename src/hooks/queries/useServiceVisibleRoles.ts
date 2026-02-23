import { useQuery } from '@tanstack/react-query';
import { serviceService } from '@/services/serviceService';
import { queryKeys } from './keys';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useServiceVisibleRoles(serviceId: string | null) {
  return useQuery({
    queryKey: queryKeys.services.visibleRoles(serviceId ?? ''),
    queryFn: () => serviceService.getServiceVisibleRoles(serviceId!),
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000,
  });
}
