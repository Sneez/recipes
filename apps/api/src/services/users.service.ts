import { notFound, unauthorized } from '@api/lib/errors';
import { ok } from '@api/lib/ts-rest-helpers';
import { clerkClient } from '@api/plugins/clerk';
import { db, users } from '@recipes/db';
import { eq } from 'drizzle-orm';
import type { FastifyBaseLogger } from 'fastify';

export async function getMe(userId: string | null, log: FastifyBaseLogger) {
  if (!userId) return unauthorized();

  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  // First sign-in — fetch from Clerk and upsert into our DB
  if (!user) {
    try {
      const clerkUser = await clerkClient.users.getUser(userId);
      const primaryEmail = clerkUser.emailAddresses.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      );
      if (!primaryEmail) return notFound('User');

      [user] = await db
        .insert(users)
        .values({
          id: userId,
          email: primaryEmail.emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: primaryEmail.emailAddress,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl,
            updatedAt: new Date(),
          },
        })
        .returning();
    } catch (err) {
      log.error({ err }, 'Failed to sync user from Clerk');
      return notFound('User');
    }
  }

  if (!user) return notFound('User');
  return ok(user);
}

export async function updateMe(
  userId: string | null,
  body: { firstName?: string | null; lastName?: string | null },
) {
  if (!userId) return unauthorized();

  const [updated] = await db
    .update(users)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  if (!updated) return notFound('User');
  return ok(updated);
}
