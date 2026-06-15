'use client';

import { Loader2 } from 'lucide-react';

import { PlaidConnect } from '@/features/plaid/components/plaid-connect';
import { PlaidDisconnect } from '@/features/plaid/components/plaid-disconnect';
import { useGetConnectedBank } from '@/features/plaid/api/use-get-connected-bank';

import { SetuConnect } from '@/features/setu/components/setu-connect';
import { SetuDisconnect } from '@/features/setu/components/setu-disconnect';
import { useGetSetuBank } from '@/features/setu/api/use-get-setu-bank';

import { ManageAlerts } from '@/features/spending-alerts/components/manage-alerts';

import { useGetSubscription } from '@/features/subscriptions/api/use-get-subscription';
import { SubscriptionCheckout } from '@/features/subscriptions/components/subscription-checkout';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SettingsCard = () => {
  const { data: connectedBank, isLoading: isLoadingConnectedBank } = useGetConnectedBank();
  const { data: setuBank, isLoading: isLoadingSetuBank } = useGetSetuBank();
  const { data: subscription, isLoading: isLoadingSubscription } = useGetSubscription();

  if (isLoadingConnectedBank || isLoadingSubscription || isLoadingSetuBank) {
    return (
      <Card className="border-none drop-shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl line-clamp-1">
            <Skeleton className="h-6 w-24" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full flex items-center justify-center">
            <Loader2 className="size-6 text-slate-300 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none drop-shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl line-clamp-1">Settings</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Plaid — international banks */}
        <Separator />
        <div className="flex flex-col gap-y-2 lg:flex-row items-center py-4">
          <p className="text-sm font-medium w-full lg:w-[16.5rem]">
            Bank account (Global)
          </p>
          <div className="w-full flex items-center justify-between">
            <div className={cn('text-sm truncate flex items-center', !connectedBank && 'text-muted-foreground')}>
              {connectedBank ? 'Bank account connected' : 'No bank account connected'}
            </div>
            {connectedBank ? <PlaidDisconnect /> : <PlaidConnect />}
          </div>
        </div>

        {/* Setu — Indian banks */}
        <Separator />
        <div className="flex flex-col gap-y-2 lg:flex-row items-center py-4">
          <p className="text-sm font-medium w-full lg:w-[16.5rem]">
            Indian Bank (via Setu AA)
          </p>
          <div className="w-full flex items-center justify-between">
            <div className={cn('text-sm truncate flex items-center', !setuBank && 'text-muted-foreground')}>
              {setuBank
                ? `Connected${setuBank.bankName ? ` — ${setuBank.bankName}` : ''}`
                : 'No Indian bank connected'}
            </div>
            {setuBank ? <SetuDisconnect /> : <SetuConnect />}
          </div>
        </div>

        {/* Subscription */}
        <Separator />
        <div className="flex flex-col gap-y-2 lg:flex-row items-center py-4">
          <p className="text-sm font-medium w-full lg:w-[16.5rem]">
            Subscription
          </p>
          <div className="w-full flex items-center justify-between">
            <div className={cn('text-sm truncate flex items-center', !subscription && 'text-muted-foreground')}>
              {subscription ? `Subscription ${subscription.status}` : 'No subscription active'}
            </div>
            <SubscriptionCheckout />
          </div>
        </div>

        {/* Spending alerts */}
        <Separator />
        <div className="flex flex-col gap-y-2 py-4">
          <p className="text-sm font-medium">Spending Alerts</p>
          <p className="text-xs text-muted-foreground mb-2">
            Get notified when spending in a category crosses your set limit.
          </p>
          <ManageAlerts />
        </div>
      </CardContent>
    </Card>
  );
};
