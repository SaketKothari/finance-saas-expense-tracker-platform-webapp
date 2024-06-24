import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

// This hook is going to communicate with the accounts.ts GET endpoint
export const useGetAccounts = () => {
  const query = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await client.api.accounts.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch accounts');
      }

      const { data } = await response.json();
      return data;
    },
  });

  return query;
};
