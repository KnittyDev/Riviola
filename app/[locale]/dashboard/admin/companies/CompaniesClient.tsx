"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";

interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  country: string | null;
  balance: number;
  currency: string;
  created_at: string;
}

export function CompaniesClient({ initialCompanies }: { initialCompanies: Company[] }) {
  const commonT = useTranslations("Sidebar");
  const locale = useLocale();
  const [companies] = useState(initialCompanies);

  const getCurrencySymbol = (code: string) => {
    switch (code) {
      case "EUR": return "€";
      case "USD": return "$";
      case "TRY": return "₺";
      case "GBP": return "£";
      default: return code;
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{commonT("companies")}</h1>
        <p className="text-gray-500 font-medium font-inter">Monitoring all companies registered on the Riviola platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 hover:shadow-black/10 transition-all group relative overflow-hidden flex flex-col">
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="size-16 rounded-2xl bg-[#134e4a]/5 flex items-center justify-center overflow-hidden border border-[#134e4a]/10">
                {company.logo_url ? (
                  <Image
                    src={company.logo_url}
                    alt={company.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <span className="text-[#134e4a] text-2xl font-black">{company.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase tracking-widest border border-orange-100 shadow-sm">
                  {company.country || "GLOBAL"}
                </span>
                <span className="text-[9px] text-gray-300 mt-2 uppercase font-black tracking-tighter">REF: {company.id.slice(0, 8)}</span>
              </div>
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight group-hover:text-orange-600 transition-colors">
              {company.name}
            </h3>
            
            <div className="mt-auto pt-8 border-t border-gray-50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Treasury Balance</span>
                <div className="flex items-baseline gap-1.5">
                   <span className="text-3xl font-black text-[#134e4a] tabular-nums">
                     {company.balance.toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US', { minimumFractionDigits: 2 })}
                   </span>
                   <span className="text-xs font-black text-gray-300 uppercase tracking-widest">{company.currency}</span>
                </div>
              </div>
              <Link 
                href={`/dashboard/admin/companies/${company.id}`}
                className="size-14 rounded-2xl bg-gray-50 text-gray-400 hover:bg-[#134e4a] hover:text-white transition-all flex items-center justify-center shadow-sm border border-gray-100/50"
              >
                <i className="las la-angle-right text-xl" />
              </Link>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-[#134e4a]/[0.03] rounded-full -translate-y-1/2 translate-x-1/2 -z-0" />
          </div>
        ))}
        
        <Link href="/dashboard/admin/companies/new" className="bg-gray-50 p-8 rounded-[3rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 hover:bg-white hover:border-orange-600 transition-all group shadow-inner">
          <div className="size-16 rounded-2xl bg-gray-100 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
            <i className="las la-plus text-3xl" />
          </div>
          <span className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em] group-hover:text-orange-600 transition-colors">Register New Company</span>
        </Link>
      </div>
    </div>
  );
}
