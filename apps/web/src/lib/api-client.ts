import { contract } from "@my-app/contracts";
import { initQueryClient } from "@ts-rest/react-query";

const API_URL = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "";

let getToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  getToken = fn;
}

export const apiClient = initQueryClient(contract, {
  baseUrl: API_URL,
  baseHeaders: {},
  api: async ({ path, method, headers, body }) => {
    const token = getToken ? await getToken() : null;
    const authHeaders: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
        ...authHeaders,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const responseBody = await response.json();
    return { status: response.status, body: responseBody, headers: response.headers };
  },
});
