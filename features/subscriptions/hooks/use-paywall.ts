import { useGetSubscription } from '@/features/subscriptions/api/use-get-subscription';
import { useSubscriptionModal } from '@/features/subscriptions/hooks/use-subscription-modal';

export const usePaywall = () => {
  const subscriptionModal = useSubscriptionModal();
  const { data: subscription, isLoading: isLoadingSubscription } =
    useGetSubscription();

  // Check if the subscription is either non-existent or has an 'expired' status, setting shouldBlock to true if either condition is met.
  const shouldBlock = !subscription || subscription.status === 'expired';

  return {
    isLoading: isLoadingSubscription,
    shouldBlock,
    triggerPaywall: () => {
      subscriptionModal.onOpen();
    },
  };
};
