'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

import { useGetAlerts } from '@/features/spending-alerts/api/use-get-alerts';
import { useCreateAlert } from '@/features/spending-alerts/api/use-create-alert';
import { useDeleteAlert } from '@/features/spending-alerts/api/use-delete-alert';
import { useGetCategories } from '@/features/categories/api/use-get-categories';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { convertAmountFromMilliUnits } from '@/lib/utils';

const AlertRow = ({ alert }: { alert: { id: string; name: string; threshold: number; period: string } }) => {
  const deleteMutation = useDeleteAlert(alert.id);
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div>
        <p className="text-sm font-medium">{alert.name}</p>
        <p className="text-xs text-muted-foreground">
          ₹{convertAmountFromMilliUnits(alert.threshold).toLocaleString('en-IN')} / {alert.period}
        </p>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => deleteMutation.mutate()}
        disabled={deleteMutation.isPending}
        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
};

export const ManageAlerts = () => {
  const { user } = useUser();
  const { data: alerts = [], isLoading } = useGetAlerts();
  const { data: categories = [] } = useGetCategories();
  const createAlert = useCreateAlert();

  const [name, setName] = useState('');
  const [threshold, setThreshold] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [categoryId, setCategoryId] = useState<string>('');
  const [showForm, setShowForm] = useState(false);

  const onAdd = () => {
    if (!name || !threshold || !user?.id) return;
    createAlert.mutate(
      {
        name,
        threshold: Math.round(parseFloat(threshold) * 1000),
        period,
        categoryId: categoryId || null,
        userId: user.id,
      },
      {
        onSuccess: () => {
          setName('');
          setThreshold('');
          setCategoryId('');
          setShowForm(false);
        },
      }
    );
  };

  return (
    <div className="space-y-3">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading alerts...</p>
      ) : alerts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No spending alerts set.</p>
      ) : (
        <div>
          {alerts.map((a) => (
            <AlertRow key={a.id} alert={a} />
          ))}
        </div>
      )}

      {showForm ? (
        <div className="space-y-2 p-3 border rounded-md bg-slate-50">
          <Input
            placeholder="Alert name (e.g. Food budget)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Threshold (₹)"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="flex-1"
            />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="All categories (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button size="sm" onClick={onAdd} disabled={createAlert.isPending || !name || !threshold}>
              Save alert
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
          <Plus className="size-4 mr-2" />
          Add alert
        </Button>
      )}
    </div>
  );
};
