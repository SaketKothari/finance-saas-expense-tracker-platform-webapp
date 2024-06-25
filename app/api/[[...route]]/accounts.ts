import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { createId } from '@paralleldrive/cuid2';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { zValidator } from '@hono/zod-validator';

import { db } from '@/db/drizzle';
import { accounts, insertAccountSchema } from '@/db/schema';

// chain the handlers so that the types are always inferred
const app = new Hono()
  .get('/', clerkMiddleware(), async (c) => {
    // Get authenticated user
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // select will return data which will be array
    const data = await db
      .select({
        id: accounts.id,
        name: accounts.name,
      })
      .from(accounts)
      .where(eq(accounts.userId, auth.userId));

    return c.json({ data });
  })
  .post(
    '/',
    clerkMiddleware(),
    // validate using zod what kind of json this POST request accepts by adding a validator zValidator
    zValidator(
      'json',
      insertAccountSchema.pick({
        name: true,
      })
    ),
    async (c) => {
      const auth = getAuth(c);
      // Inside the values we get the name
      const values = c.req.valid('json');

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      // insert will not return anything that's why we chain it with .returning()
      const [data] = await db
        .insert(accounts)
        .values({
          id: createId(),
          userId: auth.userId,
          ...values,
        })
        .returning();

      return c.json({ data });
    }
  );

export default app;
