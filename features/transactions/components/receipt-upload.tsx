'use client';

import { useState } from 'react';
import { ImagePlus, X, ExternalLink } from 'lucide-react';
import { useUploadThing } from '@/lib/uploadthing';
import { Button } from '@/components/ui/button';

type Props = {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
};

export const ReceiptUpload = ({ value, onChange, disabled }: Props) => {
  const [uploading, setUploading] = useState(false);

  const { startUpload } = useUploadThing('receiptUploader', {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.ufsUrl) {
        onChange(res[0].ufsUrl);
      }
      setUploading(false);
    },
    onUploadError: () => {
      setUploading(false);
    },
  });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await startUpload([file]);
  };

  if (value) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md bg-slate-50">
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-blue-600 hover:underline flex-1 truncate"
        >
          <ExternalLink className="size-3 shrink-0" />
          View receipt
        </a>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(null)}
          disabled={disabled}
          className="h-6 w-6 p-0"
        >
          <X className="size-3" />
        </Button>
      </div>
    );
  }

  return (
    <label
      className={`flex items-center gap-2 p-2 border border-dashed rounded-md cursor-pointer hover:bg-slate-50 transition-colors ${
        disabled || uploading ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <ImagePlus className="size-4 text-slate-400" />
      <span className="text-sm text-slate-500">
        {uploading ? 'Uploading...' : 'Attach receipt (optional)'}
      </span>
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFile}
        disabled={disabled || uploading}
      />
    </label>
  );
};
