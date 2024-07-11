import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';

import { db } from '@/db/drizzle';
import { subscriptions } from '@/db/schema';

const app = new Hono().get('/current', clerkMiddleware(), async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, auth.userId));

  return c.json({ data: subscription || null });
});

export default app;
