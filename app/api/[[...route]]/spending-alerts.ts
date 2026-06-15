import { z } from 'zod';
import { Hono } from 'hono';
import { createId } from '@paralleldrive/cuid2';
import { and, eq, gte, lte, sum } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';

import { db } from '@/db/drizzle';
import { spendingAlerts, transactions, accounts, insertSpendingAlertSchema } from '@/db/schema';

const app = new Hono()
  .get('/', clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ error: 'Unauthorized' }, 401);

    const data = await db
      .select()
      .from(spendingAlerts)
      .where(eq(spendingAlerts.userId, auth.userId));

    return c.json({ data });
  })

  .post(
    '/',
    clerkMiddleware(),
    zValidator('json', insertSpendingAlertSchema.omit({ id: true })),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) return c.json({ error: 'Unauthorized' }, 401);

      const values = c.req.valid('json');

      const [data] = await db
        .insert(spendingAlerts)
        .values({ id: createId(), ...values, userId: auth.userId })
        .returning();

      return c.json({ data });
    }
  )

  .patch(
    '/:id',
    clerkMiddleware(),
    zValidator('param', z.object({ id: z.string() })),
    zValidator('json', insertSpendingAlertSchema.omit({ id: true }).partial()),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) return c.json({ error: 'Unauthorized' }, 401);

      const { id } = c.req.valid('param');
      const values = c.req.valid('json');

      const [data] = await db
        .update(spendingAlerts)
        .set(values)
        .where(and(eq(spendingAlerts.id, id), eq(spendingAlerts.userId, auth.userId)))
        .returning();

      if (!data) return c.json({ error: 'Not found' }, 404);
      return c.json({ data });
    }
  )

  .delete(
    '/:id',
    clerkMiddleware(),
    zValidator('param', z.object({ id: z.string() })),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) return c.json({ error: 'Unauthorized' }, 401);

      const { id } = c.req.valid('param');

      const [data] = await db
        .delete(spendingAlerts)
        .where(and(eq(spendingAlerts.id, id), eq(spendingAlerts.userId, auth.userId)))
        .returning({ id: spendingAlerts.id });

      if (!data) return c.json({ error: 'Not found' }, 404);
      return c.json({ data });
    }
  )

  // Check which alerts are currently triggered for the authenticated user
  .get('/check', clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ error: 'Unauthorized' }, 401);

    const alerts = await db
      .select()
      .from(spendingAlerts)
      .where(and(eq(spendingAlerts.userId, auth.userId), eq(spendingAlerts.isActive, true)));

    const now = new Date();
    const triggered: { alertId: string; name: string; spent: number; threshold: number }[] = [];

    for (const alert of alerts) {
      const periodStart = alert.period === 'weekly' ? startOfWeek(now) : startOfMonth(now);
      const periodEnd = alert.period === 'weekly' ? endOfWeek(now) : endOfMonth(now);

      const [result] = await db
        .select({ total: sum(transactions.amount) })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(
          and(
            eq(accounts.userId, auth.userId),
            alert.categoryId ? eq(transactions.categoryId, alert.categoryId) : undefined,
            gte(transactions.date, periodStart),
            lte(transactions.date, periodEnd)
          )
        );

      // Only count expenses (negative amounts in milli-units)
      const totalSpent = Math.abs(
        Math.min(0, Number(result?.total ?? 0))
      );

      if (totalSpent >= alert.threshold) {
        triggered.push({
          alertId: alert.id,
          name: alert.name,
          spent: totalSpent,
          threshold: alert.threshold,
        });
      }
    }

    return c.json({ data: triggered });
  });

export default app;
