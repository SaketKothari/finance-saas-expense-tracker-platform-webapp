import { toast } from 'sonner';

import { InferRequestType, InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from '@/lib/hono';

type ResponseType = InferResponseType<
  (typeof client.api.plaid)['exchange-public-token']['$post'],
  200
>;

type RequestType = InferRequestType<
  (typeof client.api.plaid)['exchange-public-token']['$post']
>['json'];

export const useExchangePublicToken = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.plaid['exchange-public-token'].$post({
        json,
      });

      if (!response.ok) {
        throw Error('Failed to exchange public token');
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Public token exchanged');
      // TODO: Reinvalidate the following
      // connected-bank
      // summary
      // transactions
      // accounts
      // categories
    },
    onError: () => {
      toast.error('Failed to exchange public token');
    },
  });

  return mutation;
};
