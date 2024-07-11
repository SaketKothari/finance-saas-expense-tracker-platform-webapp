import crypto from 'crypto';
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { createCheckout, getSubscription } from '@lemonsqueezy/lemonsqueezy.js';

import { db } from '@/db/drizzle';
import { setupLemon } from '@/lib/ls';
import { subscriptions } from '@/db/schema';

setupLemon();

const app = new Hono()
  .get('/current', clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, auth.userId));

    return c.json({ data: subscription || null });
  })
  .post('/checkout', clerkMiddleware(), async (c) => {
    const auth = getAuth(c);

    if (!auth?.userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const [existing] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, auth.userId));

    if (existing?.subscriptionId) {
      const subscription = await getSubscription(existing.subscriptionId);
      const portalUrl = subscription.data?.data.attributes.urls.customer_portal;

      if (!portalUrl) {
        return c.json({ error: 'Internal error' }, 500);
      }

      return c.json({ data: portalUrl });
    }

    const checkout = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID!,
      process.env.LEMONSQUEEZY_PRODUCT_ID!,
      {
        checkoutData: {
          custom: {
            user_id: auth.userId,
          },
        },
        productOptions: {
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL!}/`,
        },
      }
    );

    const checkoutUrl = checkout.data?.data.attributes.url;

    if (!checkoutUrl) {
      return c.json({ error: 'Internal error' }, 500);
    }

    return c.json({ data: checkoutUrl });
  })
  // this webhook endpoint doesn't require middleware because it's publicly available
  .post('/webhook', async (c) => {
    // use signature to confirm it's lemon squeezy
    const text = await c.req.text();

    const hmac = crypto.createHmac(
      'sha256',
      process.env.LEMONSQUEEZY_WEBHOOK_SECRET!
    );
    const digest = Buffer.from(hmac.update(text).digest('hex'), 'utf8');
    const signature = Buffer.from(
      c.req.header('x-signature') as string,
      'utf8'
    );

    if (!crypto.timingSafeEqual(digest, signature)) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const payload = JSON.parse(text);
    const event = payload.meta.event_name;

    const subscriptionId = payload.data.id;
    const userId = payload.meta.custom_data.user_id;
    const status = payload.data.attributes.status;

    if (event === 'subscription_created') {
      await db.insert(subscriptions).values({
        id: createId(),
        subscriptionId,
        userId,
        status,
      });
    }

    if (event === 'subscription_updated') {
      await db
        .update(subscriptions)
        .set({
          status,
        })
        .where(eq(subscriptions.subscriptionId, subscriptionId));
    }

    return c.json({},200)
  });

export default app;
