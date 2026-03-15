/**
 * Response helpers for ts-rest route handlers.
 * Uses `as never` to satisfy ts-rest's strict union return types.
 */
export const ok = <T>(body: T) => ({ status: 200 as const, body }) as never;
export const created = <T>(body: T) =>
  ({ status: 201 as const, body }) as never;
export const noContent = () => ({ status: 204 as const, body: null }) as never;
