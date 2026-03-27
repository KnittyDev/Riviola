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
  "w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#134e4a] focus:ring-1 focus:ring-[#134e4a]/20 outline-none text-sm";
const labelClass = "block text-xs font-semibold text-gray-600 mb-1";

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
    const block = (form.querySelector("[name=block]") as HTMLSelectElement)?.value?.trim() ?? "";
    const unit = (form.querySelector("[name=unit]") as HTMLInputElement)?.value?.trim() ?? "";
    const areaM2Raw = (form.querySelector("[name=areaM2]") as HTMLInputElement)?.value?.trim() ?? "";
    const deliveryPeriod = (form.querySelector("[name=deliveryPeriod]") as HTMLInputElement)?.value?.trim() ?? "";
    const purchaseValueRaw = (form.querySelector("[name=purchaseValue]") as HTMLInputElement)?.value?.trim() ?? "";
    const purchaseCurrency = (form.querySelector("[name=purchaseCurrency]") as HTMLSelectElement)?.value?.trim() ?? "";

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
    });
    setLoading(false);
    if (result.ok) {
      setEditing(null);
      router.refresh();
      return;
    }
    setError(result.error || "Something went wrong");
  }

  const currentBuildingBlocks = editing 
    ? (buildings.find(b => b.id === editing.building_id)?.blocks ?? [])
    : [];

  return (
    <>
      {/* Filters Section */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="relative group/search">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("table.searchPlaceholder") || "Search investors..."}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white focus:border-[#134e4a] focus:ring-4 focus:ring-[#134e4a]/5 outline-none transition-all shadow-sm"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-[#134e4a] transition-colors">
            <i className="las la-search text-lg" />
          </div>
        </div>

        <div className="relative">
          <select 
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white focus:border-[#134e4a] focus:ring-4 focus:ring-[#134e4a]/5 outline-none transition-all shadow-sm appearance-none font-semibold text-gray-700 text-sm"
          >
            <option value="all">All Projects</option>
            {buildings.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <i className="las la-building text-lg" />
          </div>
        </div>

        <div className="relative">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white focus:border-[#134e4a] focus:ring-4 focus:ring-[#134e4a]/5 outline-none transition-all shadow-sm appearance-none font-semibold text-gray-700 text-sm"
          >
            <option value="all">Any Status</option>
            <option value="buyer">Buyer</option>
            <option value="renter">Renter</option>
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <i className="las la-filter text-lg" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {t("table.investor")}
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {t("table.phone")}
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {t("table.project")}
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {t("table.block")}
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {t("table.unit")}
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {t("table.m2")}
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {t("table.type")}
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {t("table.delivery")}
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                  {t("table.edit")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-inter">
              {filteredRows.length === 0 ? (
                <tr>
                   <td colSpan={9} className="px-6 py-12 text-center text-gray-400 italic">No investors matching current filters.</td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr
                    key={`${row.id}-${idx}`}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 group-hover:text-[#134e4a] transition-colors">{row.full_name || "—"}</span>
                        {row.email && (
                          <span className="text-[11px] text-gray-400 font-medium lowercase">
                            {row.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-gray-600">
                      {row.phone || "—"}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-black text-[#134e4a]/80">
                        {row.building_name}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-gray-600">{row.block}</td>
                    <td className="px-6 py-5 text-sm font-black text-gray-900">{row.unit}</td>
                    <td className="px-6 py-5 text-sm font-bold text-gray-600">
                      {row.area_m2 != null ? `${row.area_m2} m²` : "—"}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        row.investor_type === "renter" 
                           ? "bg-amber-50 text-amber-700 border-amber-100" 
                          : "bg-blue-50 text-blue-700 border-blue-100"
                      }`}>
                        {row.investor_type === "renter" ? "Renter" : "Buyer"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-gray-500 italic">
                      {row.delivery_period || "—"}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setEditPhone(row.phone ?? "");
                          setEditing(row);
                        }}
                        className="p-2 rounded-lg bg-gray-50 text-[#134e4a] hover:bg-[#134e4a] hover:text-white transition-all shadow-sm inline-flex items-center justify-center"
                      >
                        <i className="las la-pen text-lg" />
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !loading && setEditing(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-[2.5rem] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
               <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">
                    {t("modal.editTitle")}
                  </h2>
                  <p className="text-xs text-gray-400 font-black uppercase tracking-widest mt-1">
                    {editing.building_name} — {editing.block} / {editing.unit}
                  </p>
               </div>
               <button onClick={() => setEditing(null)} className="size-10 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-rose-500 transition-all flex items-center justify-center">
                  <i className="las la-times text-xl" />
               </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
              {error && (
                <p className="text-red-600 text-[10px] font-black uppercase tracking-widest p-4 rounded-xl bg-red-50 border border-red-100" role="alert">
                  {error}
                </p>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">{t("modal.fullName")}</label>
                    <input name="fullName" type="text" defaultValue={editing.full_name ?? ""} className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white outline-none transition-all font-semibold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">{t("modal.email")}</label>
                    <input name="email" type="email" defaultValue={editing.email ?? ""} className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white outline-none transition-all font-semibold" />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">{t("modal.phone")}</label>
                 <div className="w-full [&_.react-international-phone-input-container]:!w-full [&_.react-international-phone-input]:!w-full [&_.react-international-phone-input]:!rounded-xl [&_.react-international-phone-input]:!border-2 [&_.react-international-phone-input]:!border-gray-50 [&_.react-international-phone-input]:!bg-gray-50/50 [&_.react-international-phone-input]:!px-4 [&_.react-international-phone-input]:!py-3 [&_.react-international-phone-input]:!font-semibold">
                   <PhoneInput
                     defaultCountry="tr"
                     value={editPhone}
                     onChange={(value) => setEditPhone(value)}
                     inputProps={{ id: "phone", name: "phone" }}
                   />
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">{t("modal.investorType")}</label>
                    <select name="investorType" defaultValue={editing.investor_type ?? "buyer"} className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white outline-none transition-all font-bold text-sm appearance-none cursor-pointer">
                       <option value="buyer">Buyer</option>
                       <option value="renter">Renter</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">{t("modal.deliveryPeriod")}</label>
                    <input name="deliveryPeriod" type="text" defaultValue={editing.delivery_period ?? ""} className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white outline-none transition-all font-semibold" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">{t("modal.block")}</label>
                    <input name="block" type="text" defaultValue={editing.block} required className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white outline-none transition-all font-semibold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">{t("modal.unit")}</label>
                    <input name="unit" type="text" defaultValue={editing.unit} required className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white outline-none transition-all font-semibold" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">Area (m²)</label>
                    <input name="areaM2" type="number" step="0.01" defaultValue={editing.area_m2 ?? ""} className="w-full px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white outline-none transition-all font-semibold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">Value</label>
                    <div className="flex gap-2">
                       <input name="purchaseValue" type="number" step="0.01" defaultValue={editing.purchase_value ?? ""} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50/50 focus:border-[#134e4a] focus:bg-white outline-none transition-all font-semibold" />
                       <select name="purchaseCurrency" defaultValue={editing.purchase_currency ?? "EUR"} className="w-24 px-2 py-3 rounded-xl border-2 border-gray-50 bg-gray-50/50 outline-none font-bold text-xs">
                          {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
                       </select>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <button type="submit" disabled={loading} className="flex-1 py-4 rounded-2xl bg-[#134e4a] text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-[#115e59] shadow-xl shadow-[#134e4a]/20 transition-all active:scale-[0.98]">
                    {loading ? "Saving..." : "Update Investor Record"}
                 </button>
                 <button type="button" onClick={() => setEditing(null)} className="px-8 py-4 rounded-2xl border-2 border-gray-100 font-black uppercase text-xs tracking-widest text-gray-400 hover:bg-gray-50 transition-all">
                    Cancel
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
