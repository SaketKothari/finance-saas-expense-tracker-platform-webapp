import { z } from 'zod';
import { Hono } from 'hono';
import { createId } from '@paralleldrive/cuid2';
import { and, eq } from 'drizzle-orm';
import { zValidator } from '@hono/zod-validator';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';

import { db } from '@/db/drizzle';
import {
  accounts,
  categories,
  transactions,
  setuConnectedBanks,
} from '@/db/schema';
import { convertAmountToMilliUnits } from '@/lib/utils';

const SETU_BASE_URL =
  process.env.SETU_ENV === 'production'
    ? 'https://aa.setu.co'
    : 'https://aa-sandbox.setu.co';

function setuHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-client-id': process.env.SETU_CLIENT_ID ?? '',
    'x-client-secret': process.env.SETU_CLIENT_SECRET ?? '',
  };
}

const app = new Hono()
  .get('/connected-bank', clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ error: 'Unauthorized' }, 401);

    const [bank] = await db
      .select()
      .from(setuConnectedBanks)
      .where(
        and(
          eq(setuConnectedBanks.userId, auth.userId),
          eq(setuConnectedBanks.status, 'ACTIVE')
        )
      );

    return c.json({ data: bank || null });
  })

  // Step 1: create consent request → return redirect URL for user
  .post('/create-consent', clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ error: 'Unauthorized' }, 401);

    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/setu/callback`;

    const body = {
      Detail: {
        ConsentStart: new Date().toISOString(),
        ConsentExpiry: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(),
        ConsentMode: 'STORE',
        FetchType: 'PERIODIC',
        ConsentTypes: ['TRANSACTIONS', 'SUMMARY', 'PROFILE'],
        fiTypes: ['DEPOSIT', 'RECURRING_DEPOSIT'],
        DataConsumer: { id: process.env.SETU_CLIENT_ID ?? '' },
        Customer: { id: auth.userId },
        Purpose: {
          code: '101',
          refUri: 'https://api.rebit.org.in/aa/purpose/101.xml',
          text: 'Wealth management service',
          Category: { type: 'Personal Finance' },
        },
        FIDataRange: {
          from: new Date(
            Date.now() - 180 * 24 * 60 * 60 * 1000
          ).toISOString(),
          to: new Date().toISOString(),
        },
        DataLife: { unit: 'YEAR', value: 1 },
        Frequency: { unit: 'MONTHLY', value: 1 },
        DataFilter: [],
      },
      redirectUrl,
    };

    const res = await fetch(`${SETU_BASE_URL}/consent`, {
      method: 'POST',
      headers: setuHeaders(),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Setu consent error:', err);
      return c.json({ error: 'Failed to create Setu consent' }, 500);
    }

    const data = await res.json();
    const consentHandle: string = data.id;
    const consentUrl: string = data.url;

    // Store pending consent
    await db.insert(setuConnectedBanks).values({
      id: createId(),
      userId: auth.userId,
      consentHandle,
      status: 'PENDING',
    });

    return c.json({ data: { url: consentUrl, consentHandle } }, 200);
  })

  // Step 2: callback from Setu after user approves consent
  .post(
    '/callback',
    zValidator(
      'json',
      z.object({
        consentHandle: z.string(),
        consentId: z.string().optional(),
        status: z.string(),
      })
    ),
    async (c) => {
      const { consentHandle, consentId, status } = c.req.valid('json');

      if (status !== 'ACTIVE' || !consentId) {
        await db
          .delete(setuConnectedBanks)
          .where(eq(setuConnectedBanks.consentHandle, consentHandle));
        return c.json({ ok: true });
      }

      await db
        .update(setuConnectedBanks)
        .set({ consentId, status: 'ACTIVE' })
        .where(eq(setuConnectedBanks.consentHandle, consentHandle));

      return c.json({ ok: true });
    }
  )

  // Step 3: fetch FI data using approved consentId and sync to DB
  .post(
    '/fetch-data',
    clerkMiddleware(),
    zValidator('json', z.object({ consentHandle: z.string() })),
    async (c) => {
      const auth = getAuth(c);
      if (!auth?.userId) return c.json({ error: 'Unauthorized' }, 401);

      const { consentHandle } = c.req.valid('json');

      const [bank] = await db
        .select()
        .from(setuConnectedBanks)
        .where(
          and(
            eq(setuConnectedBanks.userId, auth.userId),
            eq(setuConnectedBanks.consentHandle, consentHandle)
          )
        );

      if (!bank?.consentId) {
        return c.json({ error: 'Consent not yet approved' }, 400);
      }

      // Create a data session
      const sessionRes = await fetch(`${SETU_BASE_URL}/data/session`, {
        method: 'POST',
        headers: setuHeaders(),
        body: JSON.stringify({
          consentId: bank.consentId,
          DataRange: {
            from: new Date(
              Date.now() - 180 * 24 * 60 * 60 * 1000
            ).toISOString(),
            to: new Date().toISOString(),
          },
          format: 'json',
          version: '1.1.2',
        }),
      });

      if (!sessionRes.ok) {
        return c.json({ error: 'Failed to create data session' }, 500);
      }

      const sessionData = await sessionRes.json();
      const sessionId: string = sessionData.id;

      // Poll for data (simple one-shot fetch; production should use webhooks)
      await new Promise((r) => setTimeout(r, 2000));

      const dataRes = await fetch(`${SETU_BASE_URL}/data/${sessionId}`, {
        headers: setuHeaders(),
      });

      if (!dataRes.ok) {
        return c.json({ error: 'Failed to fetch FI data' }, 500);
      }

      const fiData = await dataRes.json();
      const fiAccounts: any[] = fiData.FI ?? [];

      for (const fiAccount of fiAccounts) {
        const accountName =
          fiAccount.Profile?.Holders?.Holder?.[0]?.name ??
          fiAccount.maskedAccNumber ??
          'Indian Bank Account';

        const [newAccount] = await db
          .insert(accounts)
          .values({
            id: createId(),
            name: accountName,
            userId: auth.userId,
            currency: 'INR',
          })
          .onConflictDoNothing()
          .returning();

        if (!newAccount) continue;

        const txns: any[] = fiAccount.Transactions?.Transaction ?? [];

        const txnValues = txns.map((t: any) => ({
          id: createId(),
          amount: convertAmountToMilliUnits(
            t.type === 'DEBIT' ? -Math.abs(t.amount) : Math.abs(t.amount)
          ),
          payee: t.narration ?? t.reference ?? 'Unknown',
          notes: t.narration,
          date: new Date(t.valueDate ?? t.transactionTimestamp),
          accountId: newAccount.id,
          currency: 'INR',
          upiRef: t.reference?.startsWith('UPI') ? t.reference : null,
        }));

        if (txnValues.length > 0) {
          await db.insert(transactions).values(txnValues);
        }
      }

      return c.json({ ok: true }, 200);
    }
  )

  .delete('/connected-bank', clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) return c.json({ error: 'Unauthorized' }, 401);

    const [deleted] = await db
      .delete(setuConnectedBanks)
      .where(eq(setuConnectedBanks.userId, auth.userId))
      .returning({ id: setuConnectedBanks.id });

    if (!deleted) return c.json({ error: 'Not found' }, 404);

    return c.json({ data: deleted });
  });

export default app;
