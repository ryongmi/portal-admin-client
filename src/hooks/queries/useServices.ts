import { useQuery } from '@tanstack/react-query';
import { serviceService } from '@/services/serviceService';
import { queryKeys } from './keys';
import type { ServiceSearchQuery } from '@/types';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useServices(query: ServiceSearchQuery = {}) {
  return useQuery({
    queryKey: queryKeys.services.list(query),
    queryFn: () => serviceService.getServices(query),
    staleTime: 2 * 60 * 1000,
  });
}
