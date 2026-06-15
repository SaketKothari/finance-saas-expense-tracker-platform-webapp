'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SetuCallbackContent = () => {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const consentHandle = params.get('consentHandle') ?? params.get('fi');
    const consentId = params.get('consentId');
    const consentStatus = params.get('status') ?? 'ACTIVE';

    if (!consentHandle) {
      setStatus('error');
      toast.error('Missing consent information from bank');
      setTimeout(() => router.replace('/settings'), 2000);
      return;
    }

    fetch('/api/setu/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consentHandle,
        consentId: consentId ?? undefined,
        status: consentStatus,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error();

        if (consentStatus === 'ACTIVE' && consentHandle) {
          // Now fetch the actual bank data
          await fetch('/api/setu/fetch-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ consentHandle }),
          });
        }

        setStatus('success');
        toast.success('Indian bank connected successfully!');
        setTimeout(() => router.replace('/settings'), 1500);
      })
      .catch(() => {
        setStatus('error');
        toast.error('Failed to complete bank connection');
        setTimeout(() => router.replace('/settings'), 2000);
      });
  }, [params, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      {status === 'processing' && (
        <>
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <p className="text-slate-600">Completing your bank connection...</p>
        </>
      )}
      {status === 'success' && (
        <p className="text-green-600 font-medium">Bank connected! Redirecting...</p>
      )}
      {status === 'error' && (
        <p className="text-red-600 font-medium">Connection failed. Redirecting...</p>
      )}
    </div>
  );
};

const SetuCallbackPage = () => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="size-8 animate-spin" /></div>}>
    <SetuCallbackContent />
  </Suspense>
);

export default SetuCallbackPage;
