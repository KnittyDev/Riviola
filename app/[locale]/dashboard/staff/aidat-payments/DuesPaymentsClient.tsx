"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/lib/toast";
import type { UnitForDues } from "@/lib/duesPayments";
import { useTranslations, useLocale } from "next-intl";

// Actions are now passed as props to allow demo/production swapping
type ActionResult = { ok?: boolean; error?: string };
type MarkAction = (unitId: string, period: string) => Promise<ActionResult>;
type UnmarkAction = (unitId: string, period: string) => Promise<ActionResult>;
type SettingsAction = (buildingId: string, input: any) => Promise<ActionResult>;

function formatMonthLabel(period: string, locale: string): string {
  const [y, m] = period.split("-").map(Number);
  const date = new Date(y, m - 1, 1);
  return date.toLocaleDateString(locale === "tr" ? "tr-TR" : "en-GB", { month: "short", year: "numeric" });
}

function formatDuesAmount(cents: number, currency: string | null, locale: string): string {
  const symbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    TRY: "₺",
    CHF: "Fr",
    AUD: "A$",
    CAD: "C$",
    NOK: "kr",
    SEK: "kr",
    AED: "د.إ",
    SAR: "﷼",
    ALL: "L",
  };
  const sym = symbols[currency ?? "EUR"] ?? (currency ?? "EUR") + " ";
  const amount = (cents / 100).toLocaleString(locale === "tr" ? "tr-TR" : "en-US", { minimumFractionDigits: 2 });
  
  if (locale === "tr") {
    return `${amount} ${sym}`;
  }
  return `${sym}${amount}`;
}

function isOverdue(period: string, paid: boolean, endDay: number | undefined): boolean {
  if (paid) return false;
  if (!endDay) return false;
  
  const now = new Date();
  const [y, m] = period.split("-").map(Number);
  // The deadline is the endDay of that specific month
  const deadline = new Date(y, m - 1, endDay, 23, 59, 59);
  
  return now > deadline;
}

type Building = { id: string; name: string };

type Props = {
  buildings: Building[];
  selectedBuildingId: string;
  periods: string[];
  settings: {
    payment_window_start_day: number;
    payment_window_end_day: number;
    amount_cents: number | null;
    currency: string | null;
    area_pricing: { min: number; max: number; amount_cents: number }[] | null;
  } | null;
  units: UnitForDues[];
  paidByPeriod: Record<string, Record<string, { paid_at: string | null; marked_by: string | null }>>;
};

export function DuesPaymentsClient({
  buildings,
  selectedBuildingId,
  periods,
  settings,
  units,
  paidByPeriod,
  markDuesPaidFn,
  unmarkDuesPaidFn,
  setSettingsFn,
}: Props & {
  markDuesPaidFn: MarkAction;
  unmarkDuesPaidFn: UnmarkAction;
  setSettingsFn: SettingsAction;
}) {
  const t = useTranslations("Dues");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [startDay, setStartDay] = useState(settings?.payment_window_start_day ?? 4);
  const [endDay, setEndDay] = useState(settings?.payment_window_end_day ?? 12);
  const [amountValue, setAmountValue] = useState(
    settings?.amount_cents != null ? (settings.amount_cents / 100).toFixed(2) : ""
  );
  const [currency, setCurrency] = useState(settings?.currency ?? "EUR");
  const [areaPricing, setAreaPricing] = useState<{ min: string; max: string; amount: string; id: number }[]>(
    (settings?.area_pricing ?? []).map((t, i) => ({
      min: t.min.toString(),
      max: t.max.toString(),
      amount: (t.amount_cents / 100).toFixed(2),
      id: i,
    }))
  );
  const [savingSettings, setSavingSettings] = useState(false);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  function addPricingTier() {
    setAreaPricing((prev) => [...prev, { min: "", max: "", amount: "", id: Date.now() }]);
  }

  function updatePricingTier(id: number, key: "min" | "max" | "amount", value: string) {
    setAreaPricing((prev) => prev.map((t) => (t.id === id ? { ...t, [key]: value } : t)));
  }

  function removePricingTier(id: number) {
    setAreaPricing((prev) => prev.filter((t) => t.id !== id));
  }

  const CURRENCIES = [
    { value: "EUR", label: "EUR (€)" },
    { value: "USD", label: "USD ($)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "TRY", label: "TRY (₺)" },
    { value: "CHF", label: "CHF (Fr)" },
    { value: "AUD", label: "AUD (A$)" },
    { value: "CAD", label: "CAD (C$)" },
    { value: "NOK", label: "NOK (kr)" },
    { value: "SEK", label: "SEK (kr)" },
    { value: "AED", label: "AED (د.إ)" },
    { value: "SAR", label: "SAR (﷼)" },
    { value: "ALL", label: "ALL (L)" },
  ] as const;

  function updateParams(buildingId?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (buildingId != null) params.set("building", buildingId);
    router.push(`/dashboard/staff/aidat-payments?${params.toString()}`);
  }

  async function handleSaveSettings() {
    if (!selectedBuildingId) return;
    setSavingSettings(true);
    const parsed = amountValue.trim() === "" ? null : parseFloat(amountValue);
    const amountCents =
      parsed != null && !Number.isNaN(parsed) && parsed >= 0
        ? Math.round(parsed * 100)
        : null;
        
    const parsedAreaPricing = areaPricing
      .filter((t) => t.min.trim() !== "" && t.max.trim() !== "" && t.amount.trim() !== "")
      .map((t) => {
        const min = parseFloat(t.min) || 0;
        const max = parseFloat(t.max) || 0;
        const amountCents = Math.round((parseFloat(t.amount) || 0) * 100);
        return { min, max, amount_cents: amountCents };
      });

    const result = await setSettingsFn(selectedBuildingId, {
      payment_window_start_day: startDay,
      payment_window_end_day: endDay,
      amount_cents: amountCents ?? null,
      currency: currency || null,
      area_pricing: parsedAreaPricing.length > 0 ? parsedAreaPricing : null,
    });
    setSavingSettings(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(t("saved"));
    setShowSettingsForm(false);
    router.refresh();
  }

  async function handleTogglePaid(unitId: string, period: string, currentlyPaid: boolean) {
    const key = `${unitId}-${period}`;
    setTogglingKey(key);
    const result = currentlyPaid
      ? await unmarkDuesPaidFn(unitId, period)
      : await markDuesPaidFn(unitId, period);
    setTogglingKey(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(currentlyPaid ? t("unmarkPaid") : t("markPaid"));
    router.refresh();
  }

  function isPaid(unitId: string, period: string): boolean {
    return !!paidByPeriod[period]?.[unitId]?.paid_at;
  }

  const filteredUnits = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return units;
    return units.filter((u) =>
      (u.full_name ?? "").toLowerCase().includes(q) ||
      (u.block ?? "").toLowerCase().includes(q) ||
      (u.unit ?? "").toLowerCase().includes(q)
    );
  }, [units, search]);

  const hasAnyOverdue = useMemo(() => {
    const endDay = settings?.payment_window_end_day;
    if (!endDay) return false;
    return filteredUnits.some(u =>
      periods.some(p => isOverdue(p, isPaid(u.id, p), endDay))
    );
  }, [filteredUnits, periods, settings, paidByPeriod]);

  function getExpectedDues(unit: UnitForDues): string {
    if (!settings) return "—";
    
    let expectedCents = settings.amount_cents;
    
    if (settings.area_pricing && settings.area_pricing.length > 0 && unit.area_m2 != null) {
      for (const tier of settings.area_pricing) {
        if (unit.area_m2 >= tier.min && unit.area_m2 <= tier.max) {
          expectedCents = tier.amount_cents;
          break;
        }
      }
    }
    
    if (expectedCents == null) return "—";
    return formatDuesAmount(expectedCents, settings.currency, locale);
  }

  function getOrdinal(n: number) {
    const key = (n % 10).toString();
    if (n >= 11 && n <= 13) return t("ordinal.other");
    return t(`ordinal.${key}` as any, { defaultValue: t("ordinal.other") });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {t("title")}
        </h1>
        <p className="text-gray-500 mt-1">
          {t("subtitle")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <label className="text-sm font-semibold text-gray-700 shrink-0">{t("building")}</label>
        <select
          value={selectedBuildingId}
          onChange={(e) => updateParams(e.target.value)}
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none"
        >
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        
        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-4 bg-white/50 px-4 py-2 rounded-xl border border-gray-100 shadow-sm ml-auto">
          <div className="flex items-center gap-1.5">
            <div className="size-5 rounded-md bg-[#134e4a]/10 text-[#134e4a] flex items-center justify-center border border-[#134e4a]/20">
              <i className="las la-check text-xs font-bold" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t("paid")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-5 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 animate-pulse">
              <i className="las la-exclamation-triangle text-xs" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t("overdue")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-5 rounded-md bg-gray-50 text-gray-400 flex items-center justify-center border border-gray-100">
              <i className="las la-clock text-xs" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t("pending")}</span>
          </div>
        </div>
      </div>

      {hasAnyOverdue && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 animate-pulse shadow-sm shadow-rose-100">
          <div className="size-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <i className="las la-exclamation-circle text-2xl" />
          </div>
          <div>
            <p className="text-rose-900 font-bold text-sm uppercase tracking-tight">{t("overdueDetected")}</p>
            <p className="text-rose-700 text-xs">{t("overdueSubtitle")}</p>
          </div>
        </div>
      )}

      {selectedBuildingId && (
        <>
          <div className="mb-6 p-4 rounded-2xl border border-gray-200 bg-gray-50/80">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-gray-700">
                {settings ? (
                  <span key="window-info">
                    {t.rich("paymentWindowInfo", {
                      start: (
                        <strong key="start">
                          {settings.payment_window_start_day}{getOrdinal(settings.payment_window_start_day)}
                        </strong>
                      ) as any,
                      end: (
                        <strong key="end">
                          {settings.payment_window_end_day}{getOrdinal(settings.payment_window_end_day)}
                        </strong>
                      ) as any
                    })}
                    {settings.amount_cents != null && (
                      <span key="amount-info">
                        {" "}
                        {t.rich("amountPerMonth", {
                          amount: <strong key="amt">{formatDuesAmount(settings.amount_cents, settings.currency, locale)}</strong> as any,
                        })}
                      </span>
                    )}
                  </span>
                ) : (
                  t("setWindowAmount")
                )}
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowSettingsForm(!showSettingsForm);
                  if (!showSettingsForm && settings) {
                    setStartDay(settings.payment_window_start_day);
                    setEndDay(settings.payment_window_end_day);
                    setAmountValue(
                      settings.amount_cents != null
                        ? (settings.amount_cents / 100).toFixed(2)
                        : ""
                    );
                    setCurrency(settings.currency ?? "EUR");
                    setAreaPricing(
                      (settings.area_pricing ?? []).map((t, i) => ({
                        min: t.min.toString(),
                        max: t.max.toString(),
                        amount: (t.amount_cents / 100).toFixed(2),
                        id: i,
                      }))
                    );
                  }
                }}
                className="shrink-0 text-sm font-semibold text-[#134e4a] hover:text-[#115e59]"
              >
                {showSettingsForm ? t("cancel") : t("editWindow")}
              </button>
            </div>
            {showSettingsForm && (
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{t("startDay")}</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={startDay}
                    onChange={(e) => setStartDay(Number(e.target.value))}
                    className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{t("endDay")}</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={endDay}
                    onChange={(e) => setEndDay(Number(e.target.value))}
                    className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{t("amount")}</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="e.g. 420.00"
                    value={amountValue}
                    onChange={(e) => setAmountValue(e.target.value)}
                    className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{t("currency")}</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-gray-500">
                      {t("areaPricing")}
                    </label>
                    <button
                      type="button"
                      onClick={addPricingTier}
                      className="text-xs font-semibold text-[#134e4a] hover:underline"
                    >
                      {t("addTier")}
                    </button>
                  </div>
                  {areaPricing.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">{t("noTiers")}</p>
                  ) : (
                    <div className="space-y-2">
                      {areaPricing.map((tier) => (
                        <div key={tier.id} className="flex flex-wrap items-center gap-2 max-w-xl">
                          <input
                            type="number"
                            min={0}
                            placeholder={t("minM2")}
                            value={tier.min}
                            onChange={(e) => updatePricingTier(tier.id, "min", e.target.value)}
                            className="w-20 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                            title={t("minM2")}
                          />
                          <span className="text-gray-400 text-sm">-</span>
                          <input
                            type="number"
                            min={0}
                            placeholder={t("maxM2")}
                            value={tier.max}
                            onChange={(e) => updatePricingTier(tier.id, "max", e.target.value)}
                            className="w-20 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                            title={t("maxM2")}
                          />
                          <span className="text-gray-400 text-sm">m² →</span>
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder={t("amountShort")}
                            value={tier.amount}
                            onChange={(e) => updatePricingTier(tier.id, "amount", e.target.value)}
                            className="w-24 rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
                            title={t("amountShort")}
                          />
                          <button
                            type="button"
                            onClick={() => removePricingTier(tier.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Remove tier"
                          >
                            <i className="las la-trash-alt" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-full flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="px-6 py-2.5 rounded-xl bg-[#134e4a] text-white text-sm font-semibold hover:bg-[#115e59] disabled:opacity-50 transition-colors"
                  >
                    {savingSettings ? t("saving") : t("saveSettings")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search bar */}
          <div className="mb-4 relative">
            <i className="las la-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full sm:max-w-sm pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:border-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 outline-none shadow-sm transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className="las la-times text-lg" />
              </button>
            )}
          </div>

          {units.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <p className="text-gray-500 font-medium">{t("noUnits")}</p>
              <p className="text-sm text-gray-400 mt-1">{t("assignInvestors")}</p>
            </div>
          ) : filteredUnits.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <div className="size-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <i className="las la-search text-2xl" />
              </div>
              <p className="text-gray-500 font-medium">{t("noSearchResults")}</p>
              <button
                onClick={() => setSearch("")}
                className="mt-3 text-sm font-semibold text-[#134e4a] hover:underline"
              >
                {t("clearSearch")}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80">
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[4rem]">{t("block")}</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[4rem]">{t("unit")}</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[10rem]">{t("investor")}</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[6rem]">{t("duesAmount")}</th>
                      {periods.map((p) => (
                        <th
                          key={p}
                          className="px-2 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center min-w-[3.5rem]"
                          title={formatMonthLabel(p, locale)}
                        >
                          {formatMonthLabel(p, locale)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUnits.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/80">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{u.block}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{u.unit}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[12rem]">{u.full_name ?? "—"}</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">{getExpectedDues(u)}</td>
                        {periods.map((p) => {
                          const paid = isPaid(u.id, p);
                          const overdue = isOverdue(p, paid, settings?.payment_window_end_day);
                          const key = `${u.id}-${p}`;
                          
                          return (
                            <td 
                              key={p} 
                              className={`px-2 py-3 text-center transition-colors ${overdue ? "bg-rose-50/50" : ""}`}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <label className="relative inline-flex items-center justify-center cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    checked={paid}
                                    disabled={togglingKey === key}
                                    onChange={() => handleTogglePaid(u.id, p, paid)}
                                    className="peer h-6 w-6 rounded-lg border-gray-300 accent-[#134e4a] focus:ring-2 focus:ring-[#134e4a]/20 focus:ring-offset-0 opacity-0 absolute z-10 cursor-pointer"
                                    title={paid ? "Paid – click to unmark" : "Unpaid – click to mark paid"}
                                  />
                                  <div className={`size-7 rounded-lg flex items-center justify-center border-2 transition-all
                                    ${paid 
                                      ? "bg-[#134e4a] border-[#134e4a] text-white shadow-sm shadow-[#134e4a]/20" 
                                      : overdue
                                        ? "bg-rose-50 border-rose-300 text-rose-600 animate-pulse shadow-sm shadow-rose-200"
                                        : "bg-white border-gray-200 text-gray-300 group-hover:border-gray-300"
                                    }`}
                                  >
                                    {paid ? (
                                      <i className="las la-check text-sm font-bold" />
                                    ) : overdue ? (
                                      <i className="las la-exclamation-triangle text-sm" />
                                    ) : (
                                      <i className="las la-clock text-sm" />
                                    )}
                                  </div>
                                </label>
                                <span className={`text-[9px] font-bold uppercase tracking-tighter ${
                                  paid ? "text-[#134e4a]" : overdue ? "text-rose-600" : "text-gray-400"
                                }`}>
                                  {paid ? t("paid") : overdue ? t("overdue") : t("pending")}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {buildings.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-500 font-medium">{t("noBuildings")}</p>
          <p className="text-sm text-gray-400 mt-1">{t("addBuildings")}</p>
        </div>
      )}
    </div>
  );
}
