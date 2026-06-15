import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

export const useCreateConsent = () => {
  return useMutation<{ data: { url: string; consentHandle: string } }, Error>({
    mutationFn: async () => {
      const response = await fetch('/api/setu/create-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to create Setu consent');
      return response.json();
    },
    onError: () => {
      toast.error('Failed to initiate Indian bank connection');
    },
  });
};
