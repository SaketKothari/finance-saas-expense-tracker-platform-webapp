'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { convertAmountFromMilliUnits } from '@/lib/utils';

type Transaction = {
  id: string;
  date: Date | string;
  payee: string;
  amount: number;
  category?: string | null;
  account: string;
  notes?: string | null;
};

type Props = {
  transactions: Transaction[];
};

export const ExportButton = ({ transactions }: Props) => {
  const [isExporting, setIsExporting] = useState(false);

  const rows = transactions.map((t) => ({
    Date: format(new Date(t.date), 'dd/MM/yyyy'),
    Payee: t.payee,
    Amount: convertAmountFromMilliUnits(t.amount).toFixed(2),
    Category: t.category ?? '-',
    Account: t.account,
    Notes: t.notes ?? '-',
  }));

  const exportExcel = () => {
    setIsExporting(true);
    try {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

      // Column widths
      ws['!cols'] = [
        { wch: 12 },
        { wch: 28 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 30 },
      ];

      XLSX.writeFile(wb, `transactions_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape' });

      doc.setFontSize(16);
      doc.text('Transaction History', 14, 16);
      doc.setFontSize(10);
      doc.text(`Exported on ${format(new Date(), 'dd MMM yyyy')}`, 14, 23);

      autoTable(doc, {
        startY: 28,
        head: [['Date', 'Payee', 'Amount (₹)', 'Category', 'Account', 'Notes']],
        body: rows.map((r) => [
          r.Date,
          r.Payee,
          r.Amount,
          r.Category,
          r.Account,
          r.Notes,
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
      });

      doc.save(`transactions_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" disabled={isExporting || transactions.length === 0}>
          <Download className="size-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportExcel}>
          Export as Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportPDF}>
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
