"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    setEditPhone(editing?.phone ?? "");
  }, [editing]);

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

  // Find the blocks of the building currently being edited
  const currentBuildingBlocks = editing 
    ? (buildings.find(b => b.id === editing.building_id)?.blocks ?? [])
    : [];

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("table.investor")}
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("table.phone")}
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("table.project")}
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("table.block")}
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("table.unit")}
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("table.m2")}
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("table.type")}
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {t("table.delivery")}
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                  {t("table.edit")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <tr
                  key={`${row.id}-${idx}`}
                  className="hover:bg-gray-50/80"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{row.full_name || "—"}</p>
                    {row.email && (
                      <a href={`mailto:${row.email}`} className="text-sm text-[#134e4a] hover:underline">
                        {row.email}
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {row.phone ? (
                      <a href={`tel:${row.phone}`} className="text-[#134e4a] hover:underline">
                        {row.phone}
                      </a>
                    ) : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/staff/buildings/${row.building_id}`}
                      className="text-sm font-medium text-[#134e4a] hover:underline"
                    >
                      {row.building_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{row.block}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{row.unit}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {row.area_m2 != null ? `${row.area_m2}` : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                      row.investor_type === "renter" 
                         ? "bg-amber-50 text-amber-700 border-amber-100" 
                        : "bg-blue-50 text-blue-700 border-blue-100"
                    }`}>
                      {row.investor_type === "renter" ? t("table.types.renter") : t("table.types.buyer")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {row.delivery_period || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditPhone(row.phone ?? "");
                        setEditing(row);
                      }}
                      className="text-sm font-medium text-[#134e4a] hover:underline"
                    >
                      {t("table.edit")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => !loading && setEditing(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-investor-title"
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h2 id="edit-investor-title" className="text-lg font-bold text-gray-900">
                {t("modal.editTitle")}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {editing.building_name} – {editing.block} / {editing.unit}
              </p>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <p className="text-red-600 text-sm p-2 rounded-lg bg-red-50" role="alert">
                  {error}
                </p>
              )}
              <div>
                <label className={labelClass}>{t("modal.fullName")}</label>
                <input
                  name="fullName"
                  type="text"
                  defaultValue={editing.full_name ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("modal.email")}</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editing.email ?? ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>{t("modal.phone")}</label>
                <div className="w-full [&_.react-international-phone-input-container]:!w-full [&_.react-international-phone-input]:!w-full [&_.react-international-phone-input]:!rounded-lg [&_.react-international-phone-input]:!border-gray-200 [&_.react-international-phone-input]:!px-3 [&_.react-international-phone-input]:!py-2 [&_.react-international-phone-input]:!text-sm">
                  <PhoneInput
                    defaultCountry="tr"
                    value={editPhone}
                    onChange={(value) => setEditPhone(value)}
                    inputProps={{ 
                      id: "phone", 
                      name: "phone", 
                      placeholder: t("modal.phonePlaceholder") || "+90 5xx xxx xx xx" 
                    }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-medium italic">
                  {t("modal.phoneNote")}
                </p>
              </div>
              <div>
                <label className={labelClass}>{t("modal.investorType")}</label>
                <select
                  name="investorType"
                  defaultValue={editing.investor_type ?? "buyer"}
                  className={inputClass}
                >
                  <option value="buyer">{t("modal.investorTypeOptions.buyer")}</option>
                  <option value="renter">{t("modal.investorTypeOptions.renter")}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t("modal.block")}</label>
                  {currentBuildingBlocks.length > 0 ? (
                    <select
                      name="block"
                      defaultValue={editing.block}
                      required
                      className={inputClass}
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
                <div>
                  <label className={labelClass}>{t("modal.unit")}</label>
                  <input
                    name="unit"
                    type="text"
                    defaultValue={editing.unit}
                    required
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t("modal.area")}</label>
                  <input
                    name="areaM2"
                    type="number"
                    min={0}
                    step={0.01}
                    defaultValue={editing.area_m2 ?? ""}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("modal.deliveryPeriod")}</label>
                  <input
                    name="deliveryPeriod"
                    type="text"
                    defaultValue={editing.delivery_period ?? ""}
                    placeholder="Q3 2026"
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t("modal.purchaseValue")}</label>
                  <input
                    name="purchaseValue"
                    type="number"
                    min={0}
                    step={0.01}
                    defaultValue={editing.purchase_value ?? ""}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("modal.currency")}</label>
                  <select
                    name="purchaseCurrency"
                    defaultValue={editing.purchase_currency ?? "EUR"}
                    className={inputClass}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] disabled:opacity-60"
                >
                  {loading ? t("modal.saving") : t("modal.save")}
                </button>
                <button
                  type="button"
                  onClick={() => !loading && setEditing(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50"
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
