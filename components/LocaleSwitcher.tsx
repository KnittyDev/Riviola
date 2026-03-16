"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useTransition } from 'react';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onSelectChange(nextLocale: string) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onSelectChange('en')}
        disabled={isPending}
        className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
          locale === 'en' 
            ? 'bg-[#134e4a] text-white' 
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onSelectChange('tr')}
        disabled={isPending}
        className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
          locale === 'tr' 
            ? 'bg-[#134e4a] text-white' 
            : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        TR
      </button>
    </div>
  );
}
