import { Hono } from 'hono';

import { db } from '@/db/drizzle';
import { accounts } from '@/db/schema';

// chain the handlers so that the types are always inferred
const app = new Hono().get('/', async (c) => {
  const data = await db
    .select({
      id: accounts.id,
      name: accounts.name,
    })
    .from(accounts);

  return c.json({ data });
});

export default app;
