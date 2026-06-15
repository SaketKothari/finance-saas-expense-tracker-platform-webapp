import { z } from 'zod';
import { Trash, SplitSquareHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Select } from '@/components/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/date-picker';
import { convertAmountToMilliUnits, convertAmountFromMilliUnits } from '@/lib/utils';
import { AmountInput } from '@/components/amount-input';
import { ReceiptUpload } from './receipt-upload';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Select as UISelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { insertTransactionSchema } from '@/db/schema';

const TAX_CATEGORIES = [
  { value: '80C', label: '80C – Investments (PPF, ELSS, LIC)' },
  { value: '80D', label: '80D – Health Insurance' },
  { value: 'HRA', label: 'HRA – House Rent' },
  { value: 'business', label: 'Business Expense' },
  { value: 'other', label: 'Other Deductible' },
];

const splitSchema = z.object({
  categoryId: z.string().nullable().optional(),
  amount: z.string(),
  notes: z.string().nullable().optional(),
});

const formSchema = z.object({
  date: z.coerce.date(),
  accountId: z.string(),
  categoryId: z.string().nullable().optional(),
  payee: z.string(),
  amount: z.string(),
  notes: z.string().nullable().optional(),
  receiptUrl: z.string().nullable().optional(),
  upiRef: z.string().nullable().optional(),
  taxCategory: z.string().nullable().optional(),
  splits: z.array(splitSchema).optional(),
});

const apiSchema = insertTransactionSchema.omit({ id: true });

type FormValues = z.input<typeof formSchema>;
type ApiFormValues = z.input<typeof apiSchema>;

type Props = {
  id?: string;
  defaultValues?: FormValues;
  onSubmit: (values: ApiFormValues, splits?: { categoryId?: string | null; amount: number; notes?: string | null }[]) => void;
  onDelete?: () => void;
  disabled?: boolean;
  accountOptions: { label: string; value: string }[];
  categoryOptions: { label: string; value: string }[];
  onCreateAccount: (name: string) => void;
  onCreateCategory: (name: string) => void;
};

export const TransactionForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  accountOptions,
  categoryOptions,
  onCreateAccount,
  onCreateCategory,
}: Props) => {
  const [isSplitting, setIsSplitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues ?? {
      date: new Date(),
      accountId: '',
      categoryId: '',
      payee: '',
      amount: '',
      notes: '',
      receiptUrl: '',
      upiRef: '',
      taxCategory: '',
      splits: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'splits',
  });

  const handleSubmit = (values: FormValues) => {
    const amount = parseFloat(values.amount);
    const amountInMilliUnits = convertAmountToMilliUnits(amount);

    const splits = isSplitting && values.splits && values.splits.length > 0
      ? values.splits.map((s) => ({
          categoryId: s.categoryId ?? null,
          amount: convertAmountToMilliUnits(parseFloat(s.amount || '0')),
          notes: s.notes ?? null,
        }))
      : undefined;

    onSubmit(
      {
        ...values,
        amount: amountInMilliUnits,
        receiptUrl: values.receiptUrl || null,
        upiRef: values.upiRef || null,
        taxCategory: values.taxCategory || null,
      },
      splits
    );
  };

  const totalAmount = parseFloat(form.watch('amount') || '0');
  const splitTotal = (form.watch('splits') ?? []).reduce(
    (acc, s) => acc + parseFloat(s.amount || '0'),
    0
  );
  const splitDiff = Math.abs(totalAmount - splitTotal);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4"
      >
        <FormField
          name="date"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="accountId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <FormControl>
                <Select
                  placeholder="Select an account"
                  options={accountOptions}
                  onCreate={onCreateAccount}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {!isSplitting && (
          <FormField
            name="categoryId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Select
                    placeholder="Select a category"
                    options={categoryOptions}
                    onCreate={onCreateCategory}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={disabled}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <FormField
          name="payee"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payee</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder="Add a payee"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="amount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (₹)</FormLabel>
              <FormControl>
                <AmountInput {...field} disabled={disabled} placeholder="0.00" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* UPI Reference */}
        <FormField
          name="upiRef"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>UPI Reference (optional)</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder="e.g. UPI/123456789"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Tax Category */}
        <FormField
          name="taxCategory"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax Category (optional)</FormLabel>
              <UISelect
                value={field.value ?? ''}
                onValueChange={(val) => field.onChange(val === 'none' ? null : val)}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Not tax-deductible" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Not tax-deductible</SelectItem>
                  {TAX_CATEGORIES.map((tc) => (
                    <SelectItem key={tc.value} value={tc.value}>
                      {tc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </UISelect>
            </FormItem>
          )}
        />

        {/* Receipt Upload */}
        <FormField
          name="receiptUrl"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receipt</FormLabel>
              <FormControl>
                <ReceiptUpload
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="notes"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  disabled={disabled}
                  placeholder="Optional Notes"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Split toggle */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsSplitting(!isSplitting);
              if (!isSplitting && fields.length === 0) {
                append({ categoryId: '', amount: '', notes: '' });
                append({ categoryId: '', amount: '', notes: '' });
              }
            }}
            disabled={disabled}
          >
            <SplitSquareHorizontal className="size-4 mr-2" />
            {isSplitting ? 'Remove split' : 'Split transaction'}
          </Button>
          {isSplitting && splitDiff > 0.001 && (
            <Badge variant="destructive" className="text-xs">
              ₹{splitDiff.toFixed(2)} unallocated
            </Badge>
          )}
        </div>

        {/* Split rows */}
        {isSplitting && (
          <div className="space-y-2 p-3 border rounded-md bg-slate-50">
            <p className="text-xs text-slate-500 font-medium">Split across categories</p>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <FormField
                    name={`splits.${index}.categoryId`}
                    control={form.control}
                    render={({ field: f }) => (
                      <Select
                        placeholder="Category"
                        options={categoryOptions}
                        onCreate={onCreateCategory}
                        value={f.value}
                        onChange={f.onChange}
                        disabled={disabled}
                      />
                    )}
                  />
                </div>
                <div className="w-28">
                  <FormField
                    name={`splits.${index}.amount`}
                    control={form.control}
                    render={({ field: f }) => (
                      <AmountInput {...f} value={f.value ?? ''} disabled={disabled} placeholder="0.00" />
                    )}
                  />
                </div>
                {fields.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-9 w-9 p-0 mt-0.5"
                  >
                    <Trash className="size-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => append({ categoryId: '', amount: '', notes: '' })}
              disabled={disabled}
            >
              + Add split
            </Button>
          </div>
        )}

        <Button className="w-full" disabled={disabled}>
          {id ? 'Save changes' : 'Create transaction'}
        </Button>

        {!!id && (
          <Button
            type="button"
            disabled={disabled}
            onClick={() => onDelete?.()}
            className="w-full"
            variant="outline"
          >
            <Trash className="size-4 mr-2" />
            Delete transaction
          </Button>
        )}
      </form>
    </Form>
  );
};
