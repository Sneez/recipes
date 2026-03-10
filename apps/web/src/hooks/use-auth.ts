/**
 * use-auth.ts
 *
 * All authentication-related hooks. Wraps Clerk hooks and exposes
 * the current user profile from our own DB via the API.
 */
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApi } from "@/lib/api-context";

// ── Query keys ────────────────────────────────────────────────────────────────

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

/**
 * Returns the current Clerk user + our DB user profile.
 * Use this instead of useUser() directly in most cases.
 */
export function useCurrentUser() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const api = useApi();

  const profileQuery = useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const res = await api.users.getMe();
      if (res.status !== 200) {
        throw new Error(
          "message" in res.body ? res.body.message : "Failed to load profile",
        );
      }
      return res.body;
    },
    enabled: isSignedIn === true,
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
export type { UserDto } from "@recipes/db/zod";
