import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type Payload = {
  name: string;
  threshold: number;
  period: string;
  categoryId?: string | null;
  userId: string;
};

export const useCreateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, Payload>({
    mutationFn: async (json) => {
      const res = await fetch('/api/spending-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });
      if (!res.ok) throw new Error('Failed to create alert');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Spending alert created');
      queryClient.invalidateQueries({ queryKey: ['spending-alerts'] });
    },
    onError: () => toast.error('Failed to create alert'),
  });
};
