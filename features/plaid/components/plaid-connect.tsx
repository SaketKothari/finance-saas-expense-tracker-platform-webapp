'use client';

import { useState } from 'react';
import { useMount } from 'react-use';
import { usePlaidLink } from 'react-plaid-link';

import { useCreateLinkToken } from '@/features/plaid/api/use-create-link-token';
import { useExchangePublicToken } from '@/features/plaid/api/use-exchange-public-token';

import { Button } from '@/components/ui/button';

export const PlaidConnect = () => {
  const [token, setToken] = useState<string | null>(null);

  const createLinkToken = useCreateLinkToken();
  const exchangePublicToken = useExchangePublicToken();

  useMount(() => {
    createLinkToken.mutate(undefined, {
      onSuccess: ({ data }) => {
        setToken(data);
      },
    });
  });

  const plaid = usePlaidLink({
    token: token,
    onSuccess: (publicToken) => {
      exchangePublicToken.mutate({
        publicToken,
      });
    },
    env: 'sandbox',
  });

  const onClick = () => {
    plaid.open();
  };

  const isDisabled = !plaid.ready || exchangePublicToken.isPending;

  return (
    <Button onClick={onClick} disabled={isDisabled} size="sm" variant="ghost">
      Connect
    </Button>
  );
};
