import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
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
  });

export default app;
