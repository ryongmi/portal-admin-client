export const queryKeys = {
  auth: {
    initialize: () => ['auth', 'initialize'] as const,
    myProfile: () => ['auth', 'myProfile'] as const,
  },
  users: {
    all: () => ['users'] as const,
    list: (query?: object) => ['users', 'list', query] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  roles: {
    all: () => ['roles'] as const,
    list: (query?: object) => ['roles', 'list', query] as const,
    detail: (id: string) => ['roles', 'detail', id] as const,
    byUser: (userId: string) => ['roles', 'user', userId] as const,
  },
  permissions: {
    all: () => ['permissions'] as const,
    list: (query?: object) => ['permissions', 'list', query] as const,
    detail: (id: string) => ['permissions', 'detail', id] as const,
    byRole: (roleId: string) => ['permissions', 'role', roleId] as const,
    byUser: (userId: string) => ['permissions', 'user', userId] as const,
  },
  services: {
    all: () => ['services'] as const,
    list: (query?: object) => ['services', 'list', query] as const,
    detail: (id: string) => ['services', 'detail', id] as const,
    visibleRoles: (serviceId: string) => ['services', 'roles', serviceId] as const,
  },
} as const;
