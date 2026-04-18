"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useTransition, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
// @ts-ignore - react-world-flags doesn't have types but it's safe to use
import Flag from 'react-world-flags';

const LANGUAGES = {
  en: { name: 'English', code: 'GB', label: 'EN' },
  tr: { name: 'Türkçe', code: 'TR', label: 'TR' },
  sr: { name: 'Srpski', code: 'RS', label: 'SR' },
  sq: { name: 'Shqip', code: 'AL', label: 'SQ' },
  pl: { name: 'Polski', code: 'PL', label: 'PL' },
};

export function LocaleSwitcher({ isMobile = false }: { isMobile?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll Lock when modal is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isOpen]);

  // Close dropdown when clicking outside for the area testa
  useEffect(() => {
    if (isMobile) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  function onSelectChange(nextLocale: string) {
    if (nextLocale === locale) {
      setIsOpen(false);
      return;
    }
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
    setIsOpen(false);
  }

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLang = LANGUAGES[locale as keyof typeof LANGUAGES] || LANGUAGES.en;

  const mobileModal = isMobile && isOpen && mounted ? createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={() => setIsOpen(false)}
      />
      <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black text-[#134e4a] tracking-tight">Select Language</h3>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <i className="las la-times text-xl" />
          </button>
        </div>
        <div className="grid gap-3">
          {Object.entries(LANGUAGES).map(([key, lang]) => (
            <button
              key={key}
              onClick={() => onSelectChange(key)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                locale === key 
                  ? 'border-[#134e4a] bg-[#134e4a]/5' 
                  : 'border-gray-50 bg-gray-50 hover:border-gray-200 active:scale-95'
              }`}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white shadow-sm shrink-0">
                <Flag code={lang.code} className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <p className={`text-[15px] font-black ${locale === key ? 'text-[#134e4a]' : 'text-gray-900'}`}>
                  {lang.name}
                </p>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{lang.label}</p>
              </div>
              {locale === key && (
                <div className="ml-auto w-6 h-6 rounded-full bg-[#134e4a] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-100 bg-white/50 backdrop-blur-sm hover:border-[#134e4a]/20 hover:bg-white transition-all duration-300 shadow-sm ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
      >
        <div className="w-5 h-5 rounded-full overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
          <Flag code={currentLang.code} className="w-full h-full object-cover" />
        </div>
        <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest">{currentLang.label}</span>
        <svg
          className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#134e4a]' : 'group-hover:text-gray-600'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Desktop Dropdown */}
      {!isMobile && isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white/95 backdrop-blur-md border border-gray-100 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
          <div className="p-1.5">
            {Object.entries(LANGUAGES).map(([key, lang]) => (
              <button
                key={key}
                onClick={() => onSelectChange(key)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 ${locale === key
                    ? 'bg-[#134e4a]/5 text-[#134e4a]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 group/item'
                  }`}
              >
                <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
                  <Flag code={lang.code} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className={`text-[13px] font-bold ${locale === key ? 'text-[#134e4a]' : 'text-gray-700'}`}>
                    {lang.name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    {lang.label}
                  </span>
                </div>
                {locale === key && (
                  <div className="ml-auto">
                    <svg className="w-4 h-4 text-[#134e4a]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Modal (via Portal) */}
      {mobileModal}
    </div>
  );
}
