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
  const api = useApi();

  const profileQuery = useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const res = await api.users.getMe();
      if (res.status !== 200) {
        throw new Error(
          'message' in res.body ? res.body.message : 'Failed to load profile',
        );
      }
      return res.body;
    },
    enabled: isLoaded && isSignedIn === true,
    retry: 1,
  });

  return {
    clerkUser,
    profile: profileQuery.data,
    isLoaded,
    isSignedIn,
    isLoadingProfile: profileQuery.isLoading,
  };
}

/** Lightweight hook for when you only need the current user's Clerk ID. */
export function useCurrentUserId(): { userId: string | null } {
  const { userId } = useAuth();
  return { userId: userId ?? null };
}

// Re-export types from @recipes/db/zod so callers don't need to import from two places
export type { UserDto } from '@recipes/db/zod';
