import { Hono } from 'hono';
import { handle } from 'hono/vercel';

import accounts from './accounts';

export const runtime = 'edge';

const app = new Hono().basePath('/api');

const routes = app.route('/accounts', accounts);

export const GET = handle(app);
export const POST = handle(app);

// To generate RPC types
export type AppType = typeof routes;
