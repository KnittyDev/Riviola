"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  company_id: string | null;
}

export function CompanyDetailClient({ 
  company, 
  allUsers,
  locale 
}: { 
  company: Company; 
  allUsers: UserProfile[];
  locale: string;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    currency: company.currency || "EUR",
    bankAccountHolder: company.bank_account_holder || "",
    iban: company.iban || "",
    bankName: company.bank_name || ""
  });

  // Current staff state: array of IDs currently assigned to this company or selected for it
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>(
    allUsers.filter(s => s.company_id === company.id).map(s => s.id)
  );

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

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await updateCompanyFinancials(company.id, {
      ...formData,
      selectedStaffIds
    });

    if (res.error) {
       toast.error(res.error);
    } else {
       toast.success(t("companyDetail.toastSuccess"));
       router.refresh();
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
                 <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full uppercase tracking-widest leading-none">{t("companyDetail.badge")}</span>
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{company.name}</h1>
           </div>
        </div>
        
        <div className="bg-white px-8 py-4 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-8">
           <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{t("companyDetail.treasury")}</span>
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
        {/* User Promotion & Staff Roster */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-black/5 flex flex-col gap-6 relative overflow-hidden">
              <div className="flex items-center justify-between px-2 relative z-10">
                 <div className="flex items-center gap-3">
                    <div className="size-8 bg-[#134e4a] rounded-lg flex items-center justify-center text-white">
                       <i className="las la-user-shield text-lg" />
                    </div>
                    <div>
                       <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] leading-none block">{t("companyDetail.personnelTitle")}</span>
                       <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">{t("companyDetail.personnelSubtitle")}</p>
                    </div>
                 </div>
                 <div className="flex items-baseline gap-1 bg-[#134e4a] text-white px-3 py-1 rounded-full">
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
                      placeholder={t("companyDetail.searchUsers")}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 border-2 border-gray-50 focus:border-[#134e4a]/30 focus:bg-white outline-none font-bold text-[11px] transition-all"
                    />
                    <i className="las la-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-lg group-focus-within:text-[#134e4a]" />
                 </div>
              </div>

              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                 {filteredUsers.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t("companyDetail.noUsers")}</p>
                    </div>
                 ) : (
                    filteredUsers.map(user => {
                       const isSelected = selectedStaffIds.includes(user.id);
                       const isInvestor = user.role?.toLowerCase() === "investor";
                       const isStaffInOtherCompany = user.role?.toLowerCase() === "staff" && user.company_id && user.company_id !== company.id;
                       const currentStaff = user.company_id === company.id;

                       return (
                          <div 
                            key={user.id} 
                            onClick={() => toggleStaff(user.id)}
                            className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-center gap-4 group/item ${
                               isSelected ? 'bg-[#134e4a] border-[#134e4a] text-white shadow-xl shadow-[#134e4a]/20 scale-[1.02]' : 
                               'bg-gray-50 border-gray-100 hover:border-[#134e4a]/20 hover:bg-white'
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
                                      isSelected ? 'bg-white/10 text-white' : 'bg-gray-200/50 text-gray-400'
                                   }`}>
                                      {isInvestor ? t("companyDetail.investor") : t("companyDetail.staff")}
                                   </span>
                                   {isStaffInOtherCompany && !isSelected && (
                                      <span className="text-[8px] font-black uppercase text-orange-400 tracking-tighter">{t("companyDetail.staffOtherCompany")}</span>
                                   )}
                                   {currentStaff && !isSelected && (
                                      <span className="text-[8px] font-black uppercase text-teal-500 tracking-tighter">{t("companyDetail.assignedHere")}</span>
                                   )}
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
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#134e4a]/5 rounded-full -translate-y-1/2 translate-x-1/2 -z-0" />
           </div>
        </div>

        {/* Financial Settings Form */}
        <div className="lg:col-span-2 space-y-12">
           <form onSubmit={handleUpdate} className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-black/5 p-10 sm:p-14 space-y-12 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-50 pb-8 mb-4 relative z-10">
                 <div className="flex items-center gap-4">
                    <div className="size-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shadow-sm border border-orange-100">
                       <i className="las la-cog text-2xl" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-gray-900 tracking-tight">{t("companyDetail.formTitle")}</h3>
                       <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{t("companyDetail.formSubtitle")}</p>
                    </div>
                 </div>
                 <button 
                   type="submit"
                   disabled={loading}
                   className="px-12 py-5 rounded-[2rem] bg-[#134e4a] text-white font-black hover:bg-[#115e59] disabled:opacity-50 transition-all shadow-xl shadow-[#134e4a]/40 active:scale-95 text-xs tracking-[0.2em] uppercase"
                 >
                   {loading ? t("companyDetail.saveLoading") : t("companyDetail.saveIdle")}
                 </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 relative z-10">
                 {/* Currency Selection */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">{t("companyDetail.systemCurrency")}</label>
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
                    </div>
                 </div>

                 {/* Bank Account Holder */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">{t("companyDetail.officialAccountTitle")}</label>
                    <div className="relative group">
                       <input 
                         required
                         type="text"
                         value={formData.bankAccountHolder}
                         onChange={(e) => setFormData({...formData, bankAccountHolder: e.target.value})}
                         className="w-full pl-14 pr-6 py-5 rounded-3xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white transition-all font-black text-gray-900 outline-none group-hover:bg-gray-50"
                         placeholder={t("companyDetail.officialAccountPh")}
                       />
                       <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#134e4a] pointer-events-none">
                          <i className="las la-user-tag text-2xl opacity-60" />
                       </div>
                    </div>
                 </div>

                 {/* IBAN */}
                 <div className="space-y-4 sm:col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">{t("companyDetail.settlementIban")}</label>
                    <div className="relative group">
                       <input 
                         required
                         type="text"
                         value={formData.iban}
                         onChange={(e) => setFormData({...formData, iban: e.target.value.toUpperCase()})}
                         className="w-full pl-14 pr-6 py-5 rounded-3xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white transition-all font-mono font-black text-gray-900 outline-none group-hover:bg-gray-50"
                         placeholder={t("companyDetail.ibanPh")}
                       />
                       <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#134e4a] pointer-events-none">
                          <i className="las la-id-card-alt text-2xl opacity-60" />
                       </div>
                    </div>
                 </div>

                 {/* Bank Name */}
                 <div className="space-y-4 sm:col-span-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-2">{t("companyDetail.governingBank")}</label>
                    <div className="relative group">
                       <input 
                         required
                         type="text"
                         value={formData.bankName}
                         onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                         className="w-full pl-14 pr-6 py-5 rounded-3xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white transition-all font-black text-gray-900 outline-none group-hover:bg-gray-50"
                         placeholder={t("companyDetail.bankNamePh")}
                       />
                       <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#134e4a] pointer-events-none">
                          <i className="las la-building text-2xl opacity-60" />
                       </div>
                    </div>
                 </div>
              </div>
              <div className="absolute top-0 left-0 w-64 h-64 bg-[#134e4a]/[0.02] rounded-full -translate-y-1/2 -translate-x-1/2 -z-0" />
           </form>
           
           <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
                 <div className="size-20 bg-white/20 rounded-3xl flex items-center justify-center shadow-inner">
                    <i className="las la-info-circle text-4xl" />
                 </div>
                 <div className="flex-1 text-center sm:text-left">
                    <h6 className="text-[11px] font-black uppercase tracking-[0.3em] mb-2">{t("companyDetail.infoTitle")}</h6>
                    <p className="text-white/80 text-xs font-inter font-medium leading-relaxed pr-8">{t("companyDetail.infoBody")}</p>
                 </div>
              </div>
              <div className="absolute -bottom-10 -right-10 size-48 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
           </div>
        </div>
      </div>
    </div>
  );
}
