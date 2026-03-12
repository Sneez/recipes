import { contract } from '@recipes/contracts';
import { initClient } from '@ts-rest/core';

const API_URL = (import.meta.env['VITE_API_URL'] as string | undefined) ?? '';

type TokenGetter = () => Promise<string | null>;
let _getToken: TokenGetter = () => Promise.resolve(null);

/** Called by ApiProvider on every render to keep the getter current. */
export function setTokenGetter(fn: TokenGetter) {
  _getToken = fn;
}

export const apiClient = initClient(contract, {
  baseUrl: API_URL,
  baseHeaders: {},
  api: async ({ path, method, headers, body }) => {
    const token = await _getToken();

    if (import.meta.env.DEV && !token) {
      console.warn('[api-client] No token for:', method, path);
    }

    const response = await fetch(path, {
      method,
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: body } : {}),
    });

    const responseBody = await response.json();
    return {
      status: response.status,
      body: responseBody,
      headers: response.headers,
    };
  },
});

export type ApiClient = typeof apiClient;
