import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { queryKeys } from './keys';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAuthInitialize(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.auth.initialize(),
    queryFn: () => authService.initialize(),
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
