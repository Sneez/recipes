/**
 * use-auth.ts
 *
 * All authentication-related hooks. Wraps Clerk hooks and exposes
 * the current user profile from our own DB via the API.
 */
import { useAuth, useUser } from '@clerk/clerk-react';
import type { UserDto } from '@recipes/db/zod';
import { useQuery } from '@tanstack/react-query';

import { useApi } from '@/lib/api-context';

// ── Query keys ────────────────────────────────────────────────────────────────

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

// ── Return type ───────────────────────────────────────────────────────────────

type ClerkUser = ReturnType<typeof useUser>['user'];

interface CurrentUser {
  clerkUser: ClerkUser;
  profile: UserDto | undefined;
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  isLoadingProfile: boolean;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useCurrentUser(): CurrentUser {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const api = useApi();

  const profileQuery = useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      // Clerk marks isSignedIn=true slightly before the session token is
      // actually available. Check for a real token before hitting the API
      // to avoid a guaranteed 401 on the first render.
      const token = await getToken();
      if (!token) throw new Error('NO_TOKEN');

      const res = await api.users.getMe();
      if (res.status !== 200) {
        throw new Error(
          'message' in res.body ? res.body.message : 'Failed to load profile',
        );
      }
      return res.body;
    },
    enabled: isLoaded && isSignedIn === true,
    retry: (failureCount, error) => {
      // Don't retry missing-token errors — the query will re-run automatically
      // once the token arrives because getToken's promise resolves and React
      // re-renders with a fresh isLoaded state.
      if (error instanceof Error && error.message === 'NO_TOKEN') return false;
      return failureCount < 2;
    },
  });

  return {
    clerkUser,
    profile: profileQuery.data,
    isLoaded,
    isSignedIn,
    isLoadingProfile: profileQuery.isLoading,
  };
}

// Re-export types from @recipes/db/zod so callers don't need to import from two places
export type { UserDto } from '@recipes/db/zod';
