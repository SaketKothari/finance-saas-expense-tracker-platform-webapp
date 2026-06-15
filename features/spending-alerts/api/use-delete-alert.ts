import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeleteAlert = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error>({
    mutationFn: async () => {
      const res = await fetch(`/api/spending-alerts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete alert');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Alert removed');
      queryClient.invalidateQueries({ queryKey: ['spending-alerts'] });
    },
    onError: () => toast.error('Failed to remove alert'),
  });
};
