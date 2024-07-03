'use client';

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';

import { useGetTransactions } from '@/features/transactions/api/use-get-transactions';
import { useNewTransaction } from '@/features/transactions/hooks/use-new-transaction';
import { useBulkDeleteTransactions } from '@/features/transactions/api/use-bulk-delete-transactions';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { columns } from './columns';
import { UploadButton } from './upload-button';

enum VARIANTS {
  LIST = 'LIST',
  IMPORT = 'IMPORT',
}

const INITIAL_IMPORT_RESULTS = {
  data: [],
  errors: [],
  meta: {},
};

const TransactionsPage = () => {
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);

  // TODO: check DOCS of react-papaparse
  const onUpload = (results: typeof INITIAL_IMPORT_RESULTS) => {
    setVariant(VARIANTS.IMPORT);
  };

  const deleteTransactions = useBulkDeleteTransactions();
  const newTransaction = useNewTransaction();
  const transactionsQuery = useGetTransactions();
  const transactions = transactionsQuery.data ?? [];

  const isDisabled =
    transactionsQuery.isLoading || deleteTransactions.isPending;

  if (transactionsQuery.isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
        <Card className="border-none drop-shadow-sm">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="h-[500px] w-full flex items-center justify-center">
              <Loader2 className="size-6 text-slate-300 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (variant === VARIANTS.IMPORT) {
    return (
      <>
        <div>This is a screen for import</div>
      </>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Transactions History
          </CardTitle>
          <div className="flex items-center gap-x-2">
            <Button onClick={newTransaction.onOpen} size="sm">
              <Plus className="size-4 mr-2" />
              Add new
            </Button>
            <UploadButton onUpload={onUpload} />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={transactions}
            filterKey="payee"
            onDelete={(row) => {
              const ids = row.map((r) => r.original.id);
              deleteTransactions.mutate({ ids });
            }}
            disabled={isDisabled}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;
