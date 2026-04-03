"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { toast } from "@/lib/toast";
import { registerNewCompany } from "./actions";

export function NewCompanyClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    currency: "EUR",
    bankAccountHolder: "",
    iban: "",
    bankName: ""
  });

  const currencies = [
    { code: "EUR", symbol: "€" },
    { code: "USD", symbol: "$" },
    { code: "TRY", symbol: "₺" },
    { code: "GBP", symbol: "£" }
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    // Check if fields are empty
    if (!formData.name.trim() || !formData.country.trim()) {
      toast.error("Please fill in the required company metadata");
      setLoading(false);
      return;
    }

    const res = await registerNewCompany(formData);

    if (res.error) {
       toast.error(res.error);
    } else {
       toast.success("New company registered successfully");
       router.push("/dashboard/admin/companies");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4">
         <Link 
           href="/dashboard/admin/companies" 
           className="size-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#134e4a] hover:border-[#134e4a]/20 transition-all shadow-sm group"
         >
           <i className="las la-arrow-left text-xl group-hover:-translate-x-1 transition-transform" />
         </Link>
         <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full uppercase tracking-widest leading-none">Venture Onboarding</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Register New Company</h1>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Core Metadata Card */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-black/5 relative overflow-hidden flex flex-col items-center text-center">
              <div className="size-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 mb-8 overflow-hidden group-hover:border-[#134e4a] transition-colors relative">
                 <i className="las la-image text-4xl" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest">Update Logo</div>
              </div>
              <h4 className="text-lg font-black text-gray-900 mb-2 truncate max-w-full italic px-4">
                 {formData.name || "Awaiting Agency Title..."}
              </h4>
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-10">Initial Configuration Phase</p>
              
              <div className="w-full space-y-6 pt-10 border-t border-gray-50">
                 <div className="relative group text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 pl-1">Primary Agency Name</label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white transition-all font-black text-gray-900 outline-none text-sm"
                      placeholder="e.g. Riviola Properties UK"
                    />
                 </div>
                 <div className="relative group text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 pl-1">Registering Jurisdiction</label>
                    <input 
                      required
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white transition-all font-black text-gray-900 outline-none text-sm"
                      placeholder="e.g. United Kingdom"
                    />
                 </div>
              </div>
              <div className="absolute -top-10 -right-10 size-40 bg-[#134e4a]/5 rounded-full blur-3xl" />
           </div>

           <div className="p-8 bg-[#134e4a] rounded-[3rem] text-white shadow-2xl shadow-[#134e4a]/30 relative overflow-hidden group">
              <div className="relative z-10 flex flex-col gap-6 h-full justify-between">
                 <div>
                    <div className="size-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                       <i className="las la-rocket text-3xl" />
                    </div>
                    <h5 className="text-sm font-black uppercase tracking-[0.2em] mb-4">Infrastructure Boot</h5>
                    <p className="text-white/60 text-xs leading-relaxed font-inter font-medium pr-6">
                       Registering a new entity here immediately prepares the wallet infrastructure for cross-border settlements within the Riviola HQ network.
                    </p>
                 </div>
                 <div className="flex items-center gap-2 bg-white/10 w-fit px-4 py-2 rounded-full border border-white/5 shadow-inner">
                    <div className="size-2 bg-teal-400 rounded-full animate-pulse shadow-sm" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-teal-100">Live Network Integration</span>
                 </div>
              </div>
              <div className="absolute -bottom-20 -right-20 size-64 bg-teal-400/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
           </div>
        </div>

        {/* Financial Configuration Form */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-[4rem] border border-gray-100 shadow-2xl p-10 sm:p-14 space-y-12 mb-10 overflow-hidden relative">
              <div className="flex items-center justify-between border-b border-gray-50 pb-10">
                 <div className="flex items-center gap-5">
                    <div className="size-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-md border border-emerald-100">
                       <i className="las la-credit-card text-3xl" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-gray-900 tracking-tight">Settlement Master Config</h3>
                       <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Pre-Approved Fiscal Corridor Architecture</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="px-14 py-5 rounded-[2rem] bg-[#134e4a] text-white font-black hover:bg-[#115e59] disabled:opacity-50 transition-all shadow-2xl shadow-[#134e4a]/30 active:scale-95 text-xs tracking-[0.3em] uppercase flex items-center gap-3 shrink-0"
                    >
                      {loading ? "Initializing..." : "Commit Entity"}
                      <i className="las la-chevron-right text-lg" />
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                 {/* Currency */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">Base Settlement Currency</label>
                    <div className="relative group">
                       <select 
                         required
                         value={formData.currency}
                         onChange={(e) => setFormData({...formData, currency: e.target.value})}
                         className="w-full pl-14 pr-12 py-5 rounded-3xl border-2 border-gray-50 bg-gray-50/50 appearance-none focus:border-[#134e4a] focus:bg-white transition-all font-black text-gray-900 outline-none group-hover:bg-gray-50 text-sm shadow-sm"
                       >
                          {currencies.map(c => (
                             <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                          ))}
                       </select>
                       <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#134e4a] pointer-events-none">
                          <i className="las la-coins text-2xl opacity-60" />
                       </div>
                       <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:translate-y-0.5 transition-transform duration-300">
                          <i className="las la-angle-down text-xl" />
                       </div>
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest px-2">Determines all internal wallet triggers.</p>
                 </div>

                 {/* Account Holder */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">Account Holder Full Name</label>
                    <div className="relative group">
                       <input 
                         required
                         type="text"
                         value={formData.bankAccountHolder}
                         onChange={(e) => setFormData({...formData, bankAccountHolder: e.target.value})}
                         className="w-full pl-14 pr-6 py-5 rounded-3xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white transition-all font-black text-gray-900 outline-none group-hover:bg-gray-50 text-sm shadow-sm"
                         placeholder="Legal Corporate Person Name"
                       />
                       <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#134e4a] pointer-events-none">
                          <i className="las la-user-tag text-2xl opacity-60" />
                       </div>
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest px-2">Master identifier for all cross-border settlements.</p>
                 </div>

                 {/* IBAN */}
                 <div className="space-y-4 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">Settlement Master IBAN</label>
                    <div className="relative group">
                       <input 
                         required
                         type="text"
                         value={formData.iban}
                         onChange={(e) => setFormData({...formData, iban: e.target.value.toUpperCase()})}
                         className="w-full pl-14 pr-6 py-5 rounded-3xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white transition-all font-mono font-black text-gray-900 outline-none group-hover:bg-gray-50 text-sm shadow-sm"
                         placeholder="e.g. TR00 1234..."
                       />
                       <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#134e4a] pointer-events-none">
                          <i className="las la-id-card-alt text-2xl opacity-60" />
                       </div>
                    </div>
                 </div>

                 {/* Bank Name */}
                 <div className="space-y-4 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">Governing Financial Institution</label>
                    <div className="relative group">
                       <input 
                         required
                         type="text"
                         value={formData.bankName}
                         onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                         className="w-full pl-14 pr-6 py-5 rounded-3xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white transition-all font-black text-gray-900 outline-none group-hover:bg-gray-50 text-sm shadow-sm"
                         placeholder="e.g. JPMorgan Chase"
                       />
                       <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#134e4a] pointer-events-none">
                          <i className="las la-building text-2xl opacity-60" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-amber-50/50 p-8 rounded-[2.5rem] border border-amber-100 flex flex-col sm:flex-row items-center gap-8 shadow-inner">
                 <div className="size-20 bg-white rounded-[1.5rem] flex items-center justify-center text-amber-500 shadow-md border border-amber-50 shrink-0">
                    <i className="las la-shield-alt text-4xl" />
                 </div>
                 <div className="flex-1 text-center sm:text-left">
                    <h6 className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-2 flex items-center gap-2 justify-center sm:justify-start">
                       <div className="size-1.5 bg-amber-500 rounded-full" />
                       Compliance Audit Trail
                    </h6>
                    <p className="text-gray-400 text-xs font-inter font-medium leading-relaxed">
                       Entity creation triggers an internal anti-fraud audit. Ensure all provided legal titles and IBAN jurisdictions exactly match the official certificate of incorporation.
                    </p>
                 </div>
              </div>
              
              <div className="absolute -bottom-20 -left-20 size-80 bg-orange-600/5 rounded-full blur-[100px] -z-10" />
           </div>
        </div>
      </form>
    </div>
  );
}
