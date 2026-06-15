'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

import { useCheckAlerts } from '@/features/spending-alerts/api/use-check-alerts';
import { convertAmountFromMilliUnits } from '@/lib/utils';

export const SpendingAlertsBanner = () => {
  const { data: triggered } = useCheckAlerts();

  useEffect(() => {
    if (!triggered?.length) return;
    triggered.forEach((alert) => {
      toast.warning(
        `Alert: "${alert.name}" — spent ₹${convertAmountFromMilliUnits(alert.spent).toFixed(0)} of ₹${convertAmountFromMilliUnits(alert.threshold).toFixed(0)} limit`,
        { duration: 8000, icon: <AlertTriangle className="size-4" /> }
      );
    });
  }, [triggered?.length]); // fire once per session load when new alerts appear

  return null;
};
