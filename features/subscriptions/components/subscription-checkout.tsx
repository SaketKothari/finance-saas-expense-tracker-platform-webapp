import { useCheckoutSubscription } from '@/features/subscriptions/api/use-checkout-subscription';

import { Button } from '@/components/ui/button';

export const SubscriptionCheckout = () => {
  const checkout = useCheckoutSubscription();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => checkout.mutate()}
      disabled={checkout.isPending}
    >
      Upgrade
    </Button>
  );
};
