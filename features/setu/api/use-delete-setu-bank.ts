import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeleteSetuBank = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error>({
    mutationFn: async () => {
      const res = await fetch('/api/setu/connected-bank', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to disconnect Indian bank');
    },
    onSuccess: () => {
      toast.success('Indian bank disconnected');
      queryClient.invalidateQueries({ queryKey: ['setu-connected-bank'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
    onError: () => {
      toast.error('Failed to disconnect Indian bank');
    },
  });
};
