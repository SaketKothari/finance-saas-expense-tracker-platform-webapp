'use client';

import { PlaidConnect } from '@/features/plaid/components/plaid-connect';
import { PlaidDisconnect } from '@/features/plaid/components/plaid-disconnect';
import { useGetConnectedBank } from '@/features/plaid/api/use-get-connected-bank';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SettingsCard = () => {
  const { data: connectedBank, isLoading: isLoadingConnectedBank } =
    useGetConnectedBank();

  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl line-clamp-1">Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Separator />
        <div className="flex flex-col gap-y-2 lg:flex-row items-center py-4">
          <p className="text-sm font-medium w-full lg:w-[16.5rem]">
            Bank account
          </p>
          <div className="w-full flex items-center justify-between">
            <div
              className={cn(
                'text-sm truncate flex items-center',
                !connectedBank && 'text-muted-foreground'
              )}
            >
              {connectedBank
                ? 'Bank account connected'
                : 'No bank account connected'}
            </div>
            {connectedBank ? <PlaidDisconnect /> : <PlaidConnect />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
