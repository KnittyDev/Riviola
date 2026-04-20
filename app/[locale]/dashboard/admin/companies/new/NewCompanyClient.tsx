"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { toast } from "@/lib/toast";
import { registerNewCompany } from "./actions";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  company_id: string | null;
}

export function NewCompanyClient({ allUsers }: { allUsers: UserProfile[] }) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    currency: "EUR",
    bankAccountHolder: "",
    iban: "",
    bankName: ""
  });

  // Staff state: array of IDs to be assigned/promoted
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);

  const currencies = [
    { code: "EUR", symbol: "€" },
    { code: "USD", symbol: "$" },
    { code: "TRY", symbol: "₺" },
    { code: "GBP", symbol: "£" },
    { code: "CHF", symbol: "Fr" },
    { code: "AUD", symbol: "A$" },
    { code: "CAD", symbol: "C$" },
    { code: "NOK", symbol: "kr" },
    { code: "SEK", symbol: "kr" },
    { code: "DKK", symbol: "kr" },
    { code: "PLN", symbol: "zl" },
    { code: "RON", symbol: "lei" },
    { code: "BGN", symbol: "lv" },
    { code: "JPY", symbol: "¥" },
    { code: "AED", symbol: "د.إ" },
    { code: "SAR", symbol: "﷼" },
    { code: "ALL", symbol: "L" }
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    if (!formData.name.trim() || !formData.country.trim()) {
      toast.error(t("newCompany.toastRequired"));
      setLoading(false);
      return;
    }

    const res = await registerNewCompany({
       ...formData,
       selectedStaffIds
    });

    if (res.error) {
       toast.error(res.error);
    } else {
       toast.success(t("newCompany.toastSuccess"));
       router.push("/dashboard/admin/companies");
    }
    setLoading(false);
  }

  const toggleStaff = (id: string) => {
    setSelectedStaffIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const filteredUsers = allUsers.filter(u => 
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
               <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full uppercase tracking-widest leading-none">{t("newCompany.badge")}</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t("newCompany.title")}</h1>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Card & Staff Recruitment */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-black/5 relative overflow-hidden flex flex-col items-center text-center">
              <div className="size-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 mb-8 overflow-hidden relative">
                 <i className="las la-image text-4xl" />
              </div>
              <h4 className="text-lg font-black text-gray-900 mb-2 truncate max-w-full italic px-4">
                 {formData.name || t("newCompany.awaitingTitle")}
              </h4>
              
              <div className="w-full space-y-6 pt-10 border-t border-gray-50">
                 <div className="relative group text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 pl-1">{t("newCompany.agencyName")}</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white transition-all font-black text-gray-900 outline-none text-sm shadow-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder={t("newCompany.agencyNamePh")}
                    />
                 </div>
                 <div className="relative group text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1 pl-1">{t("newCompany.jurisdiction")}</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white transition-all font-black text-gray-900 outline-none text-sm shadow-sm"
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      placeholder={t("newCompany.jurisdictionPh")}
                    />
                 </div>
              </div>
              <div className="absolute -top-10 -right-10 size-40 bg-[#134e4a]/5 rounded-full blur-3xl -z-0" />
           </div>

           {/* Recruit Team (Investors -> Staff Conversion) */}
           <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 flex flex-col gap-6 relative overflow-hidden">
              <div className="flex items-center justify-between px-2 relative z-10">
                 <div className="flex items-center gap-3">
                    <div className="size-8 bg-[#134e4a] rounded-lg flex items-center justify-center text-white">
                       <i className="las la-user-plus text-lg" />
                    </div>
                    <div>
                       <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] leading-none block">{t("newCompany.recruitTitle")}</span>
                       <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">{t("newCompany.recruitSubtitle")}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-1.5 bg-[#134e4a] text-white px-3 py-1 rounded-full shadow-lg shadow-[#134e4a]/20">
                    <span className="text-[10px] font-black tabular-nums">{selectedStaffIds.length}</span>
                 </div>
              </div>

              {/* Search Bar */}
              <div className="px-2 relative z-10">
                 <div className="relative group">
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("newCompany.searchUsers")}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border-2 border-gray-50 focus:border-[#134e4a]/30 focus:bg-white outline-none font-bold text-[11px] transition-all"
                    />
                    <i className="las la-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-lg group-focus-within:text-[#134e4a]" />
                 </div>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                 {filteredUsers.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t("newCompany.noUsers")}</p>
                    </div>
                 ) : (
                    filteredUsers.map(user => {
                       const isSelected = selectedStaffIds.includes(user.id);
                       const isInvestor = user.role?.toLowerCase() === "investor";
                       const isAlreadyStaff = user.role?.toLowerCase() === "staff";
                       
                       return (
                          <div 
                            key={user.id} 
                            onClick={() => toggleStaff(user.id)}
                            className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-center gap-4 group/item ${
                               isSelected ? 'bg-[#134e4a] border-[#134e4a] text-white shadow-xl shadow-[#134e4a]/20 scale-[1.02]' : 
                               'bg-gray-50 border-gray-100 hover:border-[#134e4a]/20'
                            }`}
                          >
                             <div className={`size-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${isSelected ? 'bg-white/20' : 'bg-white border border-gray-100'}`}>
                                <span className={`font-black text-sm ${isSelected ? 'text-white' : 'text-[#134e4a]'}`}>
                                   {user.full_name?.charAt(0) || "U"}
                                </span>
                             </div>
                             <div className="flex-1 min-w-0">
                                <h6 className={`text-[11px] font-black tracking-tight truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>{user.full_name || user.email}</h6>
                                <div className="flex items-center gap-2 mt-1">
                                   <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                      isSelected ? 'bg-white/10 text-white' : (isInvestor ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600')
                                   }`}>
                                      {isInvestor ? t("newCompany.investor") : t("newCompany.staff")}
                                   </span>
                                </div>
                             </div>
                             <div className={`size-6 rounded-xl border-2 flex items-center justify-center transition-all ${
                                isSelected ? 'border-emerald-400 bg-emerald-400 text-white' : 'border-gray-200 group-hover/item:border-[#134e4a]/30'
                             }`}>
                                {isSelected && <i className="las la-plus text-xs" />}
                             </div>
                          </div>
                       );
                    })
                 )}
              </div>
              <div className="absolute -top-10 -left-10 size-64 bg-[#134e4a]/[0.02] rounded-full blur-[100px] -z-10" />
           </div>
        </div>

        {/* Master Config Form */}
        <div className="lg:col-span-2 space-y-12">
           <div className="bg-white rounded-[4rem] border border-gray-100 shadow-2xl p-10 sm:p-14 space-y-12 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-50 pb-10 relative z-10">
                 <div className="flex items-center gap-5">
                    <div className="size-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-md border border-emerald-100">
                       <i className="las la-credit-card text-3xl" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-gray-900 tracking-tight">{t("newCompany.settlementTitle")}</h3>
                       <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{t("newCompany.settlementSubtitle")}</p>
                    </div>
                 </div>
                 <button 
                   type="submit"
                   disabled={loading}
                   className="px-14 py-5 rounded-[2rem] bg-[#134e4a] text-white font-black hover:bg-[#115e59] disabled:opacity-50 transition-all shadow-2xl shadow-[#134e4a]/30 active:scale-95 text-xs tracking-[0.3em] uppercase flex items-center gap-3 shrink-0"
                 >
                   {loading ? t("newCompany.submitLoading") : t("newCompany.submitIdle")}
                   <i className="las la-chevron-right text-lg" />
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative z-10">
                 {/* Currency */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">{t("newCompany.currency")}</label>
                    <select 
                      required
                      className="w-full px-6 py-5 rounded-3xl border-2 border-gray-50 bg-gray-50/50 appearance-none focus:border-[#134e4a] focus:bg-white transition-all font-black text-gray-900 outline-none text-sm shadow-sm"
                      value={formData.currency}
                      onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    >
                       {currencies.map(c => (
                          <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                       ))}
                    </select>
                 </div>

                 {/* Account Holder */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">{t("newCompany.accountTitle")}</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-5 rounded-3xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white transition-all font-black text-gray-900 outline-none text-sm shadow-sm"
                      value={formData.bankAccountHolder}
                      onChange={(e) => setFormData({...formData, bankAccountHolder: e.target.value})}
                      placeholder={t("newCompany.accountTitlePh")}
                    />
                 </div>

                 {/* IBAN */}
                 <div className="space-y-4 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">{t("newCompany.iban")}</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-5 rounded-3xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white transition-all font-mono font-black text-gray-900 outline-none text-sm shadow-sm"
                      value={formData.iban}
                      onChange={(e) => setFormData({...formData, iban: e.target.value.toUpperCase()})}
                      placeholder={t("newCompany.ibanPh")}
                    />
                 </div>

                 {/* Bank Name */}
                 <div className="space-y-4 md:col-span-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">{t("newCompany.bank")}</label>
                    <input 
                      required
                      type="text"
                      className="w-full px-6 py-4 rounded-3xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white transition-all font-black text-gray-900 outline-none text-sm shadow-sm"
                      value={formData.bankName}
                      onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                      placeholder={t("newCompany.bankPh")}
                    />
                 </div>
              </div>
           </div>
           
           <div className="bg-orange-500 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-orange-500/20 relative overflow-hidden group">
              <div className="relative z-10 flex items-center gap-6">
                 <div className="size-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
                    <i className="las la-info-circle text-3xl" />
                 </div>
                 <div className="flex-1">
                    <h6 className="text-[10px] font-black uppercase tracking-[0.2em] mb-1">{t("newCompany.alertTitle")}</h6>
                    <p className="text-white/80 text-[11px] font-inter font-medium leading-relaxed">{t("newCompany.alertBody")}</p>
                 </div>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
}
