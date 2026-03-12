import React, { createContext, useContext } from 'react';

import { useAuth } from '@clerk/clerk-react';

import { type ApiClient, apiClient, setTokenGetter } from '@/lib/api-client';

const ApiContext = createContext<ApiClient>(apiClient);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  // Update the module-level token getter on every render so it always
  // reflects the current Clerk session — no refs or memos needed.
  setTokenGetter(getToken);

  return (
    <ApiContext.Provider value={apiClient}>{children}</ApiContext.Provider>
  );
}

/**
 * useApi() — the single entry-point for every hook that needs to call the API.
 * Never call apiClient directly in hooks or components.
 */
export function useApi(): ApiClient {
  return useContext(ApiContext);
}
