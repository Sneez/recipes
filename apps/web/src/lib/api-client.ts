import { contract } from '@recipes/contracts';
import { initClient } from '@ts-rest/core';

const API_URL = (import.meta.env['VITE_API_URL'] as string | undefined) ?? '';

/**
 * Creates a ts-rest client bound to the given token getter.
 * Consumed via ApiContext — never use this directly in components.
 */
export function createApiClient(getToken: () => Promise<string | null>) {
  return initClient(contract, {
    baseUrl: API_URL,
    baseHeaders: {},
    api: async ({ path, method, headers, body }) => {
      const token = await getToken();
      const authHeaders: Record<string, string> = token
        ? { Authorization: `Bearer ${token}` }
        : {};

      const response = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
          ...authHeaders,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      const responseBody = await response.json();
      return {
        status: response.status,
        body: responseBody,
        headers: response.headers,
      };
    },
  });
}

export type ApiClient = ReturnType<typeof createApiClient>;
