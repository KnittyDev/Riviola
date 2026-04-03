"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { toast } from "@/lib/toast";
import { updateCompanyFinancials } from "./actions";
import Image from "next/image";

interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  country: string | null;
  balance: number;
  currency: string;
  bank_account_holder: string | null;
  iban: string | null;
  bank_name: string | null;
  created_at: string;
}

export function CompanyDetailClient({ company, locale }: { company: Company; locale: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    currency: company.currency || "EUR",
    bankAccountHolder: company.bank_account_holder || "",
    iban: company.iban || "",
    bankName: company.bank_name || ""
  });

  const currencies = [
    { code: "EUR", symbol: "€" },
    { code: "USD", symbol: "$" },
    { code: "TRY", symbol: "₺" },
    { code: "GBP", symbol: "£" }
  ];

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await updateCompanyFinancials(company.id, formData);

    if (res.error) {
       toast.error(res.error);
    } else {
       toast.success("Financial settings updated successfully");
       router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <Link 
             href="/dashboard/admin/companies" 
             className="size-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#134e4a] hover:border-[#134e4a]/20 transition-all shadow-sm group"
           >
             <i className="las la-arrow-left text-xl group-hover:-translate-x-1 transition-transform" />
           </Link>
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full uppercase tracking-widest">Administrative Panel</span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{company.name}</h1>
           </div>
        </div>
        
        <div className="bg-white px-8 py-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-8">
           <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Treasury Balance</span>
              <div className="flex items-baseline gap-2">
                 <span className="text-2xl font-black text-[#134e4a] tabular-nums">
                   {company.balance.toLocaleString(locale === "tr" ? "tr-TR" : "en-US", { minimumFractionDigits: 2 })}
                 </span>
                 <span className="text-xs font-black text-gray-300">{company.currency}</span>
              </div>
           </div>
           <div className="size-10 bg-[#134e4a]/5 rounded-xl flex items-center justify-center text-[#134e4a]">
              <i className="las la-wallet text-2xl" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Company Profile Brief */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 relative overflow-hidden group">
              <div className="relative z-10">
                 <div className="size-24 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden mb-6 shadow-inner">
                    {company.logo_url ? (
                       <Image src={company.logo_url} alt={company.name} width={96} height={96} className="w-full h-full object-contain p-4" />
                    ) : (
                       <span className="text-4xl font-black text-[#134e4a]">{company.name.charAt(0)}</span>
                    )}
                 </div>
                 <h4 className="text-xl font-black text-gray-900 mb-2 truncate">{company.name}</h4>
                 <div className="flex items-center gap-2 text-gray-400 text-xs font-bold font-inter tracking-tight">
                    <i className="las la-globe-europe text-lg" />
                    <span>Jurisdiction: {company.country || "Global"}</span>
                 </div>
                 <div className="mt-8 pt-8 border-t border-gray-50 space-y-4">
                    <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                       <span className="text-[10px] text-gray-400 font-black uppercase">Internal ID</span>
                       <span className="text-[10px] font-mono font-black text-gray-900">{company.id.slice(0, 16)}...</span>
                    </div>
                 </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#134e4a]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
           </div>

           <div className="p-8 bg-[#134e4a] rounded-[2.5rem] text-white shadow-2xl shadow-[#134e4a]/20 relative overflow-hidden group">
              <div className="relative z-10 h-full flex flex-col justify-between gap-6">
                 <div>
                    <div className="size-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                       <i className="las la-shield-alt text-2xl" />
                    </div>
                    <h5 className="text-sm font-black uppercase tracking-[0.2em] mb-3">Immutable Protocols</h5>
                    <p className="text-white/60 text-xs leading-relaxed font-inter font-medium">
                       These settings govern all future settlement triggers. Modification requires highest tier administrative clearance.
                    </p>
                 </div>
                 <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/5">
                    <div className="size-1.5 bg-teal-400 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-teal-100">Live Infrastructure</span>
                 </div>
              </div>
              <div className="absolute -bottom-10 -right-10 size-40 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
           </div>
        </div>

        {/* Financial Settings Form */}
        <div className="lg:col-span-2">
           <form onSubmit={handleUpdate} className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-black/5 p-10 sm:p-14 space-y-12 relative">
              <div className="flex items-center justify-between border-b border-gray-50 pb-8 mb-4">
                 <div className="flex items-center gap-4">
                    <div className="size-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shadow-sm border border-orange-100">
                       <i className="las la-cog text-2xl" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-gray-900 tracking-tight">Settlement Infrastructure</h3>
                       <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Primary Financial Configuration</p>
                    </div>
                 </div>
                 <button 
                   type="submit"
                   disabled={loading}
                   className="px-10 py-4 rounded-2xl bg-[#134e4a] text-white font-black hover:bg-[#115e59] disabled:opacity-50 transition-all shadow-xl shadow-[#134e4a]/30 active:scale-95 text-xs tracking-[0.2em] uppercase"
                 >
                   {loading ? "Updating..." : "Persist Changes"}
                 </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                 {/* Currency Selection */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">System Currency</label>
                    <div className="relative group">
                       <select 
                         required
                         value={formData.currency}
                         onChange={(e) => setFormData({...formData, currency: e.target.value})}
                         className="w-full pl-14 pr-12 py-5 rounded-3xl border-2 border-gray-50 bg-gray-50/50 appearance-none focus:border-[#134e4a] focus:bg-white transition-all font-black text-gray-900 outline-none group-hover:bg-gray-50"
                       >
                          {currencies.map(c => (
                             <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                          ))}
                       </select>
                       <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#134e4a] pointer-events-none">
                          <i className="las la-coins text-2xl opacity-60" />
                       </div>
                       <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:translate-y-0.5 transition-transform duration-300">
                          <i className="las la-angle-down" />
                       </div>
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest px-2">Primary unit for all internal wallet accounts.</p>
                 </div>

                 {/* Bank Account Holder */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">Official Account Title</label>
                    <div className="relative group">
                       <input 
                         required
                         type="text"
                         value={formData.bankAccountHolder}
                         onChange={(e) => setFormData({...formData, bankAccountHolder: e.target.value})}
                         className="w-full pl-14 pr-6 py-5 rounded-3xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white transition-all font-black text-gray-900 outline-none group-hover:bg-gray-50"
                         placeholder="Legal Entity Name"
                       />
                       <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#134e4a] pointer-events-none">
                          <i className="las la-user-shield text-2xl opacity-60" />
                       </div>
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest px-2">Verification source for withdrawal claims.</p>
                 </div>

                 {/* IBAN */}
                 <div className="space-y-4 sm:col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">Master IBAN</label>
                    <div className="relative group">
                       <input 
                         required
                         type="text"
                         value={formData.iban}
                         onChange={(e) => setFormData({...formData, iban: e.target.value.toUpperCase()})}
                         className="w-full pl-14 pr-6 py-5 rounded-3xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white transition-all font-mono font-black text-gray-900 outline-none group-hover:bg-gray-50"
                         placeholder="TR00 0000 0000..."
                       />
                       <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#134e4a] pointer-events-none">
                          <i className="las la-credit-card text-2xl opacity-60" />
                       </div>
                    </div>
                 </div>

                 {/* Bank Name */}
                 <div className="space-y-4 sm:col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">Settlement Institution</label>
                    <div className="relative group">
                       <input 
                         required
                         type="text"
                         value={formData.bankName}
                         onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                         className="w-full pl-14 pr-6 py-5 rounded-3xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white transition-all font-black text-gray-900 outline-none group-hover:bg-gray-50"
                         placeholder="Bank Name"
                       />
                       <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#134e4a] pointer-events-none">
                          <i className="las la-university text-2xl opacity-60" />
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="bg-gray-50/80 p-8 rounded-[2.5rem] border border-gray-100/50 flex flex-col sm:flex-row items-center gap-8 shadow-inner">
                 <div className="size-20 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-md border border-orange-50">
                    <i className="las la-info-circle text-4xl" />
                 </div>
                 <div className="flex-1 text-center sm:text-left">
                    <h6 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-2">Audit Compliance Warning</h6>
                    <p className="text-gray-400 text-xs font-inter font-medium leading-relaxed">
                       Standardization of settlement accounts ensures that all Riviola HQ financial triggers are executed via verified jurisdictional corridors. Ensure the Master IBAN matches the Legal Entity Title provided above.
                    </p>
                 </div>
              </div>
           </form>
        </div>
      </div>
    </div>
  );
}
