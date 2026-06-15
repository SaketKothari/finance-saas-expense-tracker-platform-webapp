import { useQuery } from '@tanstack/react-query';

type Alert = {
  id: string;
  name: string;
  threshold: number;
  period: string;
  isActive: boolean;
  categoryId: string | null;
  userId: string;
};

export const useGetAlerts = () =>
  useQuery<Alert[]>({
    queryKey: ['spending-alerts'],
    queryFn: async () => {
      const res = await fetch('/api/spending-alerts');
      if (!res.ok) throw new Error('Failed to fetch alerts');
      const json = await res.json();
      return json.data;
    },
  });
