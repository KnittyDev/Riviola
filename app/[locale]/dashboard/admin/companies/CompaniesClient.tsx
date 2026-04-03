"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";

interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  country: string | null;
  balance: number;
  created_at: string;
}

export function CompaniesClient({ initialCompanies }: { initialCompanies: Company[] }) {
  const commonT = useTranslations("Sidebar");
  const [companies] = useState(initialCompanies);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{commonT("companies")}</h1>
        <p className="text-gray-500 font-medium">Monitoring all companies registered on the Riviola platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-black/5 hover:shadow-black/10 transition-shadow group relative overflow-hidden flex flex-col">
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="size-16 rounded-2xl bg-[#134e4a]/10 flex items-center justify-center overflow-hidden border border-[#134e4a]/5">
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
                <span className="text-xs font-black text-[#134e4a] bg-[#134e4a]/10 px-3 py-1 rounded-full uppercase tracking-widest">
                  {company.country || "GLOBAL"}
                </span>
                <span className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-tight">ID: {company.id.slice(0, 8)}...</span>
              </div>
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight group-hover:text-orange-600 transition-colors">
              {company.name}
            </h3>
            
            <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Company Balance</span>
                <span className="text-2xl font-black text-gray-900 tabular-nums">${company.balance.toLocaleString()}</span>
              </div>
              <Link 
                href={`/dashboard/admin/companies/${company.id}`}
                className="size-12 rounded-2xl bg-gray-100 text-gray-500 hover:bg-[#134e4a] hover:text-white transition-all flex items-center justify-center shadow-lg hover:shadow-[#134e4a]/20"
              >
                <i className="las la-arrow-right text-xl" />
              </Link>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-[#134e4a]/5 rounded-full -translate-y-1/2 translate-x-1/2 -z-0" />
          </div>
        ))}
        
        <Link href="/dashboard/admin/companies/new" className="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 hover:bg-white hover:border-orange-600 transition-all group">
          <div className="size-16 rounded-2xl bg-gray-100 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
            <i className="las la-plus text-3xl" />
          </div>
          <span className="text-gray-500 font-bold uppercase text-xs tracking-widest group-hover:text-orange-600 transition-colors">Register New Company</span>
        </Link>
      </div>
    </div>
  );
}
