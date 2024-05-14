import { Hono } from 'hono';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { handle } from 'hono/vercel';

export const runtime = 'edge';

const app = new Hono().basePath('/api');

app.get('/hello', clerkMiddleware(), (c) => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({
      error: 'You are not logged in.',
    });
  }
  return c.json({
    message: 'Hello Next.js!',
    userId: auth.userId,
  });
});

export const GET = handle(app);
export const POST = handle(app);
