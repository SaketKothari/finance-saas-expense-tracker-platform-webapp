import { useQuery } from '@tanstack/react-query';

export const useGetSetuBank = () => {
  return useQuery({
    queryKey: ['setu-connected-bank'],
    queryFn: async () => {
      const res = await fetch('/api/setu/connected-bank');
      if (!res.ok) throw new Error('Failed to fetch Setu bank');
      const json = await res.json();
      return json.data as { id: string; bankName: string | null; status: string } | null;
    },
  });
};
