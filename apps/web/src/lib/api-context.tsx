import React, { createContext, useContext, useMemo } from 'react';

import { useAuth } from '@clerk/clerk-react';

import { type ApiClient, createApiClient } from '@/lib/api-client';

const ApiContext = createContext<ApiClient | null>(null);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  const client = useMemo(
    () => createApiClient(() => getToken()),
    // getToken identity is stable per Clerk session
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return <ApiContext.Provider value={client}>{children}</ApiContext.Provider>;
}

/**
 * useApi() — the single entry-point for every hook that needs to call the API.
 * Never call createApiClient() directly in hooks or components.
 */
export function useApi(): ApiClient {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApi must be used inside <ApiProvider>');
  return ctx;
}
