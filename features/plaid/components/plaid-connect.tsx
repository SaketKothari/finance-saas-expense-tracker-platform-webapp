'use client';

import { useState } from 'react';
import { useMount } from 'react-use';

import { useCreateLinkToken } from '@/features/plaid/api/use-create-link-token';

import { Button } from '@/components/ui/button';

export const PlaidConnect = () => {
  const [token, setToken] = useState<string | null>(null);

  const createLinkToken = useCreateLinkToken();

  useMount(() => {
    createLinkToken.mutate(undefined, {
      onSuccess: ({ data }) => {
        setToken(data);
      },
    });
  });

  return (
    <Button disabled={!token} size="sm" variant="ghost">
      Connect
    </Button>
  );
};
