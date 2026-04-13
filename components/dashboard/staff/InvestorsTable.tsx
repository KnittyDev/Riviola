"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CompanyInvestorPropertyRow } from "@/lib/companyInvestors";
import { updateInvestorAction } from "@/app/[locale]/dashboard/staff/investors/actions";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { useTranslations } from "next-intl";

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white outline-none transition-all font-semibold text-sm";
const labelClass = "text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1 mb-1";

const CURRENCIES = [
  { value: "EUR", label: "EUR" },
  { value: "USD", label: "USD" },
  { value: "GBP", label: "GBP" },
  { value: "TRY", label: "TRY" },
  { value: "CHF", label: "CHF" },
  { value: "AUD", label: "AUD" },
  { value: "CAD", label: "CAD" },
  { value: "NOK", label: "NOK" },
  { value: "SEK", label: "SEK" },
  { value: "AED", label: "AED" },
  { value: "SAR", label: "SAR" },
  { value: "ALL", label: "ALL" },
];

export type BuildingSummary = {
  id: string;
  name: string;
  blocks: string[];
  total_units: number;
};

export function InvestorsTable({ 
  rows, 
  buildings = [] 
}: { 
  rows: CompanyInvestorPropertyRow[];
  buildings?: BuildingSummary[];
}) {
  const t = useTranslations("Investors");
  const router = useRouter();
  const [editing, setEditing] = useState<CompanyInvestorPropertyRow | null>(null);
  const [editPhone, setEditPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    setEditPhone(editing?.phone ?? "");
  }, [editing]);

  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      const matchesSearch = 
        (row.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         row.email?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesBuilding = buildingFilter === "all" || row.building_id === buildingFilter;
      const matchesType = typeFilter === "all" || row.investor_type === typeFilter;

      return matchesSearch && matchesBuilding && matchesType;
    });
  }, [rows, searchTerm, buildingFilter, typeFilter]);

  async function handleSave(e: React.FormEvent) {
    if (!editing) return;
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const fullName = (form.querySelector("[name=fullName]") as HTMLInputElement)?.value?.trim() ?? "";
    const email = (form.querySelector("[name=email]") as HTMLInputElement)?.value?.trim() ?? "";
    const phone = editPhone.trim() || null;
    const block = (form.querySelector("[name=block]") as (HTMLSelectElement | HTMLInputElement))?.value?.trim() ?? "";
    const unit = (form.querySelector("[name=unit]") as HTMLInputElement)?.value?.trim() ?? "";
    const areaM2Raw = (form.querySelector("[name=areaM2]") as HTMLInputElement)?.value?.trim() ?? "";
    const deliveryPeriod = (form.querySelector("[name=deliveryPeriod]") as HTMLInputElement)?.value?.trim() ?? "";
    const purchaseValueRaw = (form.querySelector("[name=purchaseValue]") as HTMLInputElement)?.value?.trim() ?? "";
    const purchaseCurrency = (form.querySelector("[name=purchaseCurrency]") as HTMLSelectElement)?.value?.trim() ?? "";
    const language = (form.querySelector("[name=language]") as HTMLSelectElement)?.value?.trim() ?? "en";
    const currency = (form.querySelector("[name=currency]") as HTMLSelectElement)?.value?.trim() ?? "EUR";

    const areaM2 = areaM2Raw === "" ? null : parseFloat(areaM2Raw);
    const validArea = areaM2 != null && !Number.isNaN(areaM2) && areaM2 >= 0;
    const purchaseValue = purchaseValueRaw === "" ? null : parseFloat(purchaseValueRaw);
    const validPurchase = purchaseValue != null && !Number.isNaN(purchaseValue) && purchaseValue >= 0;
    const investorType = (form.querySelector("[name=investorType]") as HTMLSelectElement)?.value === "renter" ? "renter" : "buyer";

    const result = await updateInvestorAction({
      profileId: editing.profile_id,
      investorPropertyId: editing.id,
      fullName: fullName || null,
      email: email || null,
      phone: phone || null,
      investorType,
      block,
      unit,
      areaM2: validArea ? areaM2 : null,
      deliveryPeriod: deliveryPeriod || null,
      purchaseValue: validPurchase ? purchaseValue : null,
      purchaseCurrency: purchaseCurrency || null,
      language,
      currency,
    });
    setLoading(false);
    if (result.ok) {
      setEditing(null);
      router.refresh();
      return;
    }
    setError(result.error || "Something went wrong");
  }

  const currentBuilding = editing 
    ? buildings.find(b => b.id === editing.building_id)
    : null;

  const currentBuildingBlocks = currentBuilding?.blocks ?? [];
  const maxUnits = currentBuilding?.total_units || 9999;

  return (
    <>
      {/* Filters Section */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500 font-inter">
        <div className="relative group/search">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("table.searchPlaceholder") || "Search investors..."}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-50 bg-white focus:border-[#134e4a]/20 focus:bg-white focus:ring-4 focus:ring-[#134e4a]/5 outline-none transition-all shadow-xl shadow-black/5 font-semibold text-gray-900"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-[#134e4a] transition-colors">
            <i className="las la-search text-xl" />
          </div>
        </div>

        <div className="relative">
          <select 
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-50 bg-white focus:border-[#134e4a]/20 focus:ring-4 focus:ring-[#134e4a]/5 outline-none transition-all shadow-xl shadow-black/5 appearance-none font-bold text-gray-900 text-sm"
          >
            <option value="all">{t("table.allProjects")}</option>
            {buildings.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <i className="las la-building text-xl" />
          </div>
        </div>

        <div className="relative">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-50 bg-white focus:border-[#134e4a]/20 focus:ring-4 focus:ring-[#134e4a]/5 outline-none transition-all shadow-xl shadow-black/5 appearance-none font-bold text-gray-900 text-sm"
          >
            <option value="all">{t("table.anyStatus")}</option>
            <option value="buyer">{t("table.premierBuyer")}</option>
            <option value="renter">{t("table.verifiedRenter")}</option>
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <i className="las la-filter text-xl" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-black/5 overflow-hidden animate-in fade-in duration-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/30">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                   {t("table.identity")}
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                   {t("table.assignment")}
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                   {t("table.unitDetail")}
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                   {t("table.status")}
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                   {t("table.management")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-inter">
              {filteredRows.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-8 py-16 text-center text-gray-300 italic font-medium">No investors found matching the criteria.</td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr
                    key={`${row.id}-${idx}`}
                    className="hover:bg-gray-50/50 transition-colors group cursor-default"
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 group-hover:text-[#134e4a] transition-colors leading-tight mb-1">{row.full_name || "—"}</span>
                        <div className="flex items-center gap-3">
                           {row.email && (
                             <span className="text-[11px] text-gray-400 font-bold lowercase tracking-tight">
                               {row.email}
                             </span>
                           )}
                           {row.phone && (
                              <span className="size-1 bg-gray-200 rounded-full" />
                           )}
                           {row.phone && (
                             <span className="text-[11px] text-gray-400 font-bold">
                               {row.phone}
                             </span>
                           )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-black text-gray-800 bg-gray-100/50 px-4 py-2 rounded-2xl border border-gray-100 group-hover:border-[#134e4a]/20 group-hover:bg-[#134e4a]/5 group-hover:text-[#134e4a] transition-all">
                        {row.building_name}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                         <span className="text-xs font-black text-gray-400 uppercase">{row.block}</span>
                         <span className="size-1.5 bg-gray-200 rounded-full" />
                         <span className="text-sm font-black text-gray-900">Unit {row.unit}</span>
                         {row.area_m2 && (
                            <span className="text-[10px] font-black text-[#134e4a] bg-[#134e4a]/5 px-2 py-0.5 rounded-lg ml-1">
                               {row.area_m2} m²
                            </span>
                         )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm transition-transform hover:scale-105 ${
                        row.investor_type === "renter" 
                           ? "bg-slate-50 text-slate-500 border-slate-100" 
                          : "bg-[#134e4a]/10 text-[#134e4a] border-[#134e4a]/10"
                      }`}>
                        {row.investor_type === "renter" ? t("table.types.renter") : t("table.types.buyer")}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setEditPhone(row.phone ?? "");
                          setEditing(row);
                        }}
                        className="size-11 rounded-2xl bg-gray-50 text-gray-400 hover:bg-[#134e4a] hover:text-white transition-all shadow-sm inline-flex items-center justify-center group/btn active:scale-90"
                      >
                        <i className="las la-pen text-xl group-hover/btn:rotate-12 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => !loading && setEditing(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-[2rem] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-50 bg-gray-50/20 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-[#134e4a]/10 flex items-center justify-center text-[#134e4a] shadow-inner">
                     <i className="las la-user-edit text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900 tracking-tight leading-none">
                      {t("modal.editTitle")}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5">
                       <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{editing.building_name}</span>
                       <span className="size-1 bg-gray-200 rounded-full" />
                       <span className="text-[9px] font-black text-[#134e4a] uppercase tracking-widest">{editing.block} / {editing.unit}</span>
                    </div>
                  </div>
               </div>
               <button onClick={() => setEditing(null)} className="size-10 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-rose-500 hover:scale-110 transition-all flex items-center justify-center shadow-sm">
                  <i className="las la-times text-xl" />
               </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 custom-scrollbar scroll-smooth">
              {error && (
                <p className="text-red-600 text-[9px] font-black uppercase tracking-widest p-4 rounded-xl bg-red-50 border border-red-100 animate-pulse" role="alert">
                   <i className="las la-exclamation-circle text-base mr-2" />
                  {error}
                </p>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                 <div className="space-y-1.5">
                    <label className={labelClass}>{t("modal.fullName")}</label>
                    <input name="fullName" type="text" defaultValue={editing.full_name ?? ""} className={inputClass} />
                 </div>
                 <div className="space-y-1.5">
                    <label className={labelClass}>{t("modal.email")}</label>
                    <input name="email" type="email" defaultValue={editing.email ?? ""} className={inputClass} />
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                 <div className="space-y-1.5">
                    <label className={labelClass}>{t("modal.language") || "Language"}</label>
                    <select name="language" defaultValue={editing.language ?? "en"} className={`${inputClass} appearance-none cursor-pointer pr-10 bg-[url('https://api.iconify.design/las:angle-down.svg')] bg-[length:18px] bg-[right_1rem_center] bg-no-repeat`}>
                       <option value="en">English</option>
                       <option value="tr">Türkçe</option>
                       <option value="sr">Srpski</option>
                       <option value="sq">Shqip</option>
                       <option value="pl">Polski</option>
                    </select>
                 </div>
                 <div className="space-y-1.5">
                    <label className={labelClass}>{t("modal.currency") || "Currency"}</label>
                    <select name="currency" defaultValue={editing.currency ?? "EUR"} className={`${inputClass} appearance-none cursor-pointer pr-10 bg-[url('https://api.iconify.design/las:angle-down.svg')] bg-[length:18px] bg-[right_1rem_center] bg-no-repeat`}>
                       <option value="EUR">EUR (€)</option>
                       <option value="USD">USD ($)</option>
                       <option value="GBP">GBP (£)</option>
                       <option value="TRY">TRY (₺)</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-1.5">
                 <label className={labelClass}>{t("modal.phone")}</label>
                 <div className="w-full [&_.react-international-phone-input-container]:!w-full [&_.react-international-phone-input]:!w-full [&_.react-international-phone-input]:!rounded-xl [&_.react-international-phone-input]:!border-2 [&_.react-international-phone-input]:!border-gray-50 [&_.react-international-phone-input]:!bg-gray-50/50 [&_.react-international-phone-input]:!px-4 [&_.react-international-phone-input]:!py-2.5 [&_.react-international-phone-input]:!font-bold [&_.react-international-phone-country-selector]:!border-r-0 [&_.react-international-phone-country-selector-button]:!rounded-l-xl [&_.react-international-phone-country-selector-button]:!bg-gray-50/50">
                   <PhoneInput
                     defaultCountry="tr"
                     value={editPhone}
                     onChange={(value) => setEditPhone(value)}
                     inputProps={{ id: "phone", name: "phone" }}
                   />
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                 <div className="space-y-1.5">
                    <label className={labelClass}>{t("modal.investorType")}</label>
                    <select name="investorType" defaultValue={editing.investor_type ?? "buyer"} className={`${inputClass} appearance-none cursor-pointer pr-10 bg-[url('https://api.iconify.design/las:angle-down.svg')] bg-[length:18px] bg-[right_1rem_center] bg-no-repeat`}>
                       <option value="buyer">{t("table.premierBuyer")}</option>
                       <option value="renter">{t("table.verifiedRenter")}</option>
                    </select>
                 </div>
                 <div className="space-y-1.5">
                    <label className={labelClass}>{t("modal.deliveryPeriod")}</label>
                    <input name="deliveryPeriod" type="text" defaultValue={editing.delivery_period ?? ""} className={inputClass} placeholder="Q3 2026" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                 <div className="space-y-1.5">
                    <label className={labelClass}>Structural {t("modal.block")}</label>
                    {currentBuildingBlocks.length > 0 ? (
                       <select 
                         name="block" 
                         defaultValue={editing.block} 
                         className={`${inputClass} appearance-none cursor-pointer pr-10 bg-gray-50/50 text-gray-900 font-bold`}
                       >
                         {currentBuildingBlocks.map(b => (
                           <option key={b} value={b}>{b}</option>
                         ))}
                       </select>
                    ) : (
                       <input 
                         name="block" 
                         type="text" 
                         defaultValue={editing.block} 
                         required 
                         className={inputClass} 
                       />
                    )}
                 </div>
                 <div className="space-y-1.5">
                    <label className={labelClass}>Unit (Max: {maxUnits})</label>
                    <input 
                      name="unit" 
                      type="number" 
                      min={1} 
                      max={maxUnits}
                      defaultValue={editing.unit} 
                      required 
                      className={`${inputClass} bg-gray-50/50 text-gray-900 font-bold`}
                    />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                 <div className="space-y-1.5">
                    <label className={labelClass}>Net Area (m²)</label>
                    <input name="areaM2" type="number" step="0.01" defaultValue={editing.area_m2 ?? ""} className={inputClass} />
                 </div>
                 <div className="space-y-1.5">
                    <label className={labelClass}>Portfolio Value</label>
                    <div className="flex gap-2">
                       <input name="purchaseValue" type="number" step="0.01" defaultValue={editing.purchase_value ?? ""} className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white outline-none transition-all font-bold text-gray-900 text-sm" />
                       <select name="purchaseCurrency" defaultValue={editing.purchase_currency ?? "EUR"} className="w-24 px-2 py-2.5 rounded-xl border-2 border-gray-50 bg-gray-50/50 outline-none font-black text-[10px] text-[#134e4a] appearance-none text-center">
                          {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
                       </select>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                 <button type="submit" disabled={loading} className="flex-1 py-3.5 rounded-2xl bg-[#134e4a] text-white font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#115e59] shadow-xl shadow-[#134e4a]/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                    {loading ? (
                       <>
                          <div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          {t("modal.updating")}
                       </>
                    ) : t("modal.saveChanges")}
                 </button>
                 <button 
                   type="button" 
                   onClick={() => setEditing(null)} 
                   className="px-8 py-3.5 rounded-2xl border-2 border-gray-50 font-black uppercase text-[10px] tracking-widest text-gray-400 hover:bg-gray-50 transition-all hover:text-gray-600"
                 >
                    {t("modal.cancel")}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
