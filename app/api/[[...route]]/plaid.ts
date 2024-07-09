import { z } from 'zod';
import { Hono } from 'hono';
import { createId } from '@paralleldrive/cuid2';
import { zValidator } from '@hono/zod-validator';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import {
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from 'plaid';

import { db } from '@/db/drizzle';
import { connectedBanks } from '@/db/schema';

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_TOKEN,
      'PLAID-SECRET': process.env.PLAID_SECRET_TOKEN,
    },
  },
});

const client = new PlaidApi(configuration);

const app = new Hono()
  .post('/create-link-token', clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const token = await client.linkTokenCreate({
      user: {
        client_user_id: auth.userId,
      },
      client_name: 'Finance SASS Webapp',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    });

    return c.json({ data: token.data.link_token }, 200);
  })
  .post(
    '/exchange-public-token',
    clerkMiddleware(),
    // Modify our params so that it accepts public_token
    zValidator('json', z.object({ publicToken: z.string() })),
    async (c) => {
      const auth = getAuth(c);
      const { publicToken } = c.req.valid('json');

      if (!auth?.userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const exchange = await client.itemPublicTokenExchange({
        public_token: publicToken,
      });

      const [connectedBank] = await db
        .insert(connectedBanks)
        .values({
          id: createId(),
          userId: auth.userId,
          accessToken: exchange.data.access_token,
        })
        .returning();

      return c.json({ data: exchange.data.access_token }, 200);
    }
  );

export default app;
