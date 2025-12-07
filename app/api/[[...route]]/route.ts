import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import type { NextRequest } from 'next/server';

import plaid from './plaid';
import summary from './summary';
import accounts from './accounts';
import categories from './categories';
import transactions from './transactions';
import subscriptions from './subscriptions';

export const runtime = 'nodejs';

const app = new Hono().basePath('/api');

const routes = app
  .route('/plaid', plaid)
  .route('/summary', summary)
  .route('/accounts', accounts)
  .route('/categories', categories)
  .route('/transactions', transactions)
  .route('/subscriptions', subscriptions);

const handler = handle(app) as any as (
  request: NextRequest
) => Response | Promise<Response>;
export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;

// To generate RPC types
export type AppType = typeof routes;
