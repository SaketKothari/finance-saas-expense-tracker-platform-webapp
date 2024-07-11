import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

export const setupLemon = () => {
  return lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });
};
