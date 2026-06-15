'use client';

import { useDeleteSetuBank } from '@/features/setu/api/use-delete-setu-bank';
import { Button } from '@/components/ui/button';

export const SetuDisconnect = () => {
  const deleteBank = useDeleteSetuBank();

  return (
    <Button
      onClick={() => deleteBank.mutate()}
      disabled={deleteBank.isPending}
      size="sm"
      variant="destructive"
    >
      Disconnect
    </Button>
  );
};
