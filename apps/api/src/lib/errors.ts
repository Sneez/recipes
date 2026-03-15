/**
 * Typed error response helpers for ts-rest route handlers.
 *
 * Each function returns a plain object with a `status` literal and a
 * `body` matching the `errorSchema` shape, so TypeScript can narrow the
 * return type correctly with ts-rest's strictStatusCodes.
 *
 * Usage:
 *   return unauthorized();
 *   return notFound("Recipe");
 *   return forbidden();
 *   return unprocessable("Failed to insert row");
 */

export const unauthorized = () => ({
  status: 401 as const,
  body: { message: 'Unauthorized' },
});

export const forbidden = () => ({
  status: 403 as const,
  body: { message: 'Forbidden' },
});

export const notFound = (resource = 'Resource') => ({
  status: 404 as const,
  body: { message: `${resource} not found` },
});

export const unprocessable = (message = 'Unprocessable entity') => ({
  status: 422 as const,
  body: { message },
});
