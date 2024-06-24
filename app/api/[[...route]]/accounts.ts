import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';

import { db } from '@/db/drizzle';
import { accounts } from '@/db/schema';

// chain the handlers so that the types are always inferred
const app = new Hono().get('/', clerkMiddleware(), async (c) => {
  // Get authenticated user
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const data = await db
    .select({
      id: accounts.id,
      name: accounts.name,
    })
    .from(accounts)
    .where(eq(accounts.userId, auth.userId));

  return c.json({ data });
});

export default app;
