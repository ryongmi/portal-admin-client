import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { queryKeys } from './keys';
import type { UserProfile } from '@krgeobuk/user/interfaces';

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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useMyProfile() {
  const { isAuthenticated } = useAuthStore();

  return useQuery<UserProfile>({
    queryKey: queryKeys.auth.myProfile(),
    queryFn: () => authService.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
