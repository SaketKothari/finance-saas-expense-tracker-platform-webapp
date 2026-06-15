import { useQuery } from '@tanstack/react-query';

type TriggeredAlert = {
  alertId: string;
  name: string;
  spent: number;
  threshold: number;
};

export const useCheckAlerts = () =>
  useQuery<TriggeredAlert[]>({
    queryKey: ['spending-alerts-check'],
    queryFn: async () => {
      const res = await fetch('/api/spending-alerts/check');
      if (!res.ok) throw new Error('Failed to check alerts');
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 5 * 60 * 1000, // re-check every 5 minutes
  });
