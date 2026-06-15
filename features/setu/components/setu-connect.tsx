'use client';

import { useCreateConsent } from '@/features/setu/api/use-create-consent';
import { Button } from '@/components/ui/button';

export const SetuConnect = () => {
  const createConsent = useCreateConsent();

  const onClick = () => {
    createConsent.mutate(undefined, {
      onSuccess: ({ data }) => {
        // Redirect user to Setu's consent approval page
        window.location.href = data.url;
      },
    });
  };

  return (
    <Button
      onClick={onClick}
      disabled={createConsent.isPending}
      size="sm"
      variant="ghost"
    >
      {createConsent.isPending ? 'Connecting...' : 'Connect'}
    </Button>
  );
};
