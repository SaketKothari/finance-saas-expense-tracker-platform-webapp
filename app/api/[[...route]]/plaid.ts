import { Hono } from 'hono';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import {
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from 'plaid';

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

const app = new Hono().post(
  '/create-link-token',
  clerkMiddleware(),
  async (c) => {
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
  }
);

export default app;
