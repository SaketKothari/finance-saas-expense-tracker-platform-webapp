import { z } from 'zod';
import { Hono } from 'hono';
import { createId } from '@paralleldrive/cuid2';
import { and, eq, inArray } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';

import { db } from '@/db/drizzle';
import {
  transactionSplits,
  transactions,
  accounts,
  insertTransactionSplitSchema,
} from '@/db/schema';

const app = new Hono()
  // Get splits for a transaction
  .get(
    '/:transactionId',
    clerkMiddleware(),
    zValidator('param', z.object({ transactionId: z.string() })),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) return c.json({ error: 'Unauthorized' }, 401);

      const { transactionId } = c.req.valid('param');

      // Verify the transaction belongs to this user
      const [tx] = await db
        .select({ id: transactions.id })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
          and(eq(transactions.id, transactionId), eq(accounts.userId, auth.userId))
        );

      if (!tx) return c.json({ error: 'Not found' }, 404);

      const data = await db
        .select()
        .from(transactionSplits)
        .where(eq(transactionSplits.transactionId, transactionId));

      return c.json({ data });
    }
  )

  // Replace all splits for a transaction (upsert pattern)
  .post(
    '/:transactionId',
    clerkMiddleware(),
    zValidator('param', z.object({ transactionId: z.string() })),
    zValidator(
      'json',
      z.array(
        insertTransactionSplitSchema.omit({ id: true, transactionId: true })
      )
    ),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) return c.json({ error: 'Unauthorized' }, 401);

      const { transactionId } = c.req.valid('param');
      const splits = c.req.valid('json');

      // Verify ownership
      const [tx] = await db
        .select({ id: transactions.id })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
          and(eq(transactions.id, transactionId), eq(accounts.userId, auth.userId))
        );

      if (!tx) return c.json({ error: 'Not found' }, 404);

      // Delete existing splits and replace
      await db
        .delete(transactionSplits)
        .where(eq(transactionSplits.transactionId, transactionId));

      if (splits.length === 0) {
        return c.json({ data: [] });
      }

      const data = await db
        .insert(transactionSplits)
        .values(
          splits.map((s) => ({ id: createId(), transactionId, ...s }))
        )
        .returning();

      return c.json({ data });
    }
  );

export default app;
